import React from 'react';
import { Route } from 'react-router-dom';
import { withRouter } from 'react-router-dom';

import {
  OrderBookRedirect,
  OrderBookStandalone,
  OrderBookDataWrapper,
} from 'pages/OrderBook';
import { PageWrap } from 'components/Containers';
// import { ExchangeDesktop } from 'pages/Exchange';

const OrderBookPage = () => {
  return (
    <PageWrap
      pad={{
        horizontal: 'small',
      }}
    >
      {/* <ExchangeTitle /> */}

      <OrderBookStandalone />

      <Route path="/orderbook" component={OrderBookRedirect} exact={true} />
      <Route
        path="/orderbook/:baseCurrency-:quoteCurrency"
        component={OrderBookDataWrapper}
      />
    </PageWrap>
  );
};

export default withRouter(OrderBookPage);
