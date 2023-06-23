import React from 'react';
import qs from 'qs';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { PageWrap } from 'components/Containers';

import { loginSuccessful } from 'redux/actions/profile';

class RedirectLogin extends React.Component {
  state = {
    loginComplete: false,
  }

  componentDidMount() {
    const { search } = window.location;

    if (search) {
      const code = qs.parse(search, { ignoreQueryPrefix: true });

      if (code.token) {
        this.props.loginSuccessful(code.token);

        this.setState({
          loginComplete: true,
        })
      }
    }
  }

  render() {
    return (
      <PageWrap>
        {this.state.loginComplete && <Redirect to="/account" />}
      </PageWrap>
    )
  }
}

export default connect(null, { loginSuccessful })(RedirectLogin);
