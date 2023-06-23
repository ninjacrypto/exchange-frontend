import React from 'react';
import _ from 'lodash';
import { Route } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { socket } from 'realtime';
import { ExchangeRedirect, ExchangeDataWrapper } from 'pages/Exchange';
// Currently contains the mobile exchange layout as well
import { ExchangeDesktop, ExchangeLayout } from 'pages/Exchange';

import './Exchange.scss';
import { PageWrap } from 'components/Containers';
import { formatCrypto } from 'utils';
import { useMediaQuery } from 'react-responsive';
import { getIsAuthenticated } from 'redux/selectors/auth';


const ExchangeTitleWrapper = ({ tradingPairStats }) => (
  <Helmet>
    {!_.isEmpty(tradingPairStats) && (
      <title>{`${formatCrypto(tradingPairStats.lastPrice, true)} ${
        tradingPairStats.baseCurrency
      }/${tradingPairStats.quoteCurrency}`}</title>
    )}
  </Helmet>
);

const mapStateToProps = ({ exchange }) => ({
  tradingPairStats: exchange.tradingPairStats,
});

const ExchangeTitle = connect(mapStateToProps)(ExchangeTitleWrapper);

const Exchange = ({ layoutPreference }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const currentLayout = isMobile ? 'pro' : layoutPreference;

  const isAuthenticated = useSelector(getIsAuthenticated);
  const bearerToken = useSelector(
    ({ auth: { authorization } }) => authorization,
  );

  if (isAuthenticated && bearerToken) {
    socket.unsubscribe('BL');
    socket.subscribe('BL');
  }

  return (
    <PageWrap
      pad={{
        horizontal: 'none',
      }}
      className="Exchange"
      style={{ overflow: 'auto' }}
    >
      <ExchangeTitle />

      {currentLayout === 'classic' ? <ExchangeDesktop /> : <ExchangeLayout />}

      <Route path="/trade" component={ExchangeRedirect} exact={true} />
      <Route
        path="/trade/:baseCurrency-:quoteCurrency"
        component={ExchangeDataWrapper}
      />
    </PageWrap>
  );
};

const mapStateToExchangeProps = ({ userSettings: { layoutPreference } }) => ({
  layoutPreference,
});

const ExchangeContainer = withRouter(
  connect(mapStateToExchangeProps)(Exchange),
);

export default ExchangeContainer;
