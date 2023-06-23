import React, { Component, useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import cx from 'classnames';
import * as Yup from 'yup';
import { withNamespaces } from 'react-i18next';
import { Button, Box } from 'components/Wrapped';
import styles from './Authentication.module.scss';
import {
  forgotPassword,
  USER_FORGOT_PASSWORD_STARTED,
} from 'redux/actions/profile';
import { Formik, useFormikContext } from 'formik';
import { TextField, Form } from 'components/Form';
import { AuthenticationContainer } from 'pages/Authentication';
import { Captcha } from 'components/Captcha';
import { nestedTranslate } from 'utils/strings';
import instance, { authenticatedInstance, setBearer, exchangeApi } from 'api';
import raw from '../../public.pem';
import _ from 'lodash';
import { triggerToast, triggerModalOpen } from 'redux/actions/ui';

const CryptoJS = require('crypto');

let pemContents = '';

fetch(raw)
  .then(r => r.text())
  .then(text => {
    pemContents = text;
  });

var encryptStringWithRsaPublicKey = function(toEncrypt, publicKey) {
  var buffer = Buffer.from(toEncrypt, 'utf16le');
  var encrypted = CryptoJS.publicEncrypt(publicKey, buffer);
  return encrypted.toString('base64');
};

class ForgotPassword extends Component {
  state = {
    captchaComplete: false,
    captchaData: '',
    redirect: '',
    is2ndStepStarted: false,
    emailToken: '',
    smsToken: '',
    email: '',
    resetPasswordComplete: false,
    isResetLoading: false,
    isForgotLoading: false,
    isMobileVerified: false,
  };

  componentDidMount() {}

  forgotPwValidationSchema = () =>
    Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
    });

  resetPwValidationSchema = () => {
    const { t, passwordStrength } = this.props;
    const { isMobileVerified } = this.state;

    return Yup.object().shape({
      newPassword: Yup.string()
        .required()
        .test('regex', t('forms.validations.password'), val => {
          let regExp = new RegExp(passwordStrength);
          return regExp.test(val);
        }),
      newPasswordConfirm: Yup.string()
        .oneOf(
          [Yup.ref('newPassword'), null],
          t('forms.validations.passwordMatch'),
        )
        .required(),
      email_otp: Yup.string()
        .required()
        .min(6),
      sms_otp: isMobileVerified
        ? Yup.string()
            .required()
            .min(6)
        : Yup.string(),
    });
  };

  handleCaptcha = (data, captcha) => {
    if (data) {
      this.setState({ captchaData: data });
      this.setState({ captchaComplete: true });
    } else {
      this.setState({ captchaComplete: false });
    }
  };

  async resetPassword(values, actions) {
    const { reCaptchaKey } = this.props;
    this.setState({ isResetLoading: true });

    let finalVal = {};

    const encrypted = encryptStringWithRsaPublicKey(
      values.newPassword,
      pemContents,
    );

    finalVal['new_password'] = encrypted;
    finalVal.email = this.state.email;
    finalVal['email_otp'] = values.email_otp;
    finalVal['sms_otp'] = values.sms_otp;
    finalVal['email_token'] = this.state.emailToken;
    finalVal['sms_token'] = this.state.smsToken;

    if (_.startsWith(reCaptchaKey, '6L')) {
      finalVal['captcha_code'] = this.state.captchaData;
    }

    try {
      const { data } = await instance({
        url: '/api/forgot-password',
        method: 'POST',
        data: finalVal,
      });

      if (data.status === 'Success') {
        triggerToast('successfulPasswordReset', 'success');
        // actions.resetForm();
        this.setState({
          resetPasswordComplete: true,
          redirect: '/login',
          isResetLoading: false,
        });
      } else {
        triggerToast(data.message, 'error');
        // actions.resetForm();
        this.setState({
          isResetLoading: false,
        });
      }
    } catch (e) {
      triggerToast(e.message, 'error');
      this.setState({
        isResetLoading: false,
        is2ndStepStarted: true,
      });
    }
  }

  async handleSubmit(values) {
    const { reCaptchaKey } = this.props;
    this.setState({ isForgotLoading: true });
    if (_.startsWith(reCaptchaKey, '6L')) {
      values.captcha_code = this.state.captchaData;
    }

    this.setState({ email: values.email });

    try {
      const { data } = await instance({
        url: '/api/forgot-password-otp',
        method: 'POST',
        data: values,
      });

      if (data.status === 'Success') {
        triggerToast(data.status, 'success');
        if (!_.isEqual(data.data.smsToken, '')) {
          this.setState({ isMobileVerified: true });
        }
        this.setState({
          emailToken: data.data.emailToken,
          smsToken: data.data.smsToken,
          is2ndStepStarted: true,
          captchaComplete: false,
          captchaData: '',
          isForgotLoading: false,
        });
      } else {
        triggerToast(_.has(data, ['message'])? data.message: data.Message, 'error');
        this.setState({
          captchaComplete: false,
          captchaData: '',
          isForgotLoading: false,
        });
      }
    } catch (e) {
      triggerToast(e.message, 'error');
      this.setState({
        captchaComplete: false,
        captchaData: '',
        isForgotLoading: false,
      });
    }
  }

  render() {
    const { forgotPassword, t: translate } = this.props;
    const { resetPasswordComplete, redirect, isMobileVerified } = this.state;
    const t = nestedTranslate(translate, 'forms.forgotPassword');
    const ts = nestedTranslate(translate, 'forms.resetPassword');
    const txs = nestedTranslate(translate, 'forms.walletWithdrawal');

    return (
      <React.Fragment>
        <AuthenticationContainer title={t('title')}>
          {resetPasswordComplete ? (
            <Redirect push={true} to={redirect} />
          ) : (
            <React.Fragment>
              {!this.state.is2ndStepStarted && (
                <Box pad="none" gap="small">
                  <Formik
                    initialValues={{
                      email: '',
                    }}
                    onSubmit={values => this.handleSubmit(values)}
                    validationSchema={this.forgotPwValidationSchema}
                  >
                    {() => (
                      <Form className={cx(styles.container, styles.regHeight)}>
                        <TextField
                          type="text"
                          name="email"
                          placeholder={t('email.placeholder')}
                          iconposition="left"
                        />
                        <Captcha onChange={this.handleCaptcha} />
                        <Button
                          fill={true}
                          color="primary"
                          type="submit"
                          disabled={
                            !this.state.captchaComplete ||
                            this.state.isForgotLoading
                          }
                        >
                          {translate('buttons.submit')}
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </Box>
              )}
              {this.state.is2ndStepStarted && (
                <Box pad="none" gap="small">
                  <Formik
                    initialValues={{
                      newPassword: '',
                      newPasswordConfirm: '',
                      email_otp: '',
                      sms_otp: '',
                    }}
                    onSubmit={values => this.resetPassword(values)}
                    validationSchema={this.resetPwValidationSchema}
                  >
                    {() => (
                      <Form className={cx(styles.container, styles.regHeight)}>
                        <TextField
                          type="password"
                          name="newPassword"
                          placeholder={ts('newPassword.placeholder')}
                          iconposition="left"
                          autoComplete="false"
                        />
                        <TextField
                          type="password"
                          name="newPasswordConfirm"
                          placeholder={ts('newPasswordConfirm.placeholder')}
                          iconposition="left"
                        />
                        <TextField
                          type="text"
                          name="email_otp"
                          placeholder={txs('emailOtp')}
                          iconposition="left"
                        />
                        {isMobileVerified && (
                          <TextField
                            type="text"
                            name="sms_otp"
                            placeholder={txs('smsVerificationCode.placeholder')}
                            iconposition="left"
                          />
                        )}
                        <Captcha onChange={this.handleCaptcha} />
                        <Button
                          fill={true}
                          color="primary"
                          type="submit"
                          disabled={
                            !this.state.captchaComplete ||
                            this.state.isResetLoading
                          }
                        >
                          {translate('buttons.submit')}
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </Box>
              )}
            </React.Fragment>
          )}
        </AuthenticationContainer>
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({
  user: {
    profile: { passwordResetStarted },
  },
  exchangeSettings: {
    settings: {
      passwordStrength,
      seo: { reCaptchaKey },
    },
  },
}) => ({
  passwordResetStarted: passwordResetStarted,
  passwordStrength,
  reCaptchaKey,
});

// const mapDispatchToProps = dispatch => ({
//   resetStarted() {
//     dispatch({ type: USER_FORGOT_PASSWORD_STARTED });
//   },
//   forgotPassword(values) {
//     dispatch(forgotPassword(values));
//   },
// });

export default withNamespaces()(
  connect(mapStateToProps, { triggerToast })(ForgotPassword),
);
