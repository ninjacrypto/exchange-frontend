import React, { Fragment } from 'react';
import { AutoSizer, Table, Column } from 'react-virtualized';
import { connect } from 'react-redux';
import { Loading } from 'components/Loading';
import { withNamespaces } from 'react-i18next';
import { updateOrderBookSelection } from 'redux/actions/exchange';
import { PrettyNumberTZ } from 'components/Helpers';
import { getTradeHistory } from 'redux/selectors/exchange';
import { getSingleTradingPairSettings } from 'redux/selectors/settings';
import { formatNumberToPlaces } from 'utils';

class TradeHistory extends React.Component {
  handleRowClick = ({ rowData: { price } }) => {
    this.props.updateOrderBookSelection({ rowData: { price } });
  };

  renderPrice = ({ cellData, rowData: { side } }) => {
    const {
      tradingPairSettings: { tickDecimals },
    } = this.props;

    return (
      <PrettyNumberTZ
        number={formatNumberToPlaces(cellData, tickDecimals)}
        color={side.toLowerCase() === 'buy' ? 'bidColor' : 'askColor'}
      />
    );
  };

  renderVolume = ({ cellData }) => {
    const {
      tradingPairSettings: { tradeAmountDecimals },
    } = this.props;

    return <PrettyNumberTZ number={formatNumberToPlaces(cellData, tradeAmountDecimals)} />;
  };

  render() {
    const { tradeHistory, t } = this.props;

    return (
      <Fragment>
        <div className="react-virtualized-container-fix">
          {tradeHistory !== null ? (
            <Fragment>
              <AutoSizer>
                {({ height, width }) => (
                  <Table
                    height={height}
                    width={width}
                    headerHeight={30}
                    rowCount={tradeHistory.length}
                    rowGetter={({ index }) => tradeHistory[index]}
                    rowHeight={18}
                    onRowClick={this.handleRowClick}
                  >
                    <Column
                      label={t('exchange.price')}
                      flexGrow={1}
                      dataKey="price"
                      width={100}
                      cellRenderer={this.renderPrice}
                    />
                    <Column
                      label={t('exchange.size')}
                      flexGrow={1}
                      dataKey="volume"
                      width={100}
                      cellRenderer={this.renderVolume}
                    />
                    <Column
                      label={t('exchange.time')}
                      dataKey="time"
                      flexShrink={1}
                      width={75}
                      className="monospace-numbers"
                    />
                  </Table>
                )}
              </AutoSizer>
            </Fragment>
          ) : (
            <Loading />
          )}
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  tradeHistory: getTradeHistory(state),
  tradingPairSettings: getSingleTradingPairSettings(state, {
    tradingPair: state.exchange.tradingPair,
  }),
});

export default withNamespaces()(
  connect(
    mapStateToProps,
    { updateOrderBookSelection },
  )(TradeHistory),
);
