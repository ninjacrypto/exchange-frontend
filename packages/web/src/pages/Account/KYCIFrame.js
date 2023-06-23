import React from 'react';
import { connect } from 'react-redux';
import snsWebSdk from '@sumsub/websdk';

import { authenticatedInstance } from 'api';
import { Loading } from 'components/Loading';
import styled from 'styled-components';
import { Box, Button, Text } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';
import { Redirect, Route, withRouter } from 'react-router-dom';

const SumSubContainer = styled.div`
  background-color: #fff;
`

class KYCIFrame extends React.Component {
  redirectDelayInSec = 5;
  state = {
    isScriptLoaded: false,
    providerRedirectUrl: undefined,
    redirectTimer: undefined,
    redirectTimeCountdown: this.redirectDelayInSec
  };
  savedApplicantId = '';
  redirectTimeCountdownInterval = undefined;

  async saveApplicantId(applicantId) {
    try {
      // eslint-disable-next-line
      const response = await authenticatedInstance({
        url: '/api/KYC_OnSite_SaveApplication',
        method: 'POST',
        data: {
          applicationId: applicantId,
        },
      });
    } catch (e) { }
  }

  async getIFrameInfo(forceRefresh) {
    try {
      const postData = forceRefresh ? { force: true } : {};
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
    } catch (e) { }
  }

  initializeIFrame() {
    const { accessToken, scriptUrl, flowName } = this.iFrameInfo;
    const { email } = this.props;
    if (scriptUrl.includes('test')) {
      this.launchWebSdk(accessToken, true, '', '', '');
    } else {
      this.launchWebSdk(accessToken, false, '', '', '');
    }
    
    // this.snsWebSdkInstance = snsWebSdk
    //   .Builder(scriptUrl, flowName)
    //   .withAccessToken(accessToken, async newAccessTokenCallback => {
    //     this.iFrameInfo = await this.getIFrameInfo(true);
    //     newAccessTokenCallback(this.iFrameInfo.accessToken);
    //   })
    //   .withConf({
    //     lang: 'en',
    //     email,
    //     onMessage: (type, payload) => {
    //       // see below what kind of messages the WebSDK generates
    //       // console.log('WebSDK onMessage', type, payload)
    //       // console.log('payload.applicantId', this.savedApplicantId);
    //       if (payload.applicantId) {
    //         //this.saveApplicantId(payload.applicantId)
    //         this.savedApplicantId = payload.applicantId;
    //       }
    //       if (type === "idCheck.onApplicantSubmitted" || type === "idCheck.onApplicantResubmitted") {
    //         this.saveApplicantId(this.savedApplicantId);
    //       }
    //     },
    //   })
    //   .build();

    // this.snsWebSdkInstance.launch('#sumsub-websdk-container');
  }

  launchWebSdk(accessToken, testNet, applicantEmail, applicantPhone, customI18nMessages) {
    this.snsWebSdkInstance = snsWebSdk.init(
            accessToken,
            // token update callback, must return Promise
            // Access token expired
            // get a new one and pass it to the callback to re-initiate the WebSDK
            () => this.newAccessTokenCallback()
        )
        .withConf({
            lang: 'en', //language of WebSDK texts and comments (ISO 639-1 format)
            email: applicantEmail,
            phone: applicantPhone,
            i18n: customI18nMessages, //JSON of custom SDK Translations
            uiConf: {
                customCss: "https://url.com/styles.css"
                // URL to css file in case you need change it dynamically from the code
                // the similar setting at Customizations tab will rewrite customCss
                // you may also use to pass string with plain styles `customCssStr:`
            },
        })
        .withOptions({ addViewportTag: false, adaptIframeHeight: true})
        // see below what kind of messages WebSDK generates
        .on('idCheck.onApplicantSubmitted', (payload) => {
            this.saveApplicantId(this.savedApplicantId);
  
        })
        .on('idCheck.onApplicantResubmitted', (payload) => {
          this.saveApplicantId(this.savedApplicantId);

      })
      .on('idCheck.onApplicantLoaded', (payload) => {
        if (payload.applicantId) {
          this.savedApplicantId = payload.applicantId;
        }
    })
      
        .on('idCheck.onError', (error) => {
            console.log('onError', error)
        });
        if(testNet) {
          this.snsWebSdkInstance = this.snsWebSdkInstance.onTestEnv();
        }
        this.snsWebSdkInstance = this.snsWebSdkInstance.build();

    // you are ready to go:
    // just launch the WebSDK by providing the container element for it
    this.snsWebSdkInstance.launch('#sumsub-websdk-container')
}

async newAccessTokenCallback() {
  this.iFrameInfo = await this.getIFrameInfo();
  return Promise.resolve(this.iFrameInfo.accessToken);
}

  async componentDidMount() {
    this.iFrameInfo = await this.getIFrameInfo();

    if (this.iFrameInfo) {
      this.setState({ isScriptLoaded: true });
      // [Artem H.] 
      // Prevent initializing SDK if current provider is 'idnow'
      if ((this.props.kyc.webSdkProviderName === "idnow" || this.props.kyc.webSdkProviderName === "jumio") && this.iFrameInfo.idnow_redirect) {
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
    const {
      t
    } = this.props;

    return (
      <React.Fragment>
        {!this.state.isScriptLoaded && <Loading />}
        {
          this.state.providerRedirectUrl && (
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
                style={{ marginLeft: "auto", marginRight: "auto" }}
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
                      }, this.redirectDelayInSec * 1000)
                    });
                  }
                }}>
                {
                  this.state.redirectTimer
                    ? t('account.accountVerification.startKyc') + ` ${this.state.redirectTimeCountdown}`
                    : t('account.accountVerification.startKyc')
                }
              </Button>
            </Box>
          )
        }
        {!this.state.providerRedirectUrl && (<SumSubContainer id="sumsub-websdk-container" />)}
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
  kyc: settings.kyc
});

export default withRouter(withNamespaces()(connect(mapStateToProps)(KYCIFrame)));