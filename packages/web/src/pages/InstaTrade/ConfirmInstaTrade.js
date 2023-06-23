import React, { Component } from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import { authenticatedInstance } from 'api';
import { PageWrap } from 'components/Containers';
import { Box, Paragraph } from 'components/Wrapped';
import { Heading } from 'react-bulma-components';
import { withNamespaces } from 'react-i18next';
import { Loading } from 'components/Loading';
import { nestedTranslate } from 'utils';

class ConfirmInstaTrades extends Component {
  state = {
    requestComplete: false,
    status: 'error',
  };

  async confirmWithdrawal(token) {
    try {
      const response = await authenticatedInstance({
        url: '/api/confirm_insta_trade',
        method: 'POST',
        data: {
          token,
        },
      });

      if (_.get(response, 'data.status')) {
        if (response.data.status === 'Success') {
          this.setState({ status: 'success' });
        } else {
          this.setState({ status: 'error' });
        }
      }
    } catch (e) {
      this.setState({ status: 'error' });
    }

    this.setState({
      requestComplete: true,
    });
  }

  componentDidMount() {
    const { match } = this.props;
    this.confirmWithdrawal(match.params.token);
  }

  render() {
    const { t: translate } = this.props;
    const { status, requestComplete } = this.state;
    const t = nestedTranslate(translate, 'instaTrade');

    return (
      <PageWrap>
        <Box background="background-2">
          {requestComplete ? (
            <Box gap="small">
              <Heading level={3}>{t(`${status}.heading`)}</Heading>
              <Paragraph>{t(`${status}.message`)}</Paragraph>
              <Paragraph>
                <Link to="/insta-trade">{t('return')}</Link>
              </Paragraph>
              <Paragraph>
                <Link to="/wallet/insta-trades">{t('historyRequest')}</Link>
              </Paragraph>
            </Box>
          ) : (
            <Loading />
          )}
        </Box>
      </PageWrap>
    );
  }
}

export default withNamespaces()(ConfirmInstaTrades);
