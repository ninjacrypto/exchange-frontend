import React, { Component } from 'react';
import qs from 'qs';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { triggerToast } from 'redux/actions/ui';
import { PageWrap } from 'components/Containers';

// TODO: Complete flow after deposit is completed/failed
class FiatPgResponse extends Component {

  componentDidMount() {

  }

  render() {
    const { location, match: {
      path,
    }, } = this.props;
    let currency;
    const params = qs.parse(location, { ignoreQueryPrefix: true });
    if (params.pathname.split('/').length >= 4) {
      currency = params.pathname.split('/')[2];
    } else {
      currency = '';
    }

    // console.log(params);
    return (
      <PageWrap>
        {<Redirect to={`/${path.split('/')[1]}/deposits/` + `${currency}`} />}
      </PageWrap>
    );
  }
}

export default connect(
  null,
  { triggerToast },
)(FiatPgResponse);
