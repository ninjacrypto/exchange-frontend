import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Authenticated } from 'components/RestrictedRoutes';
import { MenuPage } from 'pages/Generics';
import { WalletOverview, WalletOrderHistory } from 'pages/NDWallet';
import { getNDWalletPairs } from 'redux/actions/NDWalletData';
import { NDWalletRedirect } from 'pages/NDWallet';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { DepositOverview } from 'pages/Wallet';
import { WithdrawalOverview } from 'pages/Wallet';

class NDWallet extends React.Component {
  componentDidMount() {
    this.props.getNDWalletPairs();
  }

  menuArea() {
    const { t: translate, mgokx } = this.props;
    const t = nestedTranslate(translate, 'NDWallet');

    return [
      {
        children: t('overview.link'),
        exact: true,
        to: '/NDWallet',
      },
      ...(mgokx.deposits
        ? [
          {
            children: t('deposits.link'),
            to: '/NDWallet/deposits',
            hasContentContainer: false,
            hasTitle: true,
          },
        ]
        : []),
      ...(mgokx.withdraw
        ? [
          {
            children: t('withdrawals.link'),
            to: '/NDWallet/withdrawals',
            hasContentContainer: false,
            hasTitle: true,
          },
        ]
        : []),

      {
        children: t('order-history.link'),
        to: '/NDWallet/order-history',
        hasTitle: true,
      },
    ];
  }

  contentArea = () => {
    const { mgokx } = this.props;
    return (
      <React.Fragment>
        <Authenticated path="/NDWallet" exact component={WalletOverview} />
        {mgokx.deposits && (
          <React.Fragment>
            <Authenticated
              path="/NDWallet/deposits"
              component={NDWalletRedirect}
              componentProps={{
                baseRoute: 'deposits',
              }}
              exact
            />
            <Authenticated
              path="/NDWallet/deposits/:currency"
              component={DepositOverview}
            />
          </React.Fragment>
        )}
        {mgokx.withdraw && (
          <React.Fragment>
            <Authenticated
              path="/NDWallet/withdrawals"
              component={NDWalletRedirect}
              componentProps={{
                baseRoute: 'withdrawals',
              }}
              exact
            />
            <Authenticated
              path="/NDWallet/withdrawals/:currency"
              component={WithdrawalOverview}
            />
          </React.Fragment>
        )}
        <Authenticated path="/NDWallet/order-history" exact component={WalletOrderHistory} />
      </React.Fragment>
    );
  };

  render() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'NDWallet');

    return (
      <React.Fragment>
        <Helmet>
          <title>{t('pageTitle')}</title>
        </Helmet>
        <MenuPage
          menuArea={this.menuArea()}
          contentArea={this.contentArea}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ user: { tradingDiscountTiers }, exchangeSettings: { settings } }) => ({
  tradingDiscountTiers,
  exchangeSettings: settings,
  mgokx: settings.mgokx
});

const NDWalletContainer = withRouter(
  withNamespaces()(
    connect(
      mapStateToProps,
      {
        getNDWalletPairs
      },
    )(NDWallet),
  ),
);

export default NDWalletContainer;
