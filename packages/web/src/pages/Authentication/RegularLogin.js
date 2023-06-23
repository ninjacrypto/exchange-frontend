import React, { useState } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';

import styles from './Authentication.module.scss';
import { Captcha } from 'components/Captcha';
import { TextField, Form } from 'components/Form';
import { Button, Box } from 'components/Wrapped';
import { logIn } from 'redux/actions/profile';
import { nestedTranslate } from 'utils/strings';
import { sha256, sha224 } from 'js-sha256';
import raw from '../../public.pem';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

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


const LoginForm = ({ logIn, t: translate, isLoginLoading, passwordStrength, reCaptchaKey }) => {
  const [captchaComplete, setCaptchaComplete] = useState();
  const [captchaData, setCaptchaData] = useState();
  const t = nestedTranslate(translate, 'forms.login');

  if (!localStorage.getItem('deviceId')) {
    const deviceId = uuidv4();
    localStorage.setItem('deviceId', deviceId);
  }

  const logInValidationSchema = () =>
    Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
      .required(),
      // .test('regex', translate('forms.validations.password'), val => {
      //   let regExp = new RegExp(passwordStrength);
      //   return regExp.test(val);
      // }),
    });

  const handleCaptcha = (data, captcha) => {
    if (data) {
      setCaptchaData(data);
      setCaptchaComplete(true);
    } else {
      setCaptchaComplete(false);
    }
  };

  const handleSubmit = (data) => {
    let loginData = {};

    loginData.email = data.email;

    if (_.startsWith(reCaptchaKey, '6L')) {
      loginData.captcha_code = captchaData;
    }
    const encrypted = encryptStringWithRsaPublicKey(data.password, pemContents);
    loginData.password = encrypted;

    if (localStorage.getItem('deviceId')) {
      loginData.dvc_id = localStorage.getItem('deviceId')
    }

    logIn(loginData);
  }

  return (
    <Box pad="none" gap="small">
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        onSubmit={(values) => handleSubmit(values)}
        validationSchema={logInValidationSchema}
      >
        {() => (
          <Form>
            <TextField
              type="text"
              name="email"
              placeholder={t('email.placeholder')}
              iconposition="left"
            />
            <TextField
              type="password"
              name="password"
              placeholder={t('password.placeholder')}
              iconposition="left"
            />
            <Captcha onChange={handleCaptcha} />
            <Button
              fill={true}
              color="primary"
              type="submit"
              disabled={!captchaComplete || isLoginLoading}
            >
              {translate('buttons.login')}
            </Button>
          </Form>
        )}
      </Formik>

      <Box pad="none" justify="center" align="center">
        <Link to="signup" className={styles.link}>
          {translate('buttons.signUp')}
        </Link>
        <Link to="forgot-password" className={styles.link}>
          {translate('buttons.forgotPassword')}
        </Link>
      </Box>
    </Box>
  );
};

const mapStateToProps = ({ user, exchangeSettings: { settings: { passwordStrength, seo: { reCaptchaKey } } } }) => ({
  isLoginLoading: user.isLoginLoading,
  passwordStrength,
  reCaptchaKey
});

const RegularLogin = withNamespaces()(
  connect(mapStateToProps, { logIn })(LoginForm),
);

export default RegularLogin;
