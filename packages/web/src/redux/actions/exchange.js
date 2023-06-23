import _ from 'lodash';
import produce from 'immer';
import { moment } from 'i18n';
import { UPDATE_EXCHANGE_DATA } from 'redux/actions/markets';
import { getTradeHistory } from 'redux/selectors/exchange';
import { getSingleTradingPairSettings } from 'redux/selectors/settings';

export const CLEAR_EXCHANGE = 'CLEAR_EXCHANGE';
export const UPDATE_DEPTH_CHART = 'UPDATE_DEPTH_CHART';
export const UPDATE_TRADING_PAIR = 'UPDATE_TRADING_PAIR';
export const UPDATE_ORDER_BOOK = 'UPDATE_ORDER_BOOK';
export const UPDATE_ORDER_BOOK_ASKS = 'UPDATE_ORDER_BOOK_ASKS';
export const UPDATE_ORDER_BOOK_BIDS = 'UPDATE_ORDER_BOOK_BIDS';
export const UPDATE_TRADE_HISTORY = 'UPDATE_TRADE_HISTORY';
export const UPDATE_ORDER_BOOK_SELECTION = 'UPDATE_ORDER_BOOK_SELECTION';
export const UPDATE_ORDER_BOOK_TOTAL = 'UPDATE_ORDER_BOOK_TOTAL';

const formatTradeHistory = tradeHistoryItem => {
  const { execution_side, timestamp, volume, rate, id } = tradeHistoryItem;

  return {
    time: moment
      .utc(timestamp)
      .local()
      .format('HH:mm:ss'),
    side: execution_side,
    price: rate,
    volume,
    id
  };
};

const formatOrderBookItem = orderBookItem => ({
  price: orderBookItem[0],
  volume: orderBookItem[1],
});

const formatOrderBook = orderBook => {
  const formattedOrderBook = orderBook.map(orderBookItem =>
    formatOrderBookItem(orderBookItem),
  );

  return _.orderBy(formattedOrderBook, 'price', 'desc');
};

const getNewOrderBook = (orderBook, singleItem, action) => {
  if (action === 'Insert') {
    orderBook.push(singleItem);
  } else {
    const index = _.findIndex(orderBook, ['price', singleItem.price]);

    if (index >= 0) {
      if (action === 'Update') {
        orderBook[index] = singleItem;
      } else if (action === 'Delete') {
        orderBook.splice(index, 1);
      }
    } else {
      if (singleItem.volume) {
        orderBook.push(singleItem);
      }
    }
  }

  return _.orderBy(orderBook, 'price', 'desc');
};

export const initializeOrderBook = (orderBook, dispatchType) => {
  const formattedOrderBook = formatOrderBook(orderBook);

  return dispatch => {
    const maxVolumeItem = _.maxBy([...formattedOrderBook], 'volume') || {};
    const maxVolume = _.get(maxVolumeItem, 'volume');

    dispatch({
      type: dispatchType,
      payload: {
        orderBook: formattedOrderBook,
        maxVolume,
      },
    });

    dispatch(updateDepthChart());
  };
};

export const updateOrderBook = (orderBookItem, dispatchType) => {
  const formattedOrderBookItem = formatOrderBookItem(orderBookItem.Data);

  return (dispatch, getState) => {
    let orderBook;

    if (dispatchType === UPDATE_ORDER_BOOK_ASKS) {
      orderBook = getState().exchange.orderBookAsk.slice(0);
    } else if (dispatchType === UPDATE_ORDER_BOOK_BIDS) {
      orderBook = getState().exchange.orderBookBid.slice(0);
    }

    const updatedOrderBook = getNewOrderBook(
      orderBook,
      formattedOrderBookItem,
      orderBookItem.TriggerType,
    );

    dispatch({
      type: dispatchType,
      payload: updatedOrderBook,
    });

    dispatch(updateDepthChart());
  };
};

export const updateOrderBookTotal = data => {
  const {
    total_buys_base,
    total_buys_quote,
    total_sells_base,
    total_sells_quote,
  } = data;

  return {
    type: UPDATE_ORDER_BOOK_TOTAL,
    payload: {
      bidBaseCurrency: total_buys_base,
      bidQuoteCurrency: total_buys_quote,
      askBaseCurrency: total_sells_base,
      askQuoteCurrency: total_sells_quote,
    },
  };
};

export const initializeTradeHistory = tradeHistory => {
  const formattedTradeHistory = tradeHistory.map(singleTradeHistory =>
    formatTradeHistory(singleTradeHistory),
  );

  return {
    type: UPDATE_TRADE_HISTORY,
    payload: formattedTradeHistory,
  };
};

export const updateTradeHistory = tradeHistoryItem => {
  const formattedTradeHistory = formatTradeHistory(tradeHistoryItem.Data);

  return (dispatch, getState) => {
    const tradeHistory = getTradeHistory(getState());
    const updatedTradeHistory = produce(tradeHistory, draftTradeHistory => {
      draftTradeHistory.unshift(formattedTradeHistory);

      if (draftTradeHistory.length > 50) {
        draftTradeHistory.length = 50;
      }
    });

    dispatch({
      type: UPDATE_TRADE_HISTORY,
      payload: updatedTradeHistory,
    });
  };
};

// * There is a way cleaner way of doing this (e.g. just editing singleItem and returning orderbook)
// * However, when this is done, the redux state is overwritten since orderBook is a reference what is currently in the store
// * Might be a Redux bug?
const getDepthChartData = (orderBook, type) => {
  let newOrderBook = orderBook.map(item => ({
    price: item.price,
    volume: item.volume,
    [`${type}TotalVolume`]: item.volume,
  }));
  let sortedOrderBook = [];

  if (type === 'ask') {
    sortedOrderBook = _.orderBy(newOrderBook, 'price', 'asc');
  } else if (type === 'bid') {
    sortedOrderBook = _.orderBy(newOrderBook, 'price', 'desc');
  }

  sortedOrderBook.forEach((singleItem, i) => {
    if (i >= 1) {
      singleItem[`${type}TotalVolume`] +=
        sortedOrderBook[i - 1][`${type}TotalVolume`];
    }
  });

  return sortedOrderBook;
};

// TODO: This can be optimized into doing asks and bids separately since updates are usually one side at a time
const updateDepthChart = () => {
  return (dispatch, getState) => {
    const {
      exchange: { orderBookAsk, orderBookBid },
    } = getState();

    const depthChartAsk = getDepthChartData(orderBookAsk, 'ask');
    const depthChartBid = getDepthChartData(orderBookBid, 'bid');

    dispatch({
      type: UPDATE_DEPTH_CHART,
      payload: _.sortBy([...depthChartBid, ...depthChartAsk], 'price'),
    });
  };
};

export const updateTradingPair = tradingPair => {
  return (dispatch, getState) => {
    const {
      markets: { prices },
    } = getState();

    if (tradingPair == 'ALL') {
      dispatch({
        type: UPDATE_TRADING_PAIR,
        payload: {
          tradingPair,
        },
      });
      return;
    }

    const currentData =
      prices[tradingPair.quoteCurrency][tradingPair.baseCurrency];

    const tradingPairSettings = getSingleTradingPairSettings(getState(), {
      tradingPair,
    });

    dispatch({
      type: UPDATE_EXCHANGE_DATA,
      payload: currentData,
    });

    dispatch({
      type: UPDATE_TRADING_PAIR,
      payload: {
        tradingPair,
        tradingPairSettings,
      },
    });

    dispatch(
      updateOrderBookSelection({ rowData: { price: currentData.lastPrice } }),
    );
  };
};

export const clearExchange = () => {
  return {
    type: CLEAR_EXCHANGE,
  };
};

export const updateOrderBookSelection = ({
  rowData: { price = 0 },
  side,
  index,
}) => {
  if (!side) {
    const payload = { rate: price.toString() };

    return {
      type: UPDATE_ORDER_BOOK_SELECTION,
      payload,
    };
  }

  return (dispatch, getState) => {
    const { exchange } = getState();

    const orderBook =
      side === 'bid'
        ? exchange.orderBookBid
        : exchange.orderBookAsk.slice(0).reverse();
    index = side === 'bid' ? index : orderBook.length - (index + 1);
    let draftPayload;

    for (let i = 0; i <= index; i++) {
      const currentData = orderBook[i];

      if (draftPayload) {
        draftPayload = {
          price: currentData.price,
          volume: draftPayload.volume + currentData.volume,
        };
      } else {
        draftPayload = currentData;
      }
    }

    dispatch({
      type: UPDATE_ORDER_BOOK_SELECTION,
      payload: {
        rate: draftPayload.price.toString(),
        volume: draftPayload.volume.toString(),
        stop: draftPayload.price.toString(),
      },
    });
  };
};
