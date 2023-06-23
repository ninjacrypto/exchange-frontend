import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Authenticated } from 'components/RestrictedRoutes';
import { MenuPage } from 'pages/Generics';
import { Helmet } from 'react-helmet';
// import { PortfolioData } from 'containers/RealTimeData';
import { WalletOverview, WalletRedirect } from 'pages/Wallet';
import { DepositOverview } from 'pages/Wallet';
import { withNamespaces } from 'react-i18next';

import { WithdrawalOverview, AutoSell } from 'pages/Wallet';
import { ConvertFunds } from 'containers/ConvertFunds';

import { fetchAllDepositAddresses } from 'redux/actions/portfolio';

import { nestedTranslate } from 'utils/strings';
import { SimplexOrder } from 'pages/Simplex';
import { AddressBook } from 'containers/AddressBook';
import { Banks } from 'containers/Banks';

class Wallet extends React.PureComponent {
  menuArea() {
    const {
      t: translate,
      enableDustConversion,
      exchangeToken,
      enableSimplex,
      enableAutoSell,
    } = this.props;
    const t = nestedTranslate(translate, 'wallet');

    return [
      {
        children: t('overview.link'),
        exact: true,
        to: '/wallet',
      },
      {
        children: t('deposits.link'),
        to: '/wallet/deposits',
        hasContentContainer: false,
        hasTitle: true,
      },
      {
        children: t('withdrawals.link'),
        to: '/wallet/withdrawals',
        hasContentContainer: false,
        hasTitle: true,
      },
      {
        children: t('addressBook.link'),
        to: '/wallet/address-book',
      },
      {
        children: t('banks.link'),
        to: '/wallet/banks',
      },
      ...(enableAutoSell
        ? [
            {
              children: t('autoSell.link'),
              to: '/wallet/auto-sell',
            },
          ]
        : []),
      ...(enableDustConversion
        ? [
            {
              children: t('convertFunds.link', { exchangeToken }),
              to: '/wallet/convert-leftover-funds',
            },
          ]
        : []),
      ...(enableSimplex
        ? [
            {
              children: t('creditCard.link'),
              to: '/credit-card',
            },
          ]
        : []),
    ];
  }

  componentDidMount() {
    this.props.fetchAllDepositAddresses();
  }

  contentArea = () => {
    const {
      enableDustConversion,
      enableSimplex,
      enableAutoSell,
    } = this.props;

    return (
      <React.Fragment>
        <Authenticated path="/wallet/" exact component={WalletOverview} />
        <Authenticated
          path="/wallet/deposits"
          component={WalletRedirect}
          componentProps={{
            baseRoute: 'deposits',
          }}
          exact
        />
        <Authenticated
          path="/wallet/deposits/:currency"
          component={DepositOverview}
        />
        <Authenticated
          path="/wallet/withdrawals"
          component={WalletRedirect}
          componentProps={{
            baseRoute: 'withdrawals',
          }}
          exact
        />
        <Authenticated
          path="/wallet/withdrawals/:currency"
          component={WithdrawalOverview}
        />
        <Authenticated path="/wallet/address-book" component={AddressBook} />
        <Authenticated path="/wallet/banks" component={Banks} />
        {enableAutoSell && (
          <Authenticated path="/wallet/auto-sell" component={AutoSell} />
        )}
        {enableDustConversion && (
          <Authenticated
            path="/wallet/convert-leftover-funds"
            component={ConvertFunds}
          />
        )}
        {enableSimplex && (
          <Authenticated path="/credit-card" component={SimplexOrder} />
        )}
      </React.Fragment>
    );
  };

  render() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'wallet');

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
  profile,
  exchangeSettings: {
    settings: {
      enableDustConversion,
      exchangeToken,
      enableSimplex,
      enableAutoSell,
    },
  },
}) => ({
  profile,
  enableDustConversion,
  exchangeToken,
  enableSimplex,
  enableAutoSell,
});

const mapDispatchToProps = {
  fetchAllDepositAddresses,
};

const WalletContainer = withRouter(
  withNamespaces()(connect(mapStateToProps, mapDispatchToProps)(Wallet)),
);

export default WalletContainer;
