import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, Route, withRouter } from 'react-router-dom';
import _ from 'lodash';

class RestrictedRoutes extends Component {
  render() {
    const { component, auth, componentProps, enableLogin, kycStatus, isMobileVerified, ...rest } = this.props;

    return (
      <Route
        {...rest}
        render={props =>
          auth.isAuthenticated && _.isEqual(kycStatus.toLowerCase(), 'approved') && isMobileVerified ? (
            React.createElement(component, { ...props, ...componentProps })
          ) : (
            <Redirect to={enableLogin ? "/login" : "/"} />
          )
        }
      />
    );
  }
}

RestrictedRoutes.propTypes = {
  componentProps: PropTypes.object,
};

const mapStateToProps = ({ auth, exchangeSettings: { settings: { enableLogin } }, user: { profile: { kycStatus, isMobileVerified } } }) => ({
  auth,
  enableLogin,
  kycStatus,
  isMobileVerified
});

export default withRouter(connect(mapStateToProps)(RestrictedRoutes));
