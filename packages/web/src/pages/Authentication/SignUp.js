import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Field, Formik, ErrorMessage } from 'formik';
import countries from 'i18n-iso-countries';
import { withNamespaces } from 'react-i18next';
import * as Yup from 'yup';
import cx from 'classnames';
import _ from 'lodash';
import phoneCodes from 'assets/phone.json';
import { signUp, signUpFinished } from 'redux/actions/profile';
import { CheckBox, TextField, SelectField, Form } from 'components/Form';
import { AuthenticationContainer, SignUpSuccess } from 'pages/Authentication';
import styles from './Authentication.module.scss';
import { nestedTranslate } from 'utils/strings';
import { Captcha } from 'components/Captcha';
import { Button, Box } from 'components/Wrapped';
import instance, { authenticatedInstance } from 'api';
import { triggerToast, triggerModalOpen } from 'redux/actions/ui';
import raw from '../../public.pem';

const CryptoJS = require("crypto");

let pemContents = '';

  fetch(raw)
  .then(r => r.text())
  .then(text => {
    pemContents = text;
  });

  var encryptStringWithRsaPublicKey = function(toEncrypt, publicKey) {
    var buffer = Buffer.from(toEncrypt, 'utf16le');
    var encrypted = CryptoJS.publicEncrypt(publicKey, buffer);
    return encrypted.toString("base64");
  };

class SignUp extends Component {
  state = {
    captchaComplete: false,
    isMobileOTP: false,
    captchaData: ''
  };

  componentDidMount() {
    countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
  }

  componentWillUnmount() {
    this.props.signUpFinished();
  }

  handleCaptcha = data => {
    if (data) {
      this.setState({
        captchaComplete: true,
        captchaData: data,
      });
    } else {
      this.setState({
        captchaComplete: false,
      });
    }
  };

  renderCountryOptions() {
    const countryList = countries.getNames('en');

    return Object.entries(countryList).map(([countryCode, countryName]) => ({
      value: countryCode,
      label: countryName,
    }));
  }

  trimUserName(values) {
    const { signupMobileVerfication, reCaptchaKey } = this.props;
    const { firstname, lastname } = values;
    const valuesToTrim = { firstname, lastname };
    let trimmedValues = {};
    let finalValues = {
      agree: values.agree,
      country: values.country,
      email: values.email,
      firstname: values.firstname,
      lastname: values.lastname,
      middlename: values.middlename,
      mobile: values.mobile,
      mobileOTP: values.mobileOTP,
      password: values.password,
      passwordConfirm: values.passwordConfirm,
      referralId: values.referralId,
    };

    const encrypted = encryptStringWithRsaPublicKey(values.password, pemContents);
    if (_.startsWith(reCaptchaKey, '6L')) {
      finalValues.captcha_code = this.state.captchaData;
    }
    finalValues.password = encrypted;

    for (const key in valuesToTrim) {
      trimmedValues[key] = valuesToTrim[key].replace(/\s/g, '');
    }

    const formValues = { ...finalValues, ...trimmedValues };

    if (_.isEqual(signupMobileVerfication.toLowerCase(), 'false')) {
      delete formValues.mobileOTP;
    }

    this.props.signUp(formValues);
  }

  signUpValidationSchema = () => {
    const { t, passwordStrength, signupMobileVerfication } = this.props;

    return Yup.object().shape({
      firstname: Yup.string()
        .strict(false)
        .trim('No spaces allowed.')
        .min(2)
        .max(70)
        .required(),
      middlename: Yup.string()
        .min(1)
        .max(70),
      lastname: Yup.string()
        .strict(false)
        .trim('No spaces allowed.')
        .min(2)
        .max(70)
        .required(),
      email: Yup.string()
        .email()
        .required(),
      country: Yup.string().required(),
      mobile: _.isEqual(signupMobileVerfication.toLowerCase(), 'true') ? Yup.string()
        // TODO: This should be set by country
        // .min(10, 'Your mobile number must be 10 digits long')
        // .max(10, 'Your mobile number must be 10 digits long')
        .required(): Yup.string(),
      mobileOTP: Yup.string(),
      password: Yup.string()
        .required()
        .test('regex', t('forms.validations.password'), val => {
          let regExp = new RegExp(passwordStrength);
          return regExp.test(val);
        }),
      passwordConfirm: Yup.string()
        .oneOf(
          [Yup.ref('password'), null],
          t('forms.validations.passwordMatch'),
        )
        .required(),
      referralId: Yup.string().matches(/^[A-Za-z0-9 ]+$/, t('forms.validations.referralId')),
      agree: Yup.bool().oneOf([true], t('forms.signUp.agree.validation')),
    });
  };

  async verifyMobileNumber(values) {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'forms.signUp');
    if (_.isEqual(values.country, '')) {
      triggerToast(t('countryRequired'), 'warning', 2500);

    } else if (_.isEqual(values.mobile, '')) {
      triggerToast(t('mobileNumberRequired'), 'warning', 2500);
      return;
    } else {
      let postData = {
        country: values.country,
        mobile: values.mobile
      }
   
      try {
        const { data } = await instance({
          url: '/api/Request_Mobile_Verification_OTP',
          method: 'POST',
          data: postData,
        });
  
        if (data.status === 'Success') {
          triggerToast(t('mobileOtpSuccessMessage'), 'success', 2500);
          this.setState({isMobileOTP: true})
        } else {
          triggerToast(data.message, 'error', 2500);
        }
      } catch (e) {}
    }
  }

  render() {
    const {
      signupStarted,
      referralId,
      t: translate,
      exchangeName,
      signupMobileVerfication
    } = this.props;
    const t = nestedTranslate(translate, 'forms.signUp');

    const referralFieldProps = referralId
      ? {
          disabled: true,
          value: referralId,
        }
      : {};

    const { captchaComplete, isMobileOTP } = this.state;

    return (
      <AuthenticationContainer title={!signupStarted ? t('title') : null}>
        {signupStarted ? (
          <SignUpSuccess />
        ) : (
          <Formik
            initialValues={{
              firstname: '',
              middlename: '',
              lastname: '',
              email: '',
              country: '',
              mobile: '',
              mobileOTP: '',
              password: '',
              passwordConfirm: '',
              referralId: referralId || '',
              agree: false,
            }}
            onSubmit={values => this.trimUserName(values)}
            validationSchema={this.signUpValidationSchema}
          >
            {({ values }) => (
              <Form className={cx(styles.container, styles.regHeight)}>
                <TextField
                  type="text"
                  name="firstname"
                  placeholder={t('firstName.placeholder')}
                  iconposition="left"
                />

                <TextField
                  type="text"
                  name="middlename"
                  placeholder={t('middleName.placeholder')}
                  iconposition="left"
                />

                <TextField
                  type="text"
                  name="lastname"
                  placeholder={t('lastName.placeholder')}
                  iconposition="left"
                />

                <TextField
                  type="text"
                  name="email"
                  placeholder={t('emailAddress.placeholder')}
                  iconposition="left"
                />

                <Box pad="none">
                  <Field
                    name="country"
                    component={SelectField}
                    options={this.renderCountryOptions()}
                    hasIcon={true}
                    placeholder={t('selectCountry.placeholder')}
                  />

                  <ErrorMessage
                    name="country"
                    component="div"
                    style={{marginTop:"-32px", marginBottom:"10px", padding: "0px 12px"}}
                    className={styles.errorMessage}
                  />
                </Box>

                {/* {_.isEqual((signupMobileVerfication).toLowerCase(), 'false')  && (
                  <TextField
                  type="tel"
                  name="mobile"
                  placeholder={t('mobileNumber.placeholder')}
                  addonStart={{
                    content:
                      values.country && `+${phoneCodes[`${values.country}`]}`,
                  }}
                  />
                )} */}

                {!_.isEqual(signupMobileVerfication.toLowerCase(), 'false')  && (
                  <React.Fragment>
                    <TextField
                      type="tel"
                      name="mobile"
                      placeholder={t('mobileNumber.placeholder')}
                      addonStart={{
                        content:
                          values.country && `+${phoneCodes[`${values.country}`]}`,
                      }}
                      addonEnd={{
                        content: t('mobileOtpButton'),
                        background: 'primary',
                        onClick: () => this.verifyMobileNumber(values),
                      }}
                    />
                    {isMobileOTP && (
                      <TextField
                        type="text"
                        name="mobileOTP"
                        placeholder={t('mobileOTP.placeholder')}
                        iconposition="left"
                      />
                    )}
                  </React.Fragment>
                )}

                <TextField
                  type="password"
                  name="password"
                  placeholder={t('password.placeholder')}
                  iconposition="left"
                />

                <TextField
                  type="password"
                  name="passwordConfirm"
                  placeholder={t('confirmPassword.placeholder')}
                  iconposition="left"
                />

                <TextField
                  type="text"
                  name="referralId"
                  {...referralFieldProps}
                  placeholder={t('refferalCode.placeholder')}
                />

                {(() => {
                  if (values.country==='TR') {
                    return (
                      <div class="field">
                      <CheckBox
                        name="agree"
                        label={<div>
                            <a 
                            href={'https://bytedex.io/kullanici-sozlesmeleri?lang=' + values.country}
                            target="_blank">
                             Kullanım Sözleşmesi&nbsp;
                            </a> ' ni ve &nbsp;  
                            <a 
                            href={'https://bytedex.io/risk-bildirimi?lang=' + values.country}
                            target="_blank">
                             Müşterilere Yönelik Açık Rıza Metni&nbsp;
                            </a>
                             ni okudum, inceledim, ekli metin kapsamında kişisel verilerimin işlenmesi ve aktarılmasını onaylıyorum.&nbsp; 
                            <a  
                            href={'https://bytedex.io/privacy-policy?lang=' + values.country}
                            target="_blank">
                             Müşterilere Yönelik Aydınlatma Metni&nbsp;
                            </a> 
                               kapsamında e-posta, telefon ve elektronik iletişim kanalları yoluyla
                             ticari elektronik iletiler almayı kabul ediyorum.&nbsp;
                        </div>}
                      />
            </div>
                    )
                  }else {
                    return (
                      <div>
                      <CheckBox
                        name="agree"
                        label={t('agree.label', { exchangeName })
                        }
                      />
                      <div><a 
                            href={'https://bytedex.io/term-of-use?lang=' + values.country}
                            target="_blank">
                             Bytedex Term Of Use
                            </a><br/></div>
                  </div>
                    )
                  }
                })()}

                <Captcha onChange={this.handleCaptcha} />

                <Button
                  fill={true}
                  color="primary"
                  type="submit"
                  disabled={!captchaComplete}
                >
                  {translate('buttons.signUp')}
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </AuthenticationContainer>
    );
  }
}

const mapStateToProps = ({
  profile,
  user,
  auth,
  exchangeSettings: {
    settings: { exchangeName, passwordStrength, signupMobileVerfication, seo: { reCaptchaKey } },
  },
}) => ({
  profile,
  signupStarted: user.signupStarted,
  referralId: auth.referralId,
  exchangeName,
  passwordStrength,
  signupMobileVerfication,
  reCaptchaKey
});

const SignUpContainer = withRouter(
  withNamespaces()(
    connect(mapStateToProps, { signUp, signUpFinished })(SignUp),
  ),
);

export default SignUpContainer;
