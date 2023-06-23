import React, { PureComponent, Fragment, useState } from 'react';
import _ from 'lodash';
import { AutoSizer, Table, Column } from 'react-virtualized';
import { connect, useSelector } from 'react-redux';
import classNames from 'classnames';
import { Portal } from 'react-portal';

import { Loading } from 'components/Loading';
import styles from './OrderBook.module.scss';
import cx from 'classnames';
import { formatNumberToPlaces, numberParser } from 'utils/numbers';
import { updateOrderBookSelection } from 'redux/actions/exchange';
import { withNamespaces } from 'react-i18next';
import { FiatConverter } from 'containers/FiatConverter';
import { Box, Text } from 'components/Wrapped';
import { PrettyNumberTZ } from 'components/Helpers';
import { getSingleTradingPairSettings } from 'redux/selectors/settings';
import { Arrow, Tooltip, usePopper } from 'components/Tooltip/Popper';
import { getRecentTradeHistoryItem } from 'redux/selectors/exchange';

const OrderBookTotal = withNamespaces()(({ t }) => {
  const {
    bidBaseCurrency,
    bidQuoteCurrency,
    askBaseCurrency,
    askQuoteCurrency,
  } = useSelector(({ exchange: { orderBookTotal } }) => orderBookTotal);
  const { baseCurrency, quoteCurrency } = useSelector(
    ({ exchange: { tradingPair } }) => tradingPair,
  );

  const renderRow = (text, value, currency, i) => (
    <Box direction="row" justify="between" gap="small" pad="none" flex={false} key={i}>
      <Box pad="none" flex={false}>
        <Text>{text}</Text>
      </Box>
      <Box pad="none" flex={false}>
        <Text color="textStrong">
          {formatNumberToPlaces(value)} {currency}
        </Text>
      </Box>
    </Box>
  );

  const rows = [
    {
      text: t('exchange.bidTotal'),
      value: bidBaseCurrency,
      currency: baseCurrency,
    },
    {
      text: t('exchange.bidTotal'),
      value: bidQuoteCurrency,
      currency: quoteCurrency,
    },
    {
      text: t('exchange.askTotal'),
      value: askBaseCurrency,
      currency: baseCurrency,
    },
    {
      text: t('exchange.askTotal'),
      value: askQuoteCurrency,
      currency: quoteCurrency,
    },
  ];

  return (
    <Box pad="small" gap="xsmall">
      {rows.map(({ text, value, currency }, i) =>
        renderRow(text, value, currency, i),
      )}
    </Box>
  );
});

const OrderBookMidPoint = ({
  width,
  price,
  fiatPrice,
  priceKey,
  priceClass,
  side,
  lastPrice,
  tickDecimals,
  tradingPair,
}) => {
  const { reference, popper } = usePopper({ placement: 'left' });
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <React.Fragment>
      <Box
        background="background-4"
        pad="none"
        align="center"
        justify="center"
        round={false}
        fill={false}
        style={{ height: 20, width: width }}
        basis="auto"
        forwardRef={reference}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
      >
        <Box pad="none" direction="row" justify="center" align="center" gap="small">
          <Text
            textAlignment="centered"
            style={{ flex: 1 }}
            fontFamily="alt"
            size="xsmall"
            // className={this.state.priceClass}
            // key={this.state.priceKey}
            weight={600}
          >
            <PrettyNumberTZ
              number={formatNumberToPlaces(lastPrice, tickDecimals)}
              color={side ? (side === 'BUY' ? 'bidColor' : 'askColor') : 'text'}
            />
          </Text>
          <Text size="xsmall" fontFamily="alt">
            <FiatConverter
              isFiat={true}
              lastPrice={lastPrice}
              market={tradingPair.quoteCurrency}
              color="text"
            />
          </Text>
        </Box>
      </Box>
      <Portal>
        <Tooltip
          forwardRef={popper}
          hidden={!tooltipVisible}
          width={{ max: '300px' }}
          background="background-4"
        >
          {tooltipVisible && <OrderBookTotal />}
          <Arrow data-popper-arrow background="background-4" />
        </Tooltip>
      </Portal>
    </React.Fragment>
  );
};

const ToolTipRow = ({ text, value }) => (
  <Box direction="row" justify="between" gap="small" pad="none" flex={false}>
    <Box pad="none" flex={false}>
      <Text>{text}</Text>
    </Box>
    <Box pad="none" flex={false}>
      <Text color="textStrong">{value}</Text>
    </Box>
  </Box>
);

const OrderBookTooltip = withNamespaces()(({
  index,
  data,
  tradingPair: { baseCurrency, quoteCurrency },
  side = 'ask',
  currencySettings,
  t
}) => {
  const currencies = currencySettings;
  const { reference, popper } = usePopper({
    placement: 'left',
  });
  let sumBase = 0;
  let sumQuote = 0;
  const fixedIndex = side === 'ask' ? data.length - (index + 1) : index;
  const fixedData = side === 'ask' ? _.reverse([...data]) : data;

  for (let i = 0; i <= fixedIndex; i++) {
    const { price, volume } = fixedData[i];
    sumBase += volume;
    sumQuote += price * volume;
  }

  const formatBalance = (value, currency) => {
    const isFiat = _.startsWith(
      _.get(currencies, `${currency}.walletType`),
      'Fiat',
    );

    return isFiat
      ? formatNumberToPlaces(value, 2)
      : formatNumberToPlaces(value);
  };

  return (
    <React.Fragment>
      <div ref={reference}></div>
      <Portal>
        <Tooltip
          forwardRef={popper}
          hidden={false}
          background="background-4"
          flex={false}
          width={{ max: '300px' }}
        >
          <Box pad="small" gap="small" flex={false}>
            <ToolTipRow
              text={t('exchange.avgPrice')}
              value={`≈${formatBalance(sumQuote / sumBase, quoteCurrency)}`}
            />
            <ToolTipRow
              text={t('exchange.baseTotal', {baseCurrency})}
              // text={`Total ${baseCurrency}`}
              value={formatBalance(sumBase, baseCurrency)}
            />
            <ToolTipRow
              text={t('exchange.quoteTotal', {quoteCurrency})}
              // text={`Total ${quoteCurrency}`}
              value={formatBalance(sumQuote, quoteCurrency)}
            />
          </Box>
          <Arrow data-popper-arrow />
        </Tooltip>
      </Portal>
    </React.Fragment>
  );
});

class OrderBook extends PureComponent {
  state = {
    priceClass: '',
    priceKey: '',
    arrow: '',
    askHover: -1,
    bidHover: -1,
  };

  handleRowClick = side => ({ rowData, index }) => {
    if (!_.isEmpty(rowData)) {
      this.props.updateOrderBookSelection({
        rowData,
        side,
        index,
        updatedOrderSide: side,
      });
    }
  };

  handlePriceClick = ({ event, number }) => {
    event.stopPropagation();
    this.props.updateOrderBookSelection({
      rowData: { price: numberParser.parse(number) },
    });
  };

  renderVolumeBar = ({ side, width }) => ({ cellData }) => {
    const maxVolume = _.get(this.props, `maxVolume${side}`);
    return (
      <div
        className={classNames(styles.depthBar, styles[side])}
        style={{
          width: (cellData / maxVolume) * width,
        }}
      />
    );
  };

  renderTooltipBar = side => ({ rowIndex }) => {
    const hovered = _.get(this.state, `${side}Hover`);
    const isActive = hovered === rowIndex;
    const backgroundActive =
      side === 'ask'
        ? hovered >= 0 && hovered <= rowIndex
        : hovered >= 0 && hovered >= rowIndex;

    if (backgroundActive) {
      return (
        <div
          className={classNames(styles.depthBar, styles.hovered, {
            [styles[`active-${side}`]]: isActive,
          })}
        />
      );
    }

    return null;
  };

  renderTooltipHelper = side => ({ rowIndex }) => {
    const hovered = _.get(this.state, `${side}Hover`);
    const isActive = hovered === rowIndex;
    const data =
      side === 'ask' ? this.props.orderBookAsk : this.props.orderBookBid;

    if (!isActive) {
      return null;
    }

    return (
      <OrderBookTooltip
        index={rowIndex}
        data={data}
        tradingPair={this.props.tradingPair}
        side={side}
        currencySettings={this.props.currencySettings}
      />
    );
  };

  renderPrice = ({ side, precision }) => ({ cellData, rowIndex, ...rest }) => {
    return (
      <PrettyNumberTZ
        number={formatNumberToPlaces(cellData, precision, { trim: false })}
        onClick={this.handlePriceClick}
        handleClickValues={{ updatedOrderSide: side }}
        color={side === 'ask' ? 'askColor' : 'bidColor'}
      />)
  };

  renderVolume = ({ cellData }) => {
    return (
      <PrettyNumberTZ
        addTrailing={false}
        number={formatNumberToPlaces(cellData, 4, {
          trim: false,
        })}
      />
    );
  };

  renderTotal({ rowData: { volume, price } }) {
    return (
      <PrettyNumberTZ
        number={formatNumberToPlaces(volume * price, 6, { trim: false })}
      />
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const lastPrice = _.get(this.props, 'lastPrice');
    const prevLastPrice = _.get(prevProps, 'lastPrice');

    if (lastPrice !== prevLastPrice) {
      let newClass = '';

      if (lastPrice > prevLastPrice) {
        newClass = styles.priceIncrease;
      } else {
        newClass = styles.priceDecrease;
      }
      this.setState({
        priceClass: newClass,
        priceKey: Date.now(),
      });
    }
  }

  // renderRow(props) {
  //   const { key, ...rest } = props;
  //   const { askHover } = this.state;
  //   const background = askHover && askHover >= index ? 'rg'

  //   return <div key={key}>{defaultTableRowRenderer(rest)}</div>;
  // }

  render() {
    const {
      orderBookAsk,
      orderBookBid,
      tradingPair,
      lastPrice,
      tradingPairSettings: { tickDecimals, tradeAmountDecimals },
      tradeHistoryItem: { side },
      t,
      currencySettings
    } = this.props;
    const { baseCurrency, quoteCurrency } = tradingPair;
    return (
      <Fragment>
        <div className="react-virtualized-container-fix">
          {!_.isEmpty(tradingPair) ? (
            <AutoSizer>
              {({ height, width }) => (
                <Fragment>
                  <Table
                    height={height / 2}
                    width={width}
                    headerHeight={30}
                    rowCount={orderBookAsk.length}
                    rowGetter={({ index }) => orderBookAsk[index]}
                    rowHeight={18}
                    scrollToIndex={orderBookAsk.length - 1}
                    onRowClick={this.handleRowClick('ask')}
                    rowClassName={cx(styles.row)}
                    // rowRenderer={this.renderRow}
                    onRowMouseOver={({ index }) =>
                      this.setState({ askHover: index })
                    }
                    onRowMouseOut={() => this.setState({ askHover: -1 })}
                  >
                    <Column
                      flexGrow={0}
                      width={0}
                      dataKey="price"
                      cellRenderer={this.renderTooltipHelper('ask')}
                      style={{ marginRight: 0 }}
                      headerClassName="hidden"
                      className="hidden"
                    />
                    <Column
                      label={`${t('exchange.price')}(${quoteCurrency})`}
                      flexGrow={1}
                      dataKey="price"
                      width={100}
                      cellRenderer={this.renderPrice({
                        side: 'ask',
                        precision: tickDecimals,
                      })}
                      className="alignRight"
                      headerClassName="alignRight"
                    />
                    <Column
                      label={`${t('exchange.size')}(${baseCurrency})`}
                      flexGrow={1}
                      dataKey="volume"
                      width={100}
                      cellRenderer={this.renderVolume}
                      className="alignRight"
                      headerClassName="alignRight"
                    />
                    <Column
                      label={`${t('exchange.total')}`}
                      dataKey="total"
                      width={100}
                      flexGrow={1}
                      cellRenderer={this.renderTotal}
                      className="alignRight"
                      headerClassName="alignRight"
                    />
                    <Column
                      flexGrow={0}
                      width={0}
                      className={`${styles.depthContainer} hidden`}
                      headerClassName="hidden"
                      dataKey="volume"
                      cellRenderer={this.renderVolumeBar({
                        width,
                        side: 'Ask',
                        precision: tradeAmountDecimals,
                      })}
                    />
                    <Column
                      flexGrow={0}
                      width={0}
                      className={`${styles.depthContainer} hidden`}
                      headerClassName="hidden"
                      dataKey="price"
                      cellRenderer={this.renderTooltipBar('ask')}
                    />
                  </Table>
                  {!_.isEmpty(tradingPair) && (
                    <OrderBookMidPoint
                      width={width}
                      price={
                        <PrettyNumberTZ
                          number={formatNumberToPlaces(lastPrice, tickDecimals)}
                        />
                      }
                      fiatPrice={
                        <FiatConverter
                          isFiat={true}
                          lastPrice={lastPrice}
                          market={tradingPair.quoteCurrency}
                          color="lowContrast"
                        />
                      }
                      priceClass={this.state.priceClass}
                      priceKey={this.state.priceKey}
                      side={side}
                      lastPrice={lastPrice}
                      tickDecimals={tickDecimals}
                      tradingPair={tradingPair}
                    />
                  )}
                  <Fragment>
                    <Table
                      height={height / 2 - 32}
                      width={width}
                      disableHeader={true}
                      rowCount={
                        orderBookBid.length <= 200 ? orderBookBid.length : 200
                      }
                      rowGetter={({ index }) => orderBookBid[index]}
                      rowHeight={18}
                      onRowClick={this.handleRowClick('bid')}
                      rowClassName={cx(styles.row)}
                      onRowMouseOver={({ index }) =>
                        this.setState({ bidHover: index })
                      }
                      onRowMouseOut={() => this.setState({ bidHover: -1 })}
                    >
                      <Column
                        flexGrow={0}
                        width={0}
                        dataKey="price"
                        cellRenderer={this.renderTooltipHelper('bid')}
                        style={{
                          marginRight: 0,
                        }}
                        headerClassName="hidden"
                        className="hidden"
                      />
                      <Column
                        flexGrow={1}
                        dataKey="price"
                        width={100}
                        cellRenderer={this.renderPrice({
                          side: 'bid',
                          precision: tickDecimals,
                        })}
                        className="alignRight"
                      />
                      <Column
                        flexGrow={1}
                        dataKey="volume"
                        width={100}
                        cellRenderer={this.renderVolume}
                        className="alignRight"
                      />
                      <Column
                        label="Total"
                        dataKey="total"
                        width={100}
                        flexGrow={1}
                        cellRenderer={this.renderTotal}
                        className="alignRight"
                      />
                      <Column
                        flexGrow={0}
                        width={0}
                        className={`${styles.depthContainer} hidden`}
                        headerClassName="hidden"
                        dataKey="volume"
                        cellRenderer={this.renderVolumeBar({
                          side: 'Bid',
                          width,
                          precision: tradeAmountDecimals,
                        })}
                      />
                      <Column
                        flexGrow={0}
                        width={0}
                        className={`${styles.depthContainer} hidden`}
                        headerClassName="hidden"
                        dataKey="price"
                        cellRenderer={this.renderTooltipBar('bid')}
                      />
                    </Table>
                  </Fragment>
                </Fragment>
              )}
            </AutoSizer>
          ) : (
            <Box pad="none" flex={true}>
              <Loading />
            </Box>
          )}
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  tradingPairSettings: getSingleTradingPairSettings(state, {
    tradingPair: state.exchange.tradingPair,
  }),
  tradeHistoryItem: getRecentTradeHistoryItem(state),
  orderBookAsk: state.exchange.orderBookAsk,
  orderBookBid: state.exchange.orderBookBid,
  tradingPair: state.exchange.tradingPair,
  lastPrice: state.exchange.tradingPairStats.lastPrice,
  maxVolumeAsk: state.exchange.orderBookAskMaxVolume,
  maxVolumeBid: state.exchange.orderBookBidMaxVolume,
  currencySettings: state.exchangeSettings.currencySettings,
});

export default withNamespaces()(
  connect(mapStateToProps, { updateOrderBookSelection })(OrderBook),
);
