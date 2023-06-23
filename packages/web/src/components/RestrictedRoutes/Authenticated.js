import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, Route, withRouter } from 'react-router-dom';

class Authenticated extends Component {
  render() {
    const { component, auth, componentProps, enableLogin, ...rest } = this.props;

    return (
      <Route
        {...rest}
        render={props =>
          auth.isAuthenticated ? (
            React.createElement(component, { ...props, ...componentProps })
          ) : (
            <Redirect to={enableLogin ? "/login" : "/"} />
          )
        }
      />
    );
  }
}

Authenticated.propTypes = {
  componentProps: PropTypes.object,
};

const mapStateToProps = ({ auth, exchangeSettings: { settings: { enableLogin } } }) => ({
  auth,
  enableLogin
});

export default withRouter(connect(mapStateToProps)(Authenticated));
