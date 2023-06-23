import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Loading } from 'components/Loading'
import { connect } from 'react-redux';
import { AuthenticationContainer } from 'pages/Authentication';
import { verifyEmail } from 'redux/actions/profile';
import { withNamespaces } from 'react-i18next';

class AccountVerification extends Component {
  componentDidMount() {
    const { match } = this.props;
    this.props.verifyEmail({ otp: match.params.otp });
  }

  render() {
    const {
      emailVerificationCompleted,
    } = this.props;

    return (
      <AuthenticationContainer>
        {emailVerificationCompleted ? (
          <Redirect to="/login" />
        ) : (
          <Loading />
        )}
      </AuthenticationContainer>
    );
  }
}

const mapStateToProps = ({ ui, user }) => ({
  emailVerificationCompleted: user.emailVerificationCompleted,
  isModalOpen: ui.isModalOpen,
});

export default withNamespaces()(
  connect(
    mapStateToProps,
    { verifyEmail },
  )(AccountVerification),
);
