import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { logOut } from 'redux/actions/profile';
import instance, { authenticatedInstance } from 'api';

class Logout extends Component {
  async componentDidMount() {
    try {
      const { data } = await authenticatedInstance({
        url: '/logout',
        method: 'POST',
      });

      if (data.status === 'Success') {
      }
    } catch (e) {}
    this.props.logOut();
  }

  render() {
    const { enableLogin, aeraPassUrl } = this.props;

    if (!aeraPassUrl) {
      return <Redirect to={enableLogin ? "/login" : "/"} />
    } else {
      return window.location = aeraPassUrl;
    }
  }
}

const Logoutcontainer = connect(
  null,
  { logOut },
)(Logout);

const mapStateToProps = ({ exchangeSettings: { settings: { enableLogin, aeraPassUrl } } }) => ({
  enableLogin,
  aeraPassUrl
})

export default connect(mapStateToProps)(Logoutcontainer);
