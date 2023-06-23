import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Authenticated } from 'components/RestrictedRoutes';
import { MenuPage } from 'pages/Generics';
import {
  AccountOverview,
  AccountPreferences,
  AffiliatesOverviewV2,
  ApiKeysOverview,
  FeeDiscount,
  SecurityOverview,
  IPWhitelisting,
  KYCPage,
  TradingDiscount,
  DeviceWhitelisting,
  PhoneVerification,
} from 'pages/Account';
import { ChangePassword } from 'pages/Authentication';
import { loadProfile } from 'redux/actions/profile';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';

class Account extends React.Component {
  componentDidMount() {
    const {
      exchangeSettings: { aeraPassEnabled },
    } = this.props;
    if (!aeraPassEnabled) this.props.loadProfile();
  }

  menuArea() {
    const {
      t: translate,
      exchangeSettings: {
        enableReferrals,
        enableExchangeToken,
        enableLogin,
        aeraPassEnabled,
        enablePhoneVerification,
      },
      tradingDiscountTiers,
    } = this.props;
    const t = nestedTranslate(translate, 'account');

    return [
      {
        children: t('overview.link'),
        exact: true,
        to: '/account',
      },
      ...(!aeraPassEnabled
        ? [
            {
              children: t('verification.link'),
              to: '/account/account-verification',
              hasTitle: true,
            },
          ]
        : []),
      ...(enablePhoneVerification
        ? [
            {
              children: t('phoneVerification.link'),
              to: '/account/phone-verification',
            },
          ]
        : []),
      {
        children: t('security.link'),
        to: '/account/security',
      },
      {
        children: t('ip-whitelisting.link'),
        to: '/account/ip-whitelisting',
      },
      ...(enableReferrals
        ? [
            {
              children: t('affiliates.link'),
              to: '/account/affiliates',
              title: translate('account.affiliates.title'),
            },
          ]
        : []),
      {
        children: t('apiKeys.link'),
        to: '/account/api-keys',
        title: translate('account.apiKeys.title'),
      },
      ...(enableExchangeToken
        ? [
            {
              children: t('feeDiscount.link'),
              to: '/account/exchange-token',
              title: translate('account.feeDiscount.title'),
            },
          ]
        : []),
      ...(tradingDiscountTiers.length
        ? [
            {
              children: t('tradingDiscount.link'),
              to: '/account/trading-discount',
              title: translate('account.tradingDiscount.title'),
            },
          ]
        : []),
      ...(enableLogin
        ? [
            {
              children: t('changePassword.link'),
              to: '/account/change-password',
              hasTitle: true,
            },
          ]
        : []),
      {
        children: t('deviceWhitelisting.link'),
        to: '/account/device-whitelisting',
        title: translate('account.deviceWhitelisting.title'),
      },
    ];
  }

  contentArea = () => {
    const {
      exchangeSettings: { enableReferrals, enableExchangeToken, enableLogin, enablePhoneVerification },
      tradingDiscountTiers,
    } = this.props;

    return (
      <React.Fragment>
        <Authenticated path="/account/" exact component={AccountOverview} />
        {enableReferrals && (
          <Authenticated
            path="/account/affiliates"
            component={AffiliatesOverviewV2}
          />
        )}
        <Authenticated
          path="/account/account-verification"
          component={KYCPage}
        />
        {enablePhoneVerification && (
          <Authenticated
            path="/account/phone-verification"
            component={PhoneVerification}
          />
        )}

        <Authenticated path="/account/api-keys" component={ApiKeysOverview} />
        <Authenticated path="/account/security" component={SecurityOverview} />
        <Authenticated
          path="/account/ip-whitelisting"
          component={IPWhitelisting}
        />
        <Authenticated
          path="/account/preferences"
          component={AccountPreferences}
        />
        {enableExchangeToken && (
          <Authenticated
            path="/account/exchange-token"
            component={FeeDiscount}
          />
        )}
        {tradingDiscountTiers.length ? (
          <Authenticated
            path="/account/trading-discount"
            component={TradingDiscount}
          />
        ) : null}
        {enableLogin && (
          <Authenticated
            path="/account/change-password"
            component={ChangePassword}
          />
        )}
        <Authenticated
          path="/account/device-whitelisting"
          component={DeviceWhitelisting}
        />
      </React.Fragment>
    );
  };

  render() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'account');

    return (
      <React.Fragment>
        <Helmet>
          <title>{t('pageTitle')}</title>
        </Helmet>
        <MenuPage menuArea={this.menuArea()} contentArea={this.contentArea} />
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({
  user: { tradingDiscountTiers },
  exchangeSettings: { settings },
}) => ({
  tradingDiscountTiers,
  exchangeSettings: settings,
});

const AccountContainer = withRouter(
  withNamespaces()(
    connect(mapStateToProps, {
      loadProfile,
    })(Account),
  ),
);

export default AccountContainer;
