import React from 'react';
import _ from 'lodash';
import { moment } from 'i18n';
import { withNamespaces } from 'react-i18next';
import { authenticatedInstance } from '../../api';
import { namespaceTranslate } from 'utils/strings';
import { connect } from 'react-redux';
import { Message } from 'components/Wrapped';
import CopyTradingTable from 'pages/CopyTrading/CopyTradingTable';

const formatOpenOrder = order => {
  const {
    orderID,
    currencyType,
    marketType,
    pendingVolume,
    rate,
    orderCategory,
    side,
    orderPlacementDate,
    orderStatus,
  } = order;

  return {
    orderId: orderID,
    tradingPair: `${currencyType}/${marketType}`,
    pendingVolume: pendingVolume,
    price: rate,
    orderType: orderCategory,
    orderSide: side,
    orderState: orderStatus,
    date: moment
      .utc(orderPlacementDate)
      .local()
      .format('L HH:mm'),
  };
};

class CopyTrading extends React.Component {
  constructor(props) {
    super(props);

    const { t } = this.props;

    this.t = namespaceTranslate(t, 'copy_trading');
  }

  state = {
    tableData: [],
  };

  getTradeData = async () => {
    try {
      const { data } = await authenticatedInstance({
        url: '/api/ProTrader_CopiedTrades?Type=ALL',
        method: 'POST',
      });

      if (data.status === 'Success') {
        const formattedTrades = data.data.map(order => formatOpenOrder(order));
        this.setState({
          tableData: formattedTrades,
        });
      }
    } catch (e) {}
  };

  componentDidMount() {
    const { isFollowing } = this.props;
    if (isFollowing) {
      this.getTradeData();
    }
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps.isFollowing, this.props.isFollowing)) {
      this.getTradeData();
    }
  }

  render() {
    const { isFollowing } = this.props;
    const { tableData } = this.state;

    return (
      <React.Fragment>
        <Message background="background-5" margin={{ vertical: 'small' }}>
          {isFollowing
            ? this.t('trades.details')
            : this.t('trades.detailsUnfollowed')}
        </Message>
        <CopyTradingTable data={tableData} />
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ user: { copyTradingFollowing } }) => ({
  isFollowing: !_.isEmpty(copyTradingFollowing),
});

export default withNamespaces(['translations', 'copy_trading'])(
  connect(mapStateToProps)(CopyTrading),
);
