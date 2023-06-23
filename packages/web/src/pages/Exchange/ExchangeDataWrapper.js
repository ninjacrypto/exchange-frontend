import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { TradeData } from 'containers/RealTimeData';
import { initializeOpenOrders } from 'redux/actions/orders';
class ExchangeDataWrapper extends React.PureComponent {
  render() {
    const { match, markets } = this.props;
    const currentTradingPair = match.params;
    const { tradingPairs } = markets;
    const hasTradingPair = _.some(tradingPairs, currentTradingPair);

    if (!hasTradingPair) {
      this.props.initializeOpenOrders([]);
    }
    return (
      <React.Fragment>
        {hasTradingPair && <TradeData tradingPair={currentTradingPair} />}
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ markets }) => ({
  markets
});

export default connect(mapStateToProps, { initializeOpenOrders })(ExchangeDataWrapper);
