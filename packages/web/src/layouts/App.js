import React, { PureComponent } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { connect } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { Section } from 'react-bulma-components';
import qs from 'qs';
import _ from 'lodash';
import { ReactQueryDevtools } from 'react-query-devtools';

import AppHead from './AppHead';
import { Derivatives } from 'pages/Derivatives';
import { NDWallet } from 'pages/NDWallet';
import { Account } from 'pages/Account';
import { DocumentationRoutes } from 'pages/ApiDocumentation';
import {
  AdditionalFieldsForm,
  ForgotPassword,
  ResetPassword,
  AccountVerification,
  Login,
  Logout,
  SignUp,
  RedirectLogin,
  BlockAccount,
} from 'pages/Authentication';
import { Currencies, AssetStatus } from 'pages/Currencies';
import { Exchange } from 'pages/Exchange';
import { Home } from 'pages/Home';
import { Orders } from 'pages/Orders';
import {
  FiatPgResponse,
  Wallet,
  WithdrawalRequest,
  WithdrawalResponse,
} from 'pages/Wallet';
import { ConfirmInstaTrade } from 'pages/InstaTrade';
import InstaTrade from 'pages/InstaTrade/InstaTradeV2';
import { P2P } from 'pages/P2P';
import { SocialTrade, Strategy } from 'pages/SocialTrade';
import { CopyTradingMenu } from 'pages/CopyTrading';
import { CryptoPrediction } from 'pages/CryptoPrediction';

import { Authenticated, Public } from 'components/RestrictedRoutes';
import {
  PageNotFound,
  GeneralError,
  Http451Error,
} from 'components/ErrorPages';

import { ErrorModalContainer } from 'containers/Modals';
import { MobileNav } from 'containers/MobileNav';
import { TopBar, SkinnyBar, NotificationBar } from 'containers/TopBar';
import { BottomBar, AdvisoryPage } from 'containers/BottomBar';
import { MarketData, PortfolioData } from 'containers/RealTimeData';
import { Loading } from 'components/Loading';
import { ScrollToTop } from 'components/Helpers';
import { Theme } from 'containers/Theme';
import { withNamespaces } from 'react-i18next';
import styles from './App.module.scss';
import { PageWrap } from 'components/Containers';
import { saveReferralId } from 'redux/actions/profile';
import { Fees, TradingRules, CompanyRoutes } from 'pages/Company';
import { SettingsPage } from 'containers/Settings';
import { CookieConsent } from 'containers/CookieConsent';
import { OrderBookPage } from 'pages/OrderBook';
import { InitialData } from './InitialData';
import { WifiNone, WifiLow, WifiMedium, Wifi } from 'grommet-icons';

import { socket } from '../realtime';

class App extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: true,
      changeIcon: 0,
      delayTimer: 500,
    };
  }
  componentDidMount() {
    this.timer = this.timer.bind(this);
    this.changeIconfun = this.changeIconfun.bind(this);
    var intervalId = setInterval(this.timer, 5000);
    const { saveReferralId } = this.props;
    const { search } = window.location;
    this.myInter = null;

    const params = qs.parse(search, { ignoreQueryPrefix: true });

    if (_.get(params, 'ref')) {
      saveReferralId(params.ref);
    }

    // window.addEventListener('online', () => {
    //   this.setState({isConnected:true})
    // });

    // window.addEventListener('offline', () => {
    //   this.setState({isConnected:false})
    // });
  }

  componentWillUnmount() {
    // use intervalId from the state to clear the interval
    clearInterval(this.state.intervalId);
    clearInterval(this.myInter);
    this.myInter = null;
  }

  timer() {
    let lastTs = socket.getLastTS();
    if (lastTs + 10000 < new Date().getTime()) {
      this.setState({ isConnected: false });
      this.changeIconfun();
      socket.init_reauth();
    } else {
      this.setState({ isConnected: true });
      clearInterval(this.myInter);
      this.myInter = null;
    }
  }

  changeIconfun() {
    if (this.myInter) {
      return;
    }

    this.myInter = setInterval(() => {
      if (this.state.changeIcon >= 3) {
        this.setState({ changeIcon: 0 });
        this.setState({ delayTimer: 500 });
      } else {
        this.setState({ changeIcon: this.state.changeIcon + 1 });
        this.setState({ delayTimer: 1000 });
      }
    }, this.state.delayTimer);
  }

  render() {
    const {
      isLoading,
      enableLogin,
      enableCopyTrade,
      enableCryptoForecasting,
      enableInstaTrade,
      enableP2PTrading,
      enableSocialTrade,
      enableDSSO,
      mgokx,
      enableSimplex,
      enableCryptoFeatures,
      hasGeneralError,
      hasHttp451Error,
      additionalFieldsRequired,
      isAuthenticated,
      t,
    } = this.props;

    return (
      <Theme>
        {!this.state.isConnected && (
          <React.Fragment>
            <div className={styles.connectionBox}>
              {this.state.changeIcon === 0 && (
                <WifiNone color="status-error" size="large" />
              )}
              {this.state.changeIcon === 1 && (
                <WifiNone color="status-error" size="large" />
              )}
              {this.state.changeIcon === 2 && (
                <WifiMedium color="status-error" size="large" />
              )}
              {this.state.changeIcon === 3 && (
                <Wifi color="status-error" size="large" />
              )}
              <div>{t('connectivity.connectionLost')}</div>
            </div>
          </React.Fragment>
        )}
        <InitialData isAuthenticated={isAuthenticated} />
        <ReactQueryDevtools />
        <Router>
          <ScrollToTop>
            <Section paddingless={true} className={styles.App}>
              <AppHead />
              <CookieConsent />
              <Switch>
                <Route
                  render={({ location }) =>
                    hasHttp451Error
                      ? !location.pathname.includes('/error451') &&
                        !location.pathname.includes('/error') && (
                          <Redirect to="/error451" />
                        )
                      : !location.pathname.includes('/error451') &&
                        !location.pathname.includes('/error') &&
                        location.pathname === '/' && (
                          <Redirect exact={true} from="/error451" to="/" />
                        )
                  }
                />
              </Switch>
              <Switch>
                <Route
                  render={({ location }) =>
                    hasGeneralError
                      ? !location.pathname.includes('/error451') &&
                        !location.pathname.includes('/error') && (
                          <Redirect to="/error" />
                        )
                      : !location.pathname.includes('/error451') &&
                        !location.pathname.includes('/error') &&
                        location.pathname === '/' && (
                          <Redirect exact={true} from="/error" to="/" />
                        )
                  }
                />
              </Switch>
              <Switch>
                <Route
                  render={({ location }) =>
                    additionalFieldsRequired
                      ? !location.pathname.includes(
                          '/additional-information-required',
                        ) && <Redirect to="/additional-information-required" />
                      : location.pathname.includes(
                          '/additional-information-required',
                        ) && (
                          <Redirect
                            from="/additional-information-required"
                            to="/"
                          />
                        )
                  }
                />
              </Switch>

              <ToastContainer />
              <ErrorModalContainer />

              <MarketData />
              <PortfolioData />

              <MobileNav />

              <NotificationBar />

              <Route
                path="/"
                render={({ location }) =>
                  !location.pathname.includes('/trade/')
                    ? [<TopBar key="topBar" />]
                    : [<TopBar key="topBar" />, <SkinnyBar key="skinnyBar" />]
                }
              />
              {/* <TopBar />
              <SkinnyBar /> */}
              {isLoading ? (
                <PageWrap>
                  <Loading />
                </PageWrap>
              ) : (
                <React.Fragment>
                  <Switch>
                    <Route path="/" component={Home} exact={true} />
                    <Route path="/trade" component={Exchange} />
                    {enableCryptoFeatures && (
                      <Route path="/currencies" component={Currencies} />
                    )}
                    {enableInstaTrade && (
                      <Route
                        path="/insta-trade/:currency?/:payment?"
                        component={InstaTrade}
                      />
                    )}
                    {enableInstaTrade && (
                      <Route
                        path="/insta-trade-request/:token"
                        component={ConfirmInstaTrade}
                      />
                    )}
                    {enableP2PTrading && <Route path="/p2p" component={P2P} />}
                    {enableSocialTrade && (
                      <Authenticated
                        path="/social-trade"
                        component={SocialTrade}
                      />
                    )}
                    <Route path="/orderbook" component={OrderBookPage} />
                    <Route
                      path="/exchange-documentation"
                      component={DocumentationRoutes}
                    />
                    <Route path="/fees" component={Fees} />
                    <Route path="/trading-rules" component={TradingRules} />
                    <Route path="/asset-status" component={AssetStatus} />
                    {/* <Route path="/risk-and-advisory" component={AdvisoryPage} /> */}
                    <Route path="/settings" component={SettingsPage} />
                    {enableDSSO && (
                      <Authenticated
                        path="/derivatives"
                        component={Derivatives}
                      />
                    )}
                    {mgokx?.enabled && (
                      <Authenticated
                        path="/NDWallet"
                        component={NDWallet}
                      />
                    )}
                    <Authenticated path="/account" component={Account} />
                    <Authenticated path="/orders" component={Orders} />
                    {mgokx?.wallet_page && (
                    <Authenticated path="/wallet" component={Wallet} />
                    )}
                    <Authenticated path="/logout" component={Logout} />
                    {enableSimplex && (
                      <Authenticated path="/credit-card" component={Wallet} />
                    )}
                    {enableCryptoForecasting && (
                      <Authenticated
                        path="/crypto-prediction"
                        component={CryptoPrediction}
                      />
                    )}
                    {enableCopyTrade && (
                      <Authenticated
                        path="/copy-trading"
                        component={CopyTradingMenu}
                      />
                    )}
                    <Route
                      path="/withdrawal-request/:token"
                      component={WithdrawalRequest}
                    />
                    <Route
                      path="/withdrawal-response"
                      component={WithdrawalResponse}
                    />
                    <Route
                      path="/fiat-pg-response/:token"
                      component={FiatPgResponse}
                    />
                    {enableLogin && <Public path="/login" component={Login} />}
                    {enableLogin && (
                      <Public path="/signup" component={SignUp} />
                    )}
                    {enableLogin && (
                      <Public
                        path="/forgot-password"
                        component={ForgotPassword}
                      />
                    )}
                    {/* {enableLogin && (
                      <Public
                        path="/reset-password/:otp"
                        component={ResetPassword}
                      />
                    )} */}
                    {enableLogin && (
                      <Public
                        path="/account-verification/:otp"
                        component={AccountVerification}
                      />
                    )}
                    <Route
                      path="/block-account/:code"
                      component={BlockAccount}
                    />
                    {enableLogin && additionalFieldsRequired && (
                      <Authenticated
                        path="/additional-information-required"
                        component={AdditionalFieldsForm}
                      />
                    )}
                    <Route
                      path="/redirect-customer"
                      component={RedirectLogin}
                    />
                    <Route path="/error" component={GeneralError} />
                    <Route path="/error451" component={Http451Error} />
                    <CompanyRoutes />
                    <Route component={PageNotFound} />
                  </Switch>
                  <Route
                    path="/"
                    render={({ location }) =>
                      !location.pathname.includes('/trade/') && <BottomBar />
                    }
                  />
                </React.Fragment>
              )}
            </Section>
          </ScrollToTop>
        </Router>
      </Theme>
    );
  }
}

const mapStateToProps = ({
  auth: { isAuthenticated },
  user: { additionalFieldsRequired },
  exchangeSettings: {
    isSettingsLoading,
    isCurrencySettingsLoading,
    settings: {
      enableLogin,
      enableSimplex,
      enableInstaTrade,
      enableP2PTrading,
      enableSocialTrade,
      enableDSSO,
      mgokx,
      enableCopyTrade,
      enableCryptoForecasting,
      enableCryptoFeatures,
    },
    hasGeneralError,
    hasHttp451Error,
  },
  userSettings: { numberFormat },
}) => ({
  isAuthenticated,
  additionalFieldsRequired,
  isLoading:
    (isSettingsLoading || isCurrencySettingsLoading) && !hasGeneralError,
  enableLogin,
  enableSimplex,
  enableCopyTrade,
  enableInstaTrade,
  enableP2PTrading,
  enableSocialTrade,
  enableDSSO,
  mgokx,
  enableCryptoForecasting,
  enableCryptoFeatures,
  hasGeneralError,
  hasHttp451Error,
  numberFormat,
});

export default withNamespaces()(
  connect(mapStateToProps, {
    saveReferralId,
  })(App),
);
