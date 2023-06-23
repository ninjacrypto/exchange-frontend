import React, { useCallback, useState, useEffect, useMemo } from 'react';
import _ from 'lodash';
import {
  Formik,
  useField,
  ErrorMessage,
  useFormikContext,
  Field,
} from 'formik';
import { withNamespaces } from 'react-i18next';
import { connect, useSelector } from 'react-redux';
import { useMutation, queryCache } from 'react-query';
import * as Yup from 'yup';
import instance, { authenticatedInstance } from 'api';
import { exchangeApi } from 'api';
import { nestedTranslate } from 'utils';
import {
  Box,
  Button,
  Message,
  Text,
  Modal,
  Paragraph,
  Columns,
  Column,
} from 'components/Wrapped';
import {
  Form,
  IconOption,
  IconValue,
  FormField,
  TextField,
  SelectField,
} from 'components/Form';
import { ReactSelect } from 'components/Form/SelectField';
import { triggerToast } from 'redux/actions/ui';
import { RequestWithdrawalCode } from 'pages/Wallet';
import styles from './Bank.module.scss';

const mapStateToProps = ({
  exchangeSettings: { currencySettings },
  user: {
    profile: { isMobileVerified, email, mobileNumber },
  },
}) => ({
  currencySettings,
  isMobileVerified,
  email,
  mobileNumber,
});

const CurrencySelect = connect(mapStateToProps)(
  ({ onChange, currencySettings, currency, t }) => {
    const [option, setOption] = useState();
    const [, meta] = useField('AccountCurrency');

    let avi = window.location.href.substring(
      window.location.href.lastIndexOf('/') + 1,
    );
    currency = avi;

    const options = useMemo(
      () =>
        _.sortBy(Object.values(currencySettings), 'fullName')
          .filter(({ walletType }) => walletType.includes('Fiat'))
          .map(({ shortName: currency, fullName }) => ({
            value: currency,
            label: `${fullName} (${currency})`,
          })),
      [currencySettings],
    );

    const handleChange = useCallback(
      ({ value, label }) => {
        setOption({ value, label });
        onChange({
          currency: value,
          currencySettings: _.get(currencySettings, value),
        });
      },
      [currencySettings, onChange],
    );

    useEffect(() => {
      const defaultValue = _.find(options, { value: currency });
      if (defaultValue) {
        handleChange(defaultValue);
      }
    }, [currency, options]);

    return (
      <Box pad="none" gap="xsmall" margin={{ bottom: 'small' }}>
        <Text size="small" weight="bold">
          {t('accountCurrency')}
        </Text>
        <ReactSelect
          options={options}
          components={{ Option: IconOption, SingleValue: IconValue }}
          onChange={handleChange}
          value={option}
          margin="none"
        />
        {meta.touched && meta.error && (
          <Box pad={{ horizontal: 'small' }} align="start">
            <Text color="status-error" size="xsmall">
              <ErrorMessage name="AccountCurrency" />
            </Text>
          </Box>
        )}
      </Box>
    );
  },
);

// const AddressFormOtp = ({ onSuccess, t }) => {
//   const { values } = useFormikContext();
//   const { BankName, AccountCurrency, AccountNumber } = values;

//   const enabled = AccountCurrency && AccountNumber && BankName;

//   return (
//     <RequestWithdrawalCode
//       messageText={t('otpMessage')}
//       successText={t('otpSuccessMessage')}
//       buttonText={t('requestOtp')}
//       requestMethod={exchangeApi.requestFiatCustomerAccountOtp}
//       requestData={{ BankName, AccountCurrency, AccountNumber }}
//       background="background-3"
//       disabled={!enabled}
//       handleSuccess={onSuccess}
//     />
//   );
// };

export const AddBanksForm = withNamespaces()(
  connect(mapStateToProps)(
    ({
      t: translate,
      currency,
      handleSuccess,
      isMobileVerified,
      email,
      mobileNumber,
    }) => {
      const gAuthEnabled = useSelector(
        ({ auth: { gAuthEnabled } }) => gAuthEnabled,
      );
      const t = nestedTranslate(translate, 'wallet.banks');
      // const [otpSent, setOtpSent] = useState(false);
      // const [tempToken, setTempToken] = useState();
      const [emailtoken, setEmailToken] = useState();
      const [smstoken, setSMSToken] = useState();

      useEffect(() => {
        // Update the document title using the browser API
        // console.log(window.location.href.substring(window.location.href.lastIndexOf('/') + 1));
      });

      const [mutate] = useMutation(
        data => {
          const { ...restData } = data;
          return exchangeApi.addFiatCustomerAccount({
            emailtoken,
            smstoken,
            ...restData,
          });
        },
        {
          onSuccess: response => {
            if (response.status === 'Success') {
              queryCache.invalidateQueries('banks');
              triggerToast(response.message, 'success', 2500);
              if (handleSuccess) {
                handleSuccess();
              }
            } else {
              triggerToast(response.message, 'error', 2500);
              // setError(response.message);
            }
          },
        },
      );

      // const handleOtpSuccess = ({ temp_token }) => {
      //   setOtpSent(true);
      //   setTempToken(temp_token);
      // };

      const validationSchema = () => {
        return Yup.object().shape({
          BankName: Yup.string().required(),
          AccountCurrency: Yup.string().required(),
          AccountType: Yup.string().required(),
          AccountNumber: Yup.string().required(),
          BankRoutingCode: Yup.string().required(),
          SwiftCode: Yup.string().required(),
          emailotp: Yup.string()
            .required()
            .min(6),
          gauth_code: gAuthEnabled
            ? Yup.string()
                .required()
                .min(6)
            : Yup.string(),
          smsotp: isMobileVerified
            ? Yup.string()
                .required()
                .min(6)
            : Yup.string(),
        });
      };

      const defaultTypeOptions = () => {
        return [
          { value: 'Savings', label: 'Savings' },
          { value: 'Checking', label: 'Checking' },
        ];
      };

      const requestOTPCode = async (
        BankName,
        AccountCurrency,
        AccountNumber,
        otpType,
      ) => {
        try {
          const { data } = await authenticatedInstance({
            url: '/api/Request-otp-fiat-customer-accounts',
            method: 'POST',
            data: {
              BankName: BankName,
              AccountCurrency: AccountCurrency,
              AccountNumber: AccountNumber,
              type: otpType,
            },
          });

          if (data.status === 'Success') {
            if (otpType === 'sms') {
              setSMSToken(data.data.temp_token);
            } else if (otpType === 'email') {
              setEmailToken(data.data.temp_token);
            }

            triggerToast(data.status, 'success');
          } else {
            triggerToast(data.message, 'error');
          }
        } catch (e) {
          console.log(e);
        }
      };

      return (
        <React.Fragment>
          <Formik
            initialValues={{
              BankName: '',
              AccountCurrency: '',
              AccountType: '',
              AccountNumber: '',
              BankRoutingCode: '',
              SwiftCode: '',
              gauth_code: '',
              smsotp: '',
              emailotp: '',
            }}
            validationSchema={validationSchema()}
            onSubmit={values => mutate(values)}
          >
            {({ setFieldValue, values }) => (
              <Form>
                <CurrencySelect
                  onChange={({ currency }) => {
                    setFieldValue('AccountCurrency', currency);
                  }}
                  currency={currency}
                  t={t}
                />

                <Box pad="none" gap="xsmall" margin={{ bottom: 'small' }}>
                  <Text size="small" weight="bold">
                    {t('accountType')}
                  </Text>
                  <Field
                    name="AccountType"
                    component={SelectField}
                    options={defaultTypeOptions()}
                    margin="none"
                  />
                  <Box pad={{ horizontal: 'small' }} align="start">
                    <Text color="status-error" size="xsmall">
                      <ErrorMessage name="AccountType" />
                    </Text>
                  </Box>
                </Box>
                <FormField name="AccountNumber" label={t('accountNumber')}>
                  <TextField />
                </FormField>
                <FormField name="BankName" label={t('bankName')}>
                  <TextField />
                </FormField>
                <FormField name="BankRoutingCode" label={t('bankRoutingCode')}>
                  <TextField />
                </FormField>
                <FormField name="SwiftCode" label={t('swiftCode')}>
                  <TextField />
                </FormField>
                <Box pad="none" className={styles.verificationFieldBox}>
                  <Box pad="none" className={styles.fieldBox}>
                    <Box pad="none" margin={{ bottom: '20px' }}>
                      <FormField
                        name="emailotp"
                        label={translate(
                          'forms.walletWithdrawal.emailandSMSVerificationCode.placeholder',
                        )}
                      >
                        <TextField
                          type="text"
                          placeholder={translate(
                            'forms.walletWithdrawal.emailandSMSVerificationCode.placeholder',
                          )}
                          className={styles.modifiedTextField}
                          margin={{ bottom: '0px' }}
                        />
                      </FormField>
                      <div>
                        {translate(
                          'forms.walletWithdrawal.emailVerificationMsg',
                          { email },
                        )}
                      </div>
                    </Box>
                  </Box>
                  <Box pad="none">
                    <div style={{ marginBottom: '2px' }}>&nbsp;</div>
                    <Button
                      color="primary"
                      type="button"
                      disabled={
                        _.isEqual(values.BankName, '') ||
                        _.isEqual(values.AccountCurrency, '') ||
                        _.isEqual(values.AccountNumber, '')
                      }
                      onClick={() =>
                        requestOTPCode(
                          values.BankName,
                          values.AccountCurrency,
                          values.AccountNumber,
                          'email',
                        )
                      }
                      className={styles.modifiedBtnAddon}
                    >
                      {translate('forms.walletWithdrawal.emailOtpButton')}
                    </Button>
                  </Box>
                </Box>
                {isMobileVerified && (
                  <Box pad="none" className={styles.verificationFieldBox}>
                    <Box pad="none" className={styles.fieldBox}>
                      <Box pad="none" margin={{ bottom: '20px' }}>
                        <FormField
                          name="smsotp"
                          label={translate(
                            'forms.walletWithdrawal.smsVerificationCode.placeholder',
                          )}
                        >
                          <TextField
                            type="text"
                            placeholder={translate(
                              'forms.walletWithdrawal.smsVerificationCode.placeholder',
                            )}
                            className={styles.modifiedTextField}
                            margin={{ bottom: '0px' }}
                          />
                        </FormField>
                        <div>
                          {translate(
                            'forms.walletWithdrawal.smsVerificationMsg',
                            { mobileNumber },
                          )}
                        </div>
                      </Box>
                    </Box>
                    <Box pad="none">
                      <div style={{ marginBottom: '2px' }}>&nbsp;</div>
                      <Button
                        color="primary"
                        type="button"
                        disabled={
                          _.isEqual(values.BankName, '') ||
                          _.isEqual(values.AccountCurrency, '') ||
                          _.isEqual(values.AccountNumber, '')
                        }
                        onClick={() =>
                          requestOTPCode(
                            values.BankName,
                            values.AccountCurrency,
                            values.AccountNumber,
                            'sms',
                          )
                        }
                        className={styles.modifiedBtnAddon}
                      >
                        {translate('forms.walletWithdrawal.emailOtpButton')}
                      </Button>
                    </Box>
                  </Box>
                )}
                {gAuthEnabled && (
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

                {/* {!gAuthEnabled && (
                <AddressFormOtp onSuccess={handleOtpSuccess} t={t} />
              )} */}
                {/* <FormField
                name="authCode"
                label={
                  gAuthEnabled ? translate('forms.common.gAuth') : t('otpCode')
                }
              >
                <TextField disabled={gAuthEnabled ? false : !otpSent} />
              </FormField> */}
                <Button color="primary" type="submit">
                  {translate('buttons.submit')}
                </Button>
              </Form>
            )}
          </Formik>
        </React.Fragment>
      );
    },
  ),
);

export const AddBanksModal = withNamespaces()(({ t: translate, currency }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => setIsOpen(!isOpen);

  const t = nestedTranslate(translate, 'wallet.banks');

  const customizedCss = {
    overflow: 'auto',
    maxHeight: '90vh',
  };

  return (
    <React.Fragment>
      <Button color="primary" onClick={toggleModal}>
        {t('addBanks')}
      </Button>
      <Modal
        show={isOpen}
        toggleModal={toggleModal}
        width="large"
        pad="medium"
        customize={customizedCss}
      >
        <AddBanksForm handleSuccess={toggleModal} currency={currency} />
      </Modal>
    </React.Fragment>
  );
});

export const AddBanks = withNamespaces()(({ t }) => {
  return (
    <Box
      direction="row"
      justify="between"
      align="center"
      background="background-2"
    >
      <Paragraph>{t('wallet.banks.description')}</Paragraph>
      <div>
        <AddBanksModal />
      </div>
    </Box>
  );
});
