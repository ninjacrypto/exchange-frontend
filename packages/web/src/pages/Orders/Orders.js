import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { OpenOrdersData } from 'containers/RealTimeData';
import { InstaTradeHistoryTable } from 'containers/Tables';
import { OpenOrders, UserTradeHistory, UserOrderHistory } from 'pages/Orders';

import { Authenticated } from 'components/RestrictedRoutes';
import { MenuPage } from 'pages/Generics';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';

class Orders extends React.Component {
  menuArea() {
    const { t: translate, enableInstaTrade } = this.props;
    const t = nestedTranslate(translate, 'orders');

    return [
      {
        children: t('openOrders.link'),
        exact: true,
        to: '/orders',
        hasTitle: true,
      },
      {
        children: t('orderHistory.link'),
        to: '/orders/order-history',
        hasTitle: true,
      },
      {
        children: t('tradeHistory.link'),
        to: '/orders/trade-history',
        hasTitle: true,
      },
      ...(enableInstaTrade
        ? [
            {
              children: translate('wallet.instaTrade.link'),
              to: '/orders/insta-trades',
            },
          ]
        : []),
    ];
  }

  contentArea = () => {
    const { enableInstaTrade } = this.props;
    return (
      <React.Fragment>
        <Authenticated path="/orders/" exact component={OpenOrders} />
        <Authenticated
          path="/orders/order-history"
          component={UserOrderHistory}
        />
        <Authenticated
          path="/orders/trade-history"
          component={UserTradeHistory}
        />
        {enableInstaTrade && (
          <Authenticated path="/orders/insta-trades" component={InstaTradeHistoryTable} />
        )}
      </React.Fragment>
    );
  }

  render() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'orders');

    return (
      <React.Fragment>
        <Helmet>
          <title>{t('pageTitle')}</title>
        </Helmet>
        <OpenOrdersData />
        <MenuPage
          menuArea={this.menuArea()}
          contentArea={this.contentArea}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ profile, exchangeSettings: {
  settings: {
    enableInstaTrade,
  },
}, 
}) => ({
  profile,
  enableInstaTrade,
});

const OrdersContainer = withRouter(
  withNamespaces()(connect(mapStateToProps)(Orders)),
);

export default OrdersContainer;
