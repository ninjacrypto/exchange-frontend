import React, { useCallback, useState, useEffect, useMemo } from 'react';
import _ from 'lodash';
import { Formik, useField, ErrorMessage, useFormikContext } from 'formik';
import { withNamespaces } from 'react-i18next';
import { connect, useSelector } from 'react-redux';
import { useMutation, queryCache } from 'react-query';
import * as Yup from 'yup';

import { exchangeApi } from 'api';
import { nestedTranslate } from 'utils';
import {
  Box,
  Button,
  Message,
  Text,
  Modal,
  Paragraph,
} from 'components/Wrapped';
import {
  Form,
  IconOption,
  IconValue,
  FormField,
  TextField,
} from 'components/Form';
import { ReactSelect } from 'components/Form/SelectField';
import { RequestWithdrawalCode } from 'pages/Wallet';
import styles from './AddressBook.module.scss';
import { triggerToast } from 'redux/actions/ui';
import instance, { authenticatedInstance } from 'api';

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
    const [, meta] = useField('currency');
    const options = useMemo(
      () =>
        _.sortBy(Object.values(currencySettings), 'fullName')
          .filter(({ walletType }) => !walletType.includes('Fiat'))
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
          {t('currency')}
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
              <ErrorMessage name="currency" />
            </Text>
          </Box>
        )}
      </Box>
    );
  },
);

// const AddressFormOtp = ({ onSuccess, t }) => {
//   const { values } = useFormikContext();
//   const { currency, address, memo } = values;

//   const enabled = currency && address;

//   return (
//     <RequestWithdrawalCode
//       messageText={t('otpMessage')}
//       successText={t('otpSuccessMessage')}
//       buttonText={t('requestOtp')}
//       requestMethod={exchangeApi.requestAddressBookOtp}
//       requestData={{ currency, address, memo }}
//       background="background-3"
//       disabled={!enabled}
//       handleSuccess={onSuccess}
//     />
//   );
// };

export const AddAddressForm = withNamespaces()(
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
      const t = nestedTranslate(translate, 'wallet.addressBook');
      const [currencySettings, setCurrencySettings] = useState();
      const [error, setError] = useState();
      // const [otpSent, setOtpSent] = useState(false);
      // const [tempToken, setTempToken] = useState();
      const [emailtoken, setEmailToken] = useState();
      const [smstoken, setSMSToken] = useState();

      const [mutate] = useMutation(
        data => {
          setError();
          const { ...restData } = data;
          return exchangeApi.addToAddressBook({
            emailtoken,
            smstoken,
            ...restData,
          });
        },
        {
          onSuccess: response => {
            if (response.status === 'Success') {
              queryCache.invalidateQueries('addressBook');
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
          currency: Yup.string().required(),
          label: Yup.string().required(),
          address: Yup.string().required(),
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

      const requestOTPCode = async (
        address,
        currency,
        memo,
        otpType,
      ) => {
        try {
          const { data } = await authenticatedInstance({
            url: '/api/request-otp-addressbook',
            method: 'POST',
            data: {
              Address: address,
              Currency: currency,
              DT_Memo: memo,
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
          {error && (
            <Message background="background-2" margin={{ vertical: 'small' }}>
              {translate(`messages.${error}`)}
            </Message>
          )}
          <Formik
            initialValues={{
              currency: '',
              label: '',
              address: '',
              memo: '',
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
                  onChange={({
                    currency,
                    currencySettings: newCurrencySettings,
                  }) => {
                    setFieldValue('currency', currency);
                    setCurrencySettings(newCurrencySettings);
                  }}
                  currency={currency}
                  t={t}
                />
                <FormField name="label" label={t('label')}>
                  <TextField />
                </FormField>
                <FormField name="address" label={t('newAddress')}>
                  <TextField />
                </FormField>
                {!_.isEmpty(currencySettings?.addressSeparator) && (
                  <FormField name="memo" label={t('tag')}>
                    <TextField />
                  </FormField>
                )}
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
                        _.isEqual(values.address, '') ||
                        _.isEqual(values.currency, '')
                      }
                      onClick={() =>
                        requestOTPCode(
                          values.address,
                          values.currency,
                          values.memo,
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
                          _.isEqual(values.address, '') ||
                          _.isEqual(values.currency, '')
                        }
                        onClick={() =>
                          requestOTPCode(
                            values.address,
                            values.currency,
                            values.memo,
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
              )}
              <FormField
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

export const AddAddressModal = withNamespaces()(
  ({ t: translate, currency }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => setIsOpen(!isOpen);

    const t = nestedTranslate(translate, 'wallet.addressBook');

    return (
      <React.Fragment>
        <Button color="primary" onClick={toggleModal}>
          {t('addAddress')}
        </Button>
        <Modal
          show={isOpen}
          toggleModal={toggleModal}
          width="large"
          pad="medium"
        >
          <AddAddressForm handleSuccess={toggleModal} currency={currency} />
        </Modal>
      </React.Fragment>
    );
  },
);

export const AddAddress = withNamespaces()(({ t }) => {
  return (
    <Box
      direction="row"
      justify="between"
      align="center"
      background="background-2"
    >
      <Paragraph>{t('wallet.addressBook.description')}</Paragraph>
      <div>
        <AddAddressModal />
      </div>
    </Box>
  );
});
