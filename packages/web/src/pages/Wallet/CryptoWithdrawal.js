import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { Columns } from 'react-bulma-components';
import { Button, Box, Tag, Paragraph } from 'components/Wrapped';
import { FormField, NumberInput, TextField } from 'components/Form';
import {
  getWithdrawalHistory,
  withdrawalRequest,
} from 'redux/actions/portfolio';
import {
  formatNumberToPlaces,
  // hasAddressValidator,
  // validateAddress,
  numberParser,
  convertCurrency,
} from 'utils';
import { ConfirmModal } from 'containers/Modals';
import { nestedTranslate } from 'utils/strings';
import { withNamespaces } from 'react-i18next';
import { WithdrawalHeadingValue } from './Withdrawal';
import RequestWithdrawalCode from './RequestWithdrawalCode';
import { exchangeApi } from 'api';
import {
  AddressBookSelect,
  useAddressWhitelistStatus,
} from 'containers/AddressBook';
import { authenticatedInstance } from 'api';
import { triggerToast, triggerModalOpen } from 'redux/actions/ui';
import styles from './Wallet.module.scss';

const FIXED = 'Fixed';
const PERCENTAGE = 'Percentage';
const BOTH = 'Fixed + Percentage';

const AddressBookSelectField = withNamespaces()(
  ({ currency, addressWhitelistEnabled, t }) => {
    const { setFieldValue } = useFormikContext();

    const handleChange = ({ value: { Address, DT_Memo } }) => {
      setFieldValue('address', Address);
      setFieldValue('addressTag', DT_Memo);
    };

    return (
      <Box pad="none" gap="small" margin={{ bottom: 'small' }}>
        <Box pad="small" background="background-2">
          <Paragraph>
            {addressWhitelistEnabled
              ? t('wallet.addressBook.selectAddressWhitelist')
              : t('wallet.addressBook.selectAddress')}
          </Paragraph>
        </Box>
        <AddressBookSelect currency={currency} onChange={handleChange} />
      </Box>
    );
  },
);

// const WithdrawalFormOtp = ({ onSuccess, t, currency }) => {
//   const { values } = useFormikContext();
//   const { address, amount } = values;

//   let enabled = false;
//   if (amount > 0 && address !== '') {
//     enabled = true;
//   }
//   return (
//     <RequestWithdrawalCode
//       messageText={t('emailOtpMessage')}
//       successText={t('emailOtpSuccessMessage')}
//       buttonText={t('emailOtpButton')}
//       requestMethod={exchangeApi.requestWithdrawalCode}
//       requestData={{ currency, address, amount }}
//       background="background-3"
//       disabled={!enabled}
//       handleSuccess={onSuccess}
//     />
//   );
// };

const AmountFields = withNamespaces()(
  ({
    currency,
    t: translate,
    balance,
    decimalPrecision,
    currencyCode,
    fiatConverted,
    currencyInfo,
  }) => {
    const t = nestedTranslate(translate, 'forms.walletWithdrawal');

    const withdrawalServiceChargeFixed = formatNumberToPlaces(
      _.get(currencyInfo, 'withdrawalServiceChargeFixed'),
    );
    const withdrawalServiceChargePercentage = formatNumberToPlaces(
      _.get(currencyInfo, 'withdrawalServiceChargePercentage'),
    );

    const {
      setFieldValue,
      values: { paymentAmount },
    } = useFormikContext();

    const handleValueUpdate = useCallback(
      (name, value) => {
        if (name === 'amount') {
          const amount = convertCurrency(value, {
            from: currency,
            to: currencyCode,
          });
          setFieldValue('fiatAmount', amount);
        }

        if (name === 'fiatAmount') {
          const amount = convertCurrency(value, {
            from: currencyCode,
            to: currency,
          });
          setFieldValue('amount', amount);
        }
      },
      [setFieldValue],
    );

    const handleChange = useCallback(
      e => {
        const {
          target: { name, value },
        } = e;
        const newValue = numberParser.parse(value);
        handleValueUpdate(name, newValue);
      },
      [handleValueUpdate],
    );

    return (
      <div>
        <Columns className={styles.columnsRow}>
          <Columns.Column className={styles.columnsCol}>
            <FormField name="amount" label={t('amount.placeholder')}>
              <NumberInput
                type="text"
                addonEnd={{
                  content: `${formatNumberToPlaces(balance)} ${currency}`,
                  onClick: () => {
                    let fixedFee = parseFloat(withdrawalServiceChargeFixed);
                    let percFee = parseFloat(withdrawalServiceChargePercentage);

                    let amount = balance;
                    if (fixedFee > 0) {
                      amount = amount - fixedFee;
                    }
                    if (percFee>0){ 
                      amount =  formatNumberToPlaces(((amount * 100) / (100 + percFee)), 8)
                    }
                    setFieldValue('amount',  amount )
                  },
                  background: 'primary',
                }}
                inputOnChange={handleChange}
                precision={decimalPrecision}
              />
            </FormField>
          </Columns.Column>
          <Columns.Column className={styles.columnsCol}>
            <FormField
              name="fiatAmount"
              label={`${currencyCode} ${t('amount.placeholder')}`}
            >
              <NumberInput
                type="text"
                addonEnd={{
                  content: `${formatNumberToPlaces(
                    fiatConverted,
                    2,
                  )} ${currencyCode}`,
                  // onClick: () => setFieldValue('fiatAmount', fiatConverted),
                  background: 'primary',
                }}
                inputOnChange={handleChange}
                precision={2}
              />
            </FormField>
          </Columns.Column>
        </Columns>
      </div>
    );
  },
);

const FiatConvert = ({ currencyCode, balance, currency }) => {
  const value = convertCurrency(balance, {
    from: currency,
    to: currencyCode,
  });

  return `${formatNumberToPlaces(value, 2)} ${currencyCode}`;
};

const Withdrawals = ({
  currency,
  currencyInfo,
  withdrawalRequest,
  t: translate,
  balanceInfo: { balance, balanceInTrade, totalBalance },
  calculateServiceCharge,
  decimalPrecision,
  gAuthEnabled,
  currencyCode,
  isMobileVerified,
  email,
  mobileNumber,
}) => {
  const t = nestedTranslate(translate, 'forms.walletWithdrawal');
  const ts = nestedTranslate(translate, 'wallet.withdrawals');

  const { data: addressWhitelistData } = useAddressWhitelistStatus();
  const [modalOpen, setModalOpen] = useState(false);
  const [emailOtpSuccess, setEmailOtpSuccess] = useState(false);
  const [addressWhitelistEnabled, setAddressWhitelistEnabled] = useState(false);
  const closeModal = () => setModalOpen(false);
  const [emailToken, setEmailToken] = useState('');
  const [smsToken, setSMSToken] = useState('');
  const [fiatConverted, setFiatConverted] = useState('');

  const hasAddressTag = !_.isEmpty(currencyInfo.addressSeparator);
  const isUsingGAuth = gAuthEnabled;
  let addressTagType = 'addressTag';

  if (hasAddressTag && currencyInfo.addressSeparator.includes('memoid')) {
    addressTagType = 'memoId';
  }

  useEffect(() => {
    if (addressWhitelistData?.status === 'Success') {
      setAddressWhitelistEnabled(addressWhitelistData.data);
    }
  }, [addressWhitelistData]);

  useEffect(() => {
    convertFiat();
  });

  const confirmWithdrawal = (values, resetForm) => {
    delete values.fiatAmount;
    // delete values.gauth_code;
    withdrawalRequest(
      { ...values },
      {
        cb: () => {
          resetForm();
          setEmailOtpSuccess(false);
        },
        hasAddressTag,
      },
    );
    closeModal();
  };

  const testAddress = address => {
    if (address.length < 10) {
      return false;
      // console.log('hi', currencyInfo)
      // const hasValidation = hasAddressValidator(currencyInfo.shortName);

      // if (!hasValidation) {
      //   return true;
      // }
      // return validateAddress(address.trim(), currencyInfo.shortName);
    }
    return true;
  };

  const convertFiat = () => {
    const value = convertCurrency(balance, {
      from: currency,
      to: currencyCode,
    });

    setFiatConverted(value);
    return value;
  };

  const validationSchema = () => {
    return Yup.object().shape({
      amount: Yup.number()
        .typeError(translate('forms.validations.required'))
        .required()
        .min(currencyInfo.minWithdrawalLimit),
      address: Yup.string()
        .required()
        .test(
          'addressValidation',
          translate('forms.validations.invalidAddress', {
            currencyName: currencyInfo.fullName,
          }),
          testAddress,
        ),
      email_otp: Yup.string()
        .required()
        .min(6),
      gauth_code: isUsingGAuth
        ? Yup.string()
            .required()
            .min(6)
        : Yup.string(),
      sms_otp: isMobileVerified
        ? Yup.string()
            .required()
            .min(6)
        : Yup.string(),
    });
  };

  const renderWithdrawalServiceCharge = currency => {
    const withdrawalServiceChargeType = _.get(
      currencyInfo,
      'withdrawalServiceChargeType',
    );
    const withdrawalServiceChargeFixed = formatNumberToPlaces(
      _.get(currencyInfo, 'withdrawalServiceChargeFixed'),
    );
    const withdrawalServiceChargePercentage = formatNumberToPlaces(
      _.get(currencyInfo, 'withdrawalServiceChargePercentage'),
    );

    switch (withdrawalServiceChargeType) {
      case FIXED:
        return {
          fixedCharge: `${withdrawalServiceChargeFixed} ${currency}`,
          PercentageCharge: null,
        };
      case PERCENTAGE:
        return {
          PercentageCharge: `${withdrawalServiceChargePercentage}%`,
          fixedCharge: null,
        };
      case BOTH:
        return {
          fixedCharge: `${withdrawalServiceChargeFixed} ${currency}`,
          PercentageCharge: `${withdrawalServiceChargePercentage}%`,
        };
      default:
        return '';
    }
  };
  // const { values } = useFormikContext();
  // if(values !== undefined){
  //   const {address, amount } = values;

  //   const enabled = currency && address;
  // }
  // const handleOtpSuccess = data => {
  //   setEmailOtpSuccess(true);
  //   setTempToken(data.token);
  // };

  const requestEmailCode = async (values, currency, otpType) => {
    const { amount, address } = values;

    if (amount > 0 && address !== '') {
      try {
        const { data } = await authenticatedInstance({
          url: '/api/RequestWithdraw_EmailOTP',
          method: 'POST',
          data: {
            amount: amount,
            currency: currency,
            address: address,
            otp_type: otpType,
          },
        });

        if (data.status === 'Success') {
          if (otpType === 'sms') {
            setSMSToken(data.data.token);
          } else if (otpType === 'email') {
            setEmailToken(data.data.token);
          }

          triggerToast(data.message, 'success');
        } else {
          triggerToast(data.message, 'error');
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  const { fixedCharge, PercentageCharge } = renderWithdrawalServiceCharge(
    currency,
  );

  return (
    <React.Fragment>
      <Box pad={{ vertical: 'small' }}>
        <WithdrawalHeadingValue
          heading={ts('totalBalance')}
          value={`${formatNumberToPlaces(totalBalance)} ${currency}`}
        />
        <WithdrawalHeadingValue
          heading={ts('inOrders')}
          value={`${formatNumberToPlaces(balanceInTrade)} ${currency}`}
        />
        <WithdrawalHeadingValue
          heading={ts('availableBalance')}
          value={`${formatNumberToPlaces(balance)} ${currency}`}
        />
      </Box>
      <Box background="background-4">
        <Paragraph color="status-warning">{ts('warning')}</Paragraph>
        <Tag.Group>
          {!_.isEqual(fixedCharge, null) && _.isEqual(PercentageCharge, null) && (
            <Tag>
              {ts('fee')} {`${fixedCharge}`}
            </Tag>
          )}
          {_.isEqual(fixedCharge, null) && !_.isEqual(PercentageCharge, null) && (
            <Tag>
              {ts('fee')} {`${PercentageCharge}`}
            </Tag>
          )}
          {!_.isEqual(fixedCharge, null) && !_.isEqual(PercentageCharge, null) && (
            <Tag>
              {ts('fee')} {`${fixedCharge} + ${PercentageCharge}`}
            </Tag>
          )}
        </Tag.Group>
        {!_.isEmpty(currencyInfo) ? (
          <Formik
            validationSchema={validationSchema()}
            initialValues={{
              fiatAmount: '',
              amount: '',
              address: '',
              addressTag: '',
              gauth_code: '',
              email_otp: '',
              sms_otp: '',
            }}
            onSubmit={(values, actions) => setModalOpen(true)}
          >
            {({ values, setFieldValue, resetForm }) => {
              const {
                serviceCharge,
                balanceAfter,
                willReceive,
              } = calculateServiceCharge(balance, values.amount);

              return (
                <Form>
                  <AddressBookSelectField
                    currency={currency}
                    addressWhitelistEnabled={addressWhitelistEnabled}
                  />
                  <FormField
                    name="address"
                    label={t('address.placeholder', { currency })}
                  >
                    <TextField
                      type="text"
                      placeholder={t('address.placeholder', { currency })}
                      disabled={addressWhitelistEnabled}
                    />
                  </FormField>

                  <FormField
                    name="addressTag"
                    label={t(`${addressTagType}.placeholder`, { currency })}
                    hidden={!hasAddressTag}
                  >
                    <TextField
                      type="text"
                      placeholder={t(`${addressTagType}.placeholder`, {
                        currency,
                      })}
                      disabled={addressWhitelistEnabled}
                    />
                  </FormField>

                  <AmountFields
                    fiatConverted={fiatConverted}
                    balance={balance}
                    currency={currency}
                    decimalPrecision={decimalPrecision}
                    currencyCode={currencyCode}
                    currencyInfo={currencyInfo}
                  />

                  <Box pad="none" className={styles.verificationFieldBox}>
                    <Box pad="none" className={styles.fieldBox}>
                      <Box pad="none" margin={{ bottom: '20px' }}>
                        <FormField
                          name="email_otp"
                          label={t('emailandSMSVerificationCode.placeholder')}
                        >
                          <TextField
                            type="text"
                            placeholder={t(
                              'emailandSMSVerificationCode.placeholder',
                            )}
                            className={styles.modifiedTextField}
                            margin={{ bottom: '0px' }}
                          />
                        </FormField>
                        <div>{t('emailVerificationMsg', { email })}</div>
                      </Box>
                    </Box>
                    <Box pad="none">
                      <div style={{ marginBottom: '2px' }}>&nbsp;</div>
                      <Button
                        color="primary"
                        type="button"
                        disabled={values.amount <= 0 || values.address == ''}
                        onClick={() =>
                          requestEmailCode(values, currency, 'email')
                        }
                        className={styles.modifiedBtnAddon}
                      >
                        {t('emailOtpButton')}
                      </Button>
                    </Box>
                  </Box>

                  {/* {!isUsingGAuth && (
                    // <RequestWithdrawalCode
                    //   requestMethod={exchangeApi.requestWithdrawalCode}
                    //   messageText={t('emailOtpMessage')}
                    //   buttonText={t('emailOtpButton')}
                    //   successText={t('emailOtpSuccessMessage')}
                    //   successState={emailOtpSuccess}
                    //   handleSuccess={() => setEmailOtpSuccess(true)}
                    // />
                    <WithdrawalFormOtp onSuccess={handleOtpSuccess} t={t} currency={currency} />
                  )} */}
                  {isMobileVerified && (
                    <Box pad="none" className={styles.verificationFieldBox}>
                      <Box pad="none" className={styles.fieldBox}>
                        <Box pad="none" margin={{ bottom: '20px' }}>
                          <FormField
                            name="sms_otp"
                            label={t('smsVerificationCode.placeholder')}
                            margin={{ bottom: '20px' }}
                          >
                            <TextField
                              type="text"
                              placeholder={t('smsVerificationCode.placeholder')}
                              className={styles.modifiedTextField}
                              margin={{ bottom: '0px' }}
                            />
                          </FormField>
                          <div>{t('smsVerificationMsg', { mobileNumber })}</div>
                        </Box>
                      </Box>
                      <Box pad="none">
                        <div style={{ marginBottom: '2px' }}>&nbsp;</div>
                        <Button
                          color="primary"
                          type="button"
                          disabled={values.amount <= 0 || values.address == ''}
                          onClick={() =>
                            requestEmailCode(values, currency, 'sms')
                          }
                          className={styles.modifiedBtnAddon}
                        >
                          {t('emailOtpButton')}
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {isUsingGAuth && (
                    <FormField
                      name="gauth_code"
                      label={translate('forms.common.gAuth')}
                    >
                      <TextField
                        type="text"
                        placeholder={translate('forms.common.gAuth')}
                      />
                    </FormField>
                  )}

                  <WithdrawalHeadingValue
                    heading={translate('wallet.withdrawals.serviceCharge')}
                    value={
                      <span>
                        {formatNumberToPlaces(serviceCharge)}&nbsp;{currency}
                        &nbsp;~&nbsp;
                        <FiatConvert
                          currencyCode={currencyCode}
                          balance={serviceCharge}
                          currency={currency}
                        />
                      </span>
                    }
                  />

                  <WithdrawalHeadingValue
                    heading={translate('wallet.withdrawals.willReceive')}
                    value={
                      <span>
                        {formatNumberToPlaces(willReceive)}&nbsp;{currency}
                        &nbsp;~&nbsp;
                        <FiatConvert
                          currencyCode={currencyCode}
                          balance={willReceive}
                          currency={currency}
                        />
                      </span>
                    }
                  />

                  <WithdrawalHeadingValue
                    heading={translate('wallet.withdrawals.balanceAfter')}
                    value={
                      <span>
                        {formatNumberToPlaces(balanceAfter)}&nbsp;{currency}
                        &nbsp;~&nbsp;
                        <FiatConvert
                          currencyCode={currencyCode}
                          balance={balanceAfter}
                          currency={currency}
                        />
                      </span>
                    }
                  />

                  <Button
                    color="primary"
                    type="submit"
                    disabled={balanceAfter < 0 || (values.amount || 0) <= 0}
                  >
                    {translate('buttons.submit')}
                  </Button>

                  <ConfirmModal
                    show={modalOpen}
                    onClose={closeModal}
                    confirm={() => {
                      if (isMobileVerified) {
                        values.sms_token = smsToken;
                      }
                      confirmWithdrawal(
                        {
                          ...values,
                          amount: willReceive,
                          email_token: emailToken,
                          currency,
                        },
                        resetForm,
                      );
                    }}
                    title={t('confirmWithdrawal')}
                  >
                    <WithdrawalHeadingValue
                      heading={translate(
                        'wallet.withdrawals.withdrawalAddress',
                      )}
                      value={values.address}
                    />

                    {hasAddressTag && (
                      <WithdrawalHeadingValue
                        heading={translate('wallet.withdrawals.withdrawalTag')}
                        value={values.addressTag}
                      />
                    )}

                    <WithdrawalHeadingValue
                      heading={translate('wallet.withdrawals.withdrawalAmount')}
                      value={`${formatNumberToPlaces(
                        values.amount,
                      )} ${currency}`}
                    />

                    <WithdrawalHeadingValue
                      heading={translate('wallet.withdrawals.serviceCharge')}
                      value={`${formatNumberToPlaces(serviceCharge)}
                      ${currency}`}
                    />

                    <WithdrawalHeadingValue
                      heading={translate('wallet.withdrawals.willReceive')}
                      value={`${formatNumberToPlaces(willReceive)}
                      ${currency}`}
                    />

                    <WithdrawalHeadingValue
                      heading={translate('wallet.withdrawals.balanceAfter')}
                      value={`${formatNumberToPlaces(balanceAfter)}
                          ${currency}`}
                    />
                  </ConfirmModal>
                </Form>
              );
            }}
          </Formik>
        ) : null}
      </Box>
    </React.Fragment>
  );
};

const mapStateToProps = ({
  portfolio: { addresses, portfolios },
  exchangeSettings: { currencyCode },
  auth: { gAuthEnabled },
  user: {
    profile: { isMobileVerified, email, mobileNumber },
  },
}) => ({
  addresses,
  portfolios,
  currencyCode,
  gAuthEnabled,
  isMobileVerified,
  email,
  mobileNumber,
});

export default withRouter(
  withNamespaces()(
    connect(mapStateToProps, {
      getWithdrawalHistory,
      withdrawalRequest,
      triggerToast,
    })(Withdrawals),
  ),
);
