import React, { Component, Fragment } from 'react';
import { withNamespaces } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import * as Yup from 'yup';

import { authenticatedInstance } from 'api';
import styles from './Authentication.module.scss';
import { FormContainer, TextField } from 'components/Form';
import { AuthenticationContainer } from 'pages/Authentication';
import { triggerModalOpen, triggerToast } from 'redux/actions/ui';
import { nestedTranslate } from 'utils/strings';

class ResetPassword extends Component {
  state = {
    resetPasswordStarted: false,
    resetPasswordComplete: false,
    redirect: '',
  };

  resetPwValidationSchema = () => {
    const { t, passwordStrength } = this.props;

    return Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
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
    });
  };

  async resetPassword(values) {
    delete values.newPasswordConfirm;

    const { triggerToast, triggerModalOpen } = this.props;
    this.setState({ resetPasswordStarted: true });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/ResetPassword',
        method: 'POST',
        data: values,
      });

      if (data.status === 'Success') {
        triggerToast('successfulPasswordReset', 'success');
        this.setState({
          resetPasswordComplete: true,
          redirect: '/login',
        });
      } else {
        if (data.message === 'Exception_Link_Expired') {
          triggerModalOpen('unsuccessfulPasswordReset');
          this.setState({
            resetPasswordComplete: true,
            redirect: '/forgot-password',
          });
        } else {
          triggerModalOpen(data.message);
          this.setState({
            resetPasswordComplete: true,
            redirect: '/forgot-password',
          });
        }
      }
    } catch (e) {
      triggerModalOpen('unsuccessfulPasswordReset');
      this.setState({
        resetPasswordComplete: true,
        redirect: '/forgot-password',
      });
    }
  }

  render() {
    const { match, t: translate } = this.props;

    const {
      resetPasswordStarted,
      resetPasswordComplete,
      redirect,
    } = this.state;

    const t = nestedTranslate(translate, 'forms.resetPassword');

    return (
      <AuthenticationContainer title={t('title')}>
        {resetPasswordComplete ? (
          <Redirect push={true} to={redirect} />
        ) : (
          <Fragment>
            <FormContainer
              values={{
                email: '',
                newPassword: '',
                newPasswordConfirm: '',
                otp: match.params.otp,
              }}
              handleSubmit={values => this.resetPassword(values)}
              validationSchema={this.resetPwValidationSchema}
              formStyles={cx(styles.container, styles.regHeight)}
              hasButton={{ text: translate('buttons.submit') }}
              loadingState={resetPasswordStarted}
            >
              <TextField
                type="email"
                name="email"
                placeholder={t('email.placeholder')}
                iconposition="left"
              />
              <TextField
                type="password"
                name="newPassword"
                placeholder={t('newPassword.placeholder')}
                iconposition="left"
                autoComplete="false"
              />
              <TextField
                type="password"
                name="newPasswordConfirm"
                placeholder={t('newPasswordConfirm.placeholder')}
                iconposition="left"
              />
            </FormContainer>
          </Fragment>
        )}
      </AuthenticationContainer>
    );
  }
}

const mapStateToProps = ({ exchangeSettings: { settings: { passwordStrength } } }) => ({ passwordStrength })

export default withNamespaces()(
  connect(mapStateToProps, { triggerToast, triggerModalOpen })(ResetPassword),
);
