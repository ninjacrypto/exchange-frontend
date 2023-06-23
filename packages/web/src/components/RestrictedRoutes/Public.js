import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, withRouter } from 'react-router-dom';

class Public extends Component {
  render() {
    const { component, auth, ...rest } = this.props;

    return (
      <Route
        {...rest}
        render={props =>
          !auth.isAuthenticated ? (
            React.createElement(component, { ...props })
          ) : (
            <Redirect to="/" />
          )
        }
      />
    );
  }
}

const mapStateToProps = ({ auth }) => ({
  auth,
});

const PublicContainer = connect(mapStateToProps)(Public);

export default withRouter(PublicContainer);
