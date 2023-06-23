import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Loading } from 'components/Loading';

export class ExchangeRedirect extends React.PureComponent {
  renderRedirect() {
    const { tradingPairs, defaultPair } = this.props;
    let [baseCurrency, quoteCurrency] = [
      tradingPairs[0].baseCurrency,
      tradingPairs[0].quoteCurrency,
    ];

    if (defaultPair) {
      const splitPair = defaultPair.split('_');
      if (splitPair.length === 2) {
        [baseCurrency, quoteCurrency] = splitPair
      }
    }

    return (
      <Redirect to={`/trade/${baseCurrency}-${quoteCurrency}`} />
    )
  }

  render() {
    const { isLoading, tradingPairs } = this.props;

    return (
      <React.Fragment>
        {!isLoading && tradingPairs.length ? (
          this.renderRedirect()
        ) : (
          <Loading />
        )}
      </React.Fragment>
    );
  }
}

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

export default connect(mapStateToProps)(ExchangeRedirect);
