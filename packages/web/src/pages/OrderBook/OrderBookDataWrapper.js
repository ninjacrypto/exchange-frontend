import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { TradeData } from 'containers/RealTimeData';

const OrderBookDataWrapper = ({ match, markets }) => {
  const currentTradingPair = match.params;
  const { tradingPairs } = markets;
  const hasTradingPair = _.some(tradingPairs, currentTradingPair);

  if (!hasTradingPair) {
    return null;
  }

  return <TradeData tradingPair={currentTradingPair} isOrderBook={true} />;
};

const mapStateToProps = ({ markets }) => ({
  markets,
});

export default connect(mapStateToProps)(OrderBookDataWrapper);
