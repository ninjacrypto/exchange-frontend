import React from 'react';
import { connect } from 'react-redux';

import { authenticatedInstance } from 'api';
import { Loading } from 'components/Loading';
import styled from 'styled-components';
import { Box, Button, Text } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';
import { _ } from 'core-js';
const Onfido = require('onfido-sdk-ui');

const OnfidoContainer = styled.div`
  background-color: #fff;
`;

class KYCOnfido extends React.Component {
  redirectDelayInSec = 5;
  state = {
    isScriptLoaded: false,
    providerRedirectUrl: undefined,
    redirectTimer: undefined,
    redirectTimeCountdown: this.redirectDelayInSec,
  };
  savedApplicantId = '';
  redirectTimeCountdownInterval = undefined;

  async getIFrameInfo(forceRefresh) {
    try {
      let postData = forceRefresh ? { force: true } : {};
      postData['referrerURL'] = window.location.href;
      const { data } = await authenticatedInstance({
        url: '/api/KYC_OnSite_AccessToken',
        method: 'POST',
        data: {
          ...postData,
        },
      });

      if (data.status === 'Success') {
        return data.data;
      } else {
        return null;
      }
    } catch (e) {}
  }

  initializeIFrame() {
    const { token } = this.iFrameInfo;
    this.triggerOnfido(token);
  }

  triggerOnfido(token) {
    Onfido.init({
      token: token,
      containerId: 'onfido-mount',
      onComplete: function(data) {
        authenticatedInstance({
          url: '/api/KYC_OnSite_SaveApplication',
          method: 'POST',
          data: {
            applicationId: 0,
          },
        });
      },
      onError: function(data) {
        if (_.isEqual(data.type, 'expired_token')) {
          this.reInitializeOnfido();
        }
      },
      onUserExit: function(userExitCode) {
        console.log(userExitCode);
      },
      steps: ['welcome', 'document', 'face', 'complete'],
    });
  }

  async reInitializeOnfido() {
    this.iFrameInfo = await this.getIFrameInfo();
    this.initializeIFrame();
  }

  async componentDidMount() {
    this.iFrameInfo = await this.getIFrameInfo();
    if (this.iFrameInfo) {
      this.setState({ isScriptLoaded: true });
      // [Artem H.]
      // Prevent initializing SDK if current provider is 'idnow'
      if (
        this.props.kyc.webSdkProviderName === 'idnow' &&
        this.iFrameInfo.idnow_redirect
      ) {
        // this.setState({ providerRedirectUrl: this.iFrameInfo.idnow_redirect });
        window.location.href = this.iFrameInfo.idnow_redirect;
      } else {
        this.initializeIFrame();
      }
    }
  }

  componentWillUnmount() {
    if (this.state.redirectTimer) {
      clearTimeout(this.state.redirectTimer);
    }
    if (this.redirectTimeCountdownInterval) {
      clearInterval(this.redirectTimeCountdownInterval);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        {!this.state.isScriptLoaded && <Loading />}
        {this.state.providerRedirectUrl && (
          <Box>
            <Box>
              <Text color="text" size="medium">
                {t('account.accountVerification.kycRedirectWarning')}
              </Text>
            </Box>
            <Button
              align="center"
              type="button"
              color="primary"
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
              onClick={() => {
                if (!this.state.redirectTimer) {
                  this.redirectTimeCountdownInterval = setInterval(() => {
                    let v = this.state.redirectTimeCountdown - 1;
                    if (v === 0) {
                      clearInterval(this.redirectTimeCountdownInterval);
                      this.redirectTimeCountdownInterval = undefined;
                    }
                    this.setState({ redirectTimeCountdown: v });
                  }, 1000);

                  this.setState({
                    redirectTimer: setTimeout(() => {
                      window.location.href = this.state.providerRedirectUrl;
                    }, this.redirectDelayInSec * 1000),
                  });
                }
              }}
            >
              {this.state.redirectTimer
                ? t('account.accountVerification.startKyc') +
                  ` ${this.state.redirectTimeCountdown}`
                : t('account.accountVerification.startKyc')}
            </Button>
          </Box>
        )}
        {!this.state.providerRedirectUrl && (
          <OnfidoContainer id="onfido-mount" />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({
  exchangeSettings: { settings },
  user: {
    profile: { email },
  },
}) => ({
  email,
  kyc: settings.kyc,
});

export default withNamespaces()(connect(mapStateToProps)(KYCOnfido));
