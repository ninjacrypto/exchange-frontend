import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

const OrderBookRedirect = ({ isLoading, tradingPairs, defaultPair }) => {
  const renderRedirect = () => {
    let [baseCurrency, quoteCurrency] = [
      tradingPairs[0].baseCurrency,
      tradingPairs[0].quoteCurrency,
    ];

    if (defaultPair) {
      const splitPair = defaultPair.split('_');
      if (splitPair.length === 2) {
        [baseCurrency, quoteCurrency] = splitPair;
      }
    }

    return <Redirect to={`/orderbook/${baseCurrency}-${quoteCurrency}`} />;
  };

  return (
    <React.Fragment>
      {!isLoading && tradingPairs.length ? renderRedirect() : null}
    </React.Fragment>
  );
};

const mapStateToProps = ({
  markets,
  exchangeSettings: {
    settings: { defaultPair },
  },
}) => ({
  isLoading: markets.isLoading,
  tradingPairs: markets.tradingPairs,
  defaultPair,
});

export default connect(mapStateToProps)(OrderBookRedirect);
