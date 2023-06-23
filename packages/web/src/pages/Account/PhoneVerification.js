import React, { Component, Fragment, useEffect } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Yup from 'yup';
import { requestGauth, enableGauth, disableGauth } from 'redux/actions/gAuth';
import { loadProfile } from 'redux/actions/profile';
import { Box, Text, Button, Paragraph, Heading } from 'components/Wrapped';
import countries from 'i18n-iso-countries';
import { withNamespaces, Trans } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { Field, Formik, ErrorMessage, useFormikContext } from 'formik';
import { Loading } from 'components/Loading';
import { FormField, TextField, SelectField, Form } from 'components/Form';
import styles from './Account.module.scss';
import phoneCodes from 'assets/phone.json';
import { triggerToast, triggerModalOpen } from 'redux/actions/ui';
import instance, { authenticatedInstance } from 'api';
import { Columns } from 'react-bulma-components';

class PhoneVerification extends Component {
  static propTypes = {
    profile: PropTypes.object.isRequired,
    loadProfile: PropTypes.func.isRequired,
    requestGauth: PropTypes.func.isRequired,
    handle2FASubmit: PropTypes.func,
    secretKey: PropTypes.string,
    qrCode: PropTypes.string,
    gAuthEnabled: PropTypes.bool.isRequired,
  };

  state = {
    isMobileOTP: false,
    token: '',
    showDisableForm: false,
    countryList: null
  };

  componentDidMount() {
    countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
    this.renderCountryOptions();
  }

  renderCountryOptions = () => {
    const countryList = countries.getNames('en');
    const finalList =  Object.entries(countryList).map(([countryCode, countryName]) => ({
      value: countryCode,
      label: countryName,
    }))
    this.setState({countryList: finalList}) ;
  }

  async verifyMobileNumber(values) {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'account.phoneVerification');
    if (_.isEqual(values.country_code, '')) {
      triggerToast(t('countryRequired'), 'warning', 2500);
    } else if (_.isEqual(values.mobile_number, '')) {
      triggerToast(t('mobileNumberRequired'), 'warning', 2500);
      return;
    } else {
      let postData = {
        country_code: values.country_code,
        mobile_number: values.mobile_number,
      };

      try {
        const { data } = await instance({
          url: '/api/add-phone-verification-step1',
          method: 'POST',
          data: postData,
        });

        if (data.status === 'Success') {
          triggerToast(data.status, 'success', 2500);
          this.setState({ isMobileOTP: true, token: data.data.token });
        } else {
          triggerToast(data.message, 'error', 2500);
        }
      } catch (e) {}
    }
  }

  async unVerifyMobileNumber() {
    try {
      const { data } = await authenticatedInstance({
        url: '/api/delete-phone-verification-step1',
        method: 'POST',
      });

      if (data.status === 'Success') {
        triggerToast(data.status, 'success', 2500);
        this.setState({ token: data.data.token });
      } else {
        triggerToast(data.message, 'error', 2500);
      }
    } catch (e) {}
  }

  EnableValidationSchema = () => {
    return Yup.object().shape({
      country_code: Yup.string().required(),
      mobile_number: Yup.string().required(),
      sms_otp: Yup.string().min(6).required(),
    });
  };

  DisableValidationSchema = () => {
    return Yup.object().shape({
      sms_otp: Yup.string().min(6).required(),
    });
  };

  handleEnableSubmit = async values => {
    values.token = this.state.token;

    try {
      const { data } = await authenticatedInstance({
        url: `/api/add-phone-verification-step2`,
        method: 'POST',
        data: values,
      });

      if (data.status === 'Success') {
        triggerToast(data.status, 'success', 2500);
        this.props.loadProfile();
        this.setState({ isMobileOTP: false });
      } else {
        triggerToast(data.message, 'error', 2500);
      }
    } catch (e) {}
  };

  handleDisableSubmit = async values => {
    values.token = this.state.token;

    try {
      const { data } = await authenticatedInstance({
        url: `/api/delete-phone-verification-step2`,
        method: 'POST',
        data: values,
      });

      if (data.status === 'Success') {
        triggerToast(data.status, 'success', 2500);
        this.props.loadProfile();
      } else {
        triggerToast(data.message, 'error', 2500);
      }
    } catch (e) {}
  };

  render() {
    const { captchaComplete, isMobileOTP } = this.state;
    const { profile, t: translate } = this.props;
    const mobileNumber = profile.mobileNumber;
    const t = nestedTranslate(translate, 'account.phoneVerification');

    return profile ? (
      <Box pad="none" background="background-3" gap="small">
        {!profile.isMobileVerified && (
          <Box>
            <Formik
              initialValues={{
                country_code: '',
                mobile_number: '',
                sms_otp: '',
                token: '',
              }}
              onSubmit={values => this.handleEnableSubmit(values)}
              validationSchema={this.EnableValidationSchema}
            >
              {({ values }) => (
                <Form>
                  <Box pad="none">
                    <Text
                      style={{
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontWeight: 'bold',
                        marginBottom: '6px',
                      }}
                    >
                      {t('selectCountry')}
                    </Text>
                    <Field
                      name="country_code"
                      component={SelectField}
                      options={this.state.countryList}
                      hasIcon={true}
                      placeholder={t('selectCountry')}
                    />

                    <ErrorMessage
                      name="country_code"
                      component="div"
                      style={{
                        marginTop: '-32px',
                        marginBottom: '10px',
                        padding: '0px 12px',
                      }}
                      className={styles.errorMessage}
                    />
                  </Box>

                  <FormField name="mobile_number" label={t('mobileNumber')}>
                    <TextField
                      type="tel"
                      placeholder={t('mobileNumber')}
                      addonStart={{
                        content:
                          values.country_code &&
                          `+${phoneCodes[`${values.country_code}`]}`,
                      }}
                      addonEnd={{
                        content: t('requestOTP'),
                        background: 'primary',
                        onClick: () => this.verifyMobileNumber(values),
                      }}
                    />
                  </FormField>
                  <Box pad="none" margin={{ bottom: '20px' }}>
                    <FormField name="sms_otp" label={t('mobileOTP')}>
                      <TextField
                        type="text"
                        placeholder={t('mobileOTP')}
                        iconposition="left"
                        disabled={!isMobileOTP}
                        margin={{ bottom: '0px' }}
                      />
                    </FormField>
                    {/* <div>{t('smsVerificationMsg', { mobileNumber })}</div> */}
                  </Box>
                  <Button
                    fill={true}
                    color="primary"
                    type="submit"
                    disabled={values.sms_otp == ''}
                  >
                    {t('enable')}
                  </Button>
                </Form>
              )}
            </Formik>
          </Box>
        )}
        {profile.isMobileVerified && (
          <Box>
            <Formik
              initialValues={{
                sms_otp: '',
                token: '',
              }}
              onSubmit={values => this.handleDisableSubmit(values)}
              validationSchema={this.DisableValidationSchema}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <Columns>
                    <Columns.Column size={8}>
                      <Heading level={4} margin={{ bottom: '10px' }}>
                        {t('country')}: {profile.country}
                      </Heading>
                      <Heading level={4} margin={{ bottom: '20px' }}>
                        {t('mobileNumber')}: {profile.mobileNumber}
                      </Heading>
                    </Columns.Column>
                    <Columns.Column size={4}>
                      {!this.state.showDisableForm && (
                        <div>
                          <Button
                            fill={true}
                            color="primary"
                            type="button"
                            onClick={() =>
                              this.setState({ showDisableForm: true })
                            }
                          >
                            {t('disable')}
                          </Button>
                        </div>
                      )}
                    </Columns.Column>
                  </Columns>
                  {this.state.showDisableForm && (
                    <React.Fragment>
                      <Box pad="none" margin={{ bottom: '20px' }}>
                        <FormField name="sms_otp" label={t('mobileOTP')}>
                          <TextField
                            type="tel"
                            placeholder={t('mobileOTP')}
                            margin={{ bottom: '0px' }}
                            addonEnd={{
                              content: t('requestOTP'),
                              background: 'primary',
                              onClick: () => this.unVerifyMobileNumber(),
                            }}
                          />
                        </FormField>
                        {/* <div>{t('smsVerificationMsg', { mobileNumber })}</div> */}
                      </Box>
                      <Button
                        fill={true}
                        color="primary"
                        type="submit"
                        disabled={values.sms_otp == ''}
                      >
                        {t('submit')}
                      </Button>
                    </React.Fragment>
                  )}
                </Form>
              )}
            </Formik>
          </Box>
        )}
      </Box>
    ) : (
      <Loading />
    );
  }
}

const mapStateToProps = ({
  user,
  auth,
  exchangeSettings: {
    settings: { exchangeName, mfaSettings },
  },
}) => ({
  profile: user.profile,
  secretKey: auth.gAuthSecretKey,
  qrCode: auth.gAuthQrCode,
  gAuthEnabled: auth.gAuthEnabled,
  exchangeName,
  mfaSettings,
});

export default withNamespaces()(
  connect(mapStateToProps, {
    loadProfile,
    requestGauth,
    enableGauth,
    disableGauth,
  })(PhoneVerification),
);
