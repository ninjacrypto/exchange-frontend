import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { AuthenticationContainer } from 'pages/Authentication';
import { withNamespaces } from 'react-i18next';
import instance from 'api';
import { Heading, Paragraph, Box, Button } from 'components/Wrapped';

class BlockAccount extends Component {
  state = {
    redirect: false,
    accountBlocked: false,
    submitted: false,
  };

  blockAccount = async () => {
    const { match } = this.props;
    const { code } = match.params;
    try {
      const { data } = await instance({
        url: `/api/block-account/${code}`,
        method: 'GET',
      });

      if (data.status === 'Success') {
        this.setState({ accountBlocked: true, submitted: true });
      }
    } catch (e) {
      this.setState({ redirect: true });
    }
  };

  render() {
    const { redirect, accountBlocked, submitted } = this.state;
    const { t } = this.props;

    return (
      <AuthenticationContainer>
        <Box justify="center" align="center" flex={false}>
          {!submitted && (
            <React.Fragment>
              <Heading>{t('blockAccount.question')}</Heading>
              <Box
                direction="row"
                fill="horizontal"
                justify="center"
                gap="small"
              >
                <Button
                  onClick={() => this.setState({ redirect: true })}
                  type="button"
                >
                  {t('buttons.no')}
                </Button>
                <Button
                  onClick={this.blockAccount}
                  color="primary"
                  type="button"
                >
                  {t('buttons.yes')}
                </Button>
              </Box>
            </React.Fragment>
          )}
          {redirect ? (
            <Redirect push={true} to="/login" />
          ) : accountBlocked ? (
            <React.Fragment>
              <Heading>{t('blockAccount.success')}</Heading>
              <Paragraph>{t('blockAccount.restore')}</Paragraph>
            </React.Fragment>
          ) : (
            submitted && <Loading />
          )}
        </Box>
      </AuthenticationContainer>
    );
  }
}

export default withNamespaces()(BlockAccount);
