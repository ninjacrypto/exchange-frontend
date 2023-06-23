import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { Columns } from 'react-bulma-components';
import * as Yup from 'yup';
import cx from 'classnames';

import styles from './Authentication.module.scss';
import { FormContainer, TextField } from 'components/Form';
import {
  changePassword,
  changePasswordFinished,
  requestChangePasswordOtp,
} from 'redux/actions/profile';

import { Logo } from 'containers/Logo';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { Button, Heading, Box, Paragraph } from 'components/Wrapped';

class ChangePassword extends Component {
  componentWillUnmount() {
    this.props.changePasswordFinished();
  }

  changePwValidationSchema = () => {
    const { t, passwordStrength } = this.props;

    return Yup.object().shape({
      oldPassword: Yup.string().required(),
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
      otp: Yup.string()
        .min(6)
        .required(),
    });
  };

  render() {
    const {
      changePassword,
      passwordChanged,
      requestChangePasswordOtp,
      passwordChangedOTP,
      breakpoints: { isMobile },
      t: translate,
      gAuthEnabled,
      isLoading,
    } = this.props;

    const t = nestedTranslate(translate, 'forms.changePassword');

    return (
      <Fragment>
        {passwordChanged ? (
          <Redirect to="/" />
        ) : (
          <Columns centered={true}>
            <Columns.Column
              className={styles.changePwContainer}
              mobile={{
                size: 12,
              }}
              tablet={{
                size: 8,
              }}
              desktop={{
                size: 6,
              }}
            >
              <Box justify="center" align="center" pad="none" round={false}>
                <Link to="/">
                  <Logo className={styles.logo} />
                </Link>

                {!isMobile && (
                  <Heading textAlign="center" level={3}>
                    {t('title')}
                  </Heading>
                )}

                {gAuthEnabled || passwordChangedOTP ? (
                  <Box pad="none" fill="horizontal">
                    <FormContainer
                      values={{
                        oldPassword: '',
                        newPassword: '',
                        newPasswordConfirm: '',
                        otp: '',
                      }}
                      handleSubmit={changePassword}
                      validationSchema={this.changePwValidationSchema}
                      formStyles={cx(styles.container, styles.regHeight)}
                      hasButton={{
                        text: translate('buttons.submit'),
                      }}
                    >
                      <TextField
                        type="password"
                        name="oldPassword"
                        placeholder={t('oldPassword.placeholder')}
                        iconposition="left"
                      />
                      <TextField
                        type="password"
                        name="newPassword"
                        placeholder={t('newPassword.placeholder')}
                        iconposition="left"
                      />
                      <TextField
                        type="password"
                        name="newPasswordConfirm"
                        placeholder={t('newPasswordConfirm.placeholder')}
                        iconposition="left"
                      />
                      <TextField
                        type="text"
                        name="otp"
                        placeholder={
                          gAuthEnabled
                            ? t('otp.gAuthPlaceholder')
                            : t('otp.emailPlaceholder')
                        }
                        iconposition="left"
                      />
                      {passwordChangedOTP && (
                        <Fragment>
                          <Paragraph>{t('otpNotWorking')}</Paragraph>
                          <Button
                            type="button"
                            loading={isLoading}
                            disabled={isLoading}
                            onClick={requestChangePasswordOtp}
                            color="primary"
                            primary={false}
                            margin={{ vertical: 'small' }}
                            fill="horizontal"
                          >
                            {t('requestNewOtp')}
                          </Button>
                        </Fragment>
                      )}
                    </FormContainer>
                  </Box>
                ) : (
                  <Fragment>
                    <Heading level={6} margin="small">
                      <p>{t('otpEmail')}</p>
                    </Heading>
                    <Button
                      loading={isLoading}
                      disabled={isLoading}
                      onClick={requestChangePasswordOtp}
                      color="primary"
                      className="m-t-lg"
                    >
                      {t('requestOtp')}
                    </Button>
                  </Fragment>
                )}
              </Box>
            </Columns.Column>
          </Columns>
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = ({ ui, user, auth, exchangeSettings: { settings: { passwordStrength } } }) => ({
  breakpoints: ui.breakpoints,
  passwordChanged: user.passwordChanged,
  passwordChangedOTP: user.passwordChangedOTP,
  gAuthEnabled: auth.gAuthEnabled,
  isLoading: user.isLoading,
  passwordStrength,
});

export default ChangePassword = withNamespaces()(
  connect(mapStateToProps, {
    changePassword,
    changePasswordFinished,
    requestChangePasswordOtp,
  })(ChangePassword),
);
