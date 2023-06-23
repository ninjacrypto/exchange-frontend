// import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const TradingPairPrice = ({ price, tradingPair, showTradingPair }) =>
  `${price}${
    showTradingPair
      ? ` ${tradingPair.baseCurrency}/${tradingPair.quoteCurrency}`
      : ''
  }`;

TradingPairPrice.propTypes = {
  tradingPair: PropTypes.shape({
    baseCurrency: PropTypes.string,
    quoteCurrency: PropTypes.string,
  }).isRequired,
  showTradingPair: PropTypes.bool,
};

TradingPairPrice.defaultProps = {
  showTradingPair: false,
};

const mapStateToProps = ({ markets: { prices } }, { tradingPair }) => ({
  price: prices[tradingPair.quoteCurrency][tradingPair.baseCurrency].lastPrice,
});

export default connect(mapStateToProps)(TradingPairPrice);
