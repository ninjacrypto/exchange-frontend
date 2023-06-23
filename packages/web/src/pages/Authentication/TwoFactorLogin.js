import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Yup from 'yup';
import Loader from 'react-loader-spinner';
import { useFormikContext, Formik } from 'formik';
import { withNamespaces } from 'react-i18next';

import { TextField, Form } from 'components/Form';
import {
  twoFactorLogin,
  resendOtpToken,
  clearToken,
  requestDeviceVerificationOTP,
} from 'redux/actions/profile';
import { nestedTranslate } from 'utils/strings';
import { Button, Text, Box } from 'components/Wrapped';

// Started from Formik docs example
const AutoSubmitToken = ({dvr}) => {
  const { values, submitForm } = useFormikContext();
  React.useEffect(() => {
    if (values.oneTimePassword.length === 6 ) {
      if (dvr === true)  {
        if (values.dvc_otp.length === 6) {
          submitForm();
        }
      } else {
        submitForm();
      }

    }
  }, [values, submitForm]);
  return null;
};

class TwoFaLogin extends Component {
  static propTypes = {
    is2FALoginLoading: PropTypes.bool.isRequired,
    twoFaMethod: PropTypes.string.isRequired,
    twoFactorLogin: PropTypes.func.isRequired,
    resendOtpToken: PropTypes.func.isRequired,
    clearToken: PropTypes.func.isRequired,
    requestDeviceVerificationOTP: PropTypes.func.isRequired,
    t: PropTypes.func,
  };

  state = {
    countDown: 300,
  };

  componentDidMount() {
      this.handleTokenCountdown = setInterval(() => {
        if (this.state.countDown === 0) {
          this.props.clearToken();
          return;
        }
        this.setState(prevState => ({ countDown: prevState.countDown - 1 }));
      }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.handleTokenCountdown);
  }

  logIn2FAValidationSchema = () =>
    Yup.object().shape({
      oneTimePassword: Yup.string().min(6),
      dvc_otp: this.props.requestDeviceVerificationOTP ? Yup.string().min(6) : Yup.string(),
    });

  countDown() {
    const { countDown } = this.state;

    return (
      Math.floor(countDown / 60) +
      ':' +
      ('0' + Math.floor(countDown % 60)).slice(-2)
    );
  }

  render() {
    const {
      twoFactorLogin,
      resendOtpToken,
      twoFaMethod,
      requestDeviceVerificationOTP,
      t: translate,
      is2FALoginLoading,
      deviceVerificationRequired,
    } = this.props;

    const t = nestedTranslate(translate, 'forms.twoFaLogin');

    const placeholderText =
      twoFaMethod === 'GAuth' || twoFaMethod === 'Yubi2FA'
        ? t('googleAuth.placeholder')
        : t('emailAuth.placeholder');

    return (
      <Fragment>
        <Formik
          initialValues={{
            oneTimePassword: '',
            dvc_otp: '',
          }}
          onSubmit={values => {
            twoFactorLogin(values);
          }}
          validationSchema={this.logIn2FAValidationSchema}
        >
          {() => (
            <Form gap="xsmall">
              <AutoSubmitToken dvr={deviceVerificationRequired} />
              <TextField
                autoFocus={true}
                type="text"
                name="oneTimePassword"
                size="large"
                placeholder={placeholderText}
                disabled={is2FALoginLoading}
                addonEnd={
                  is2FALoginLoading
                    ? {
                        content: (
                          <Loader
                            color="var(--primary)"
                            height="25"
                            width="25"
                            type="Oval"
                          />
                        ),
                        background: 'transparent',
                      }
                    : null
                }
              />

	              {twoFaMethod === 'GAuth' && deviceVerificationRequired === true && (
                <TextField
                  type="text"
                  name="dvc_otp"
                  size="large"
                  placeholder={t('deviceAuth.placeholder')}
                  disabled={is2FALoginLoading}
                  addonEnd={{
                    content: t('requestDeviceOtp'),
                    background: 'primary',
                    onClick: () => requestDeviceVerificationOTP(),
                  }}
                />
              )}
              
            </Form>
          )}
        </Formik>
        
        <Text>
          {t('timeRemaining', { timeRemaining: this.countDown() })}
        </Text>
        {twoFaMethod === 'Email' && (
          <Box pad="none" gap="small">
            <Button
              primary={false}
              color="primary"
              onClick={() => {
                resendOtpToken();
              }}
            >
              {t('resendOtp')}
            </Button>
          </Box>
        )}
        {/* Maybe add Support link here */}
      </Fragment>
    );
  }
}

const mapStateToProps = ({ auth, user }) => ({
  twoFaMethod: auth.twoFaMethod,
  is2FALoginLoading: user.is2FALoginLoading,
  deviceVerificationRequired: auth.deviceVerificationRequired,
});

const TwoFactorLogin = withNamespaces()(
  connect(mapStateToProps, { twoFactorLogin, resendOtpToken, clearToken, requestDeviceVerificationOTP })(
    TwoFaLogin,
  ),
);

export default TwoFactorLogin;
