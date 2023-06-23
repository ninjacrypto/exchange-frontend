import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';

import { AuthenticationContainer } from 'pages/Authentication';
import { ForgotPassword } from 'pages/Authentication';
import { ResetPassword } from 'pages/Authentication';
import { Logo } from 'containers/Logo';
import styles from './Authentication.module.scss';
import { Heading } from 'components/Wrapped';


class ResetPasswordContainer extends Component {
  render() {
    const {
      passwordResetStarted,
      breakpoints: { isMobile },
    } = this.props;

    return (
      <AuthenticationContainer>
        <Link to="/">
          <Logo className={styles.logo} />
        </Link>

        {!isMobile && (
          <Heading textAlign="center" level={3}>
            Forgot Password
          </Heading>
        )}
        <ForgotPassword />
        {/* {!passwordResetStarted ? <ForgotPassword /> : <ResetPassword />} */}
      </AuthenticationContainer>
    );
  }
}

const mapStateToProps = ({ ui, user }) => ({
  breakpoints: ui.breakpoints,
  passwordResetStarted: user.passwordResetStarted,
});

export default withRouter(
  connect(
    mapStateToProps,
    null,
  )(ResetPasswordContainer),
);
