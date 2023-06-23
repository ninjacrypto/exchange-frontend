import {
  CLEAR_EXCHANGE,
  UPDATE_ORDER_BOOK,
  UPDATE_TRADING_PAIR,
  UPDATE_TRADE_HISTORY,
  UPDATE_ORDER_BOOK_BIDS,
  UPDATE_ORDER_BOOK_ASKS,
  UPDATE_DEPTH_CHART,
  UPDATE_ORDER_BOOK_SELECTION,
  UPDATE_ORDER_BOOK_TOTAL,
} from 'redux/actions/exchange';

import { UPDATE_EXCHANGE_DATA } from 'redux/actions/markets';

const initialState = {
  isLoading: true,
  orderBookAsk: [],
  orderBookBid: [],
  orderBookAskMaxVolume: 0,
  orderBookBidMaxVolume: 0,
  tradeHistory: null,
  depthChartData: null,
  tradingPair: {},
  tradingPairStats: {},
  tradingPairSettings: {},
  orderBookSelected: { rate: 0, volume: 0, stop: 0 },
  orderBookTotal: { bidBaseCurrency: 0, bidQuoteCurrency: 0, askBaseCurrency: 0, askQuoteCurrency: 0 }
};

export const exchangeReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_EXCHANGE:
      return {
        ...initialState,
        orderBookSelected: { ...initialState.orderBookSelected },
      };
    case UPDATE_DEPTH_CHART:
      return { ...state, depthChartData: action.payload };
    case UPDATE_TRADING_PAIR:
      return { ...state, ...action.payload };
    case UPDATE_ORDER_BOOK:
      return {
        ...state,
        orderBookAsk: action.payload.asks,
        orderBookBid: action.payload.bids,
      };
    case UPDATE_ORDER_BOOK_BIDS:
      return {
        ...state,
        orderBookBid: action.payload.orderBook,
        orderBookBidMaxVolume: action.payload.maxVolume,
      };
    case UPDATE_ORDER_BOOK_ASKS:
      return {
        ...state,
        orderBookAsk: action.payload.orderBook,
        orderBookAskMaxVolume: action.payload.maxVolume,
      };
    case UPDATE_TRADE_HISTORY:
      return { ...state, tradeHistory: action.payload };
    case UPDATE_EXCHANGE_DATA:
      return { ...state, tradingPairStats: action.payload };
    case UPDATE_ORDER_BOOK_SELECTION:
      return {
        ...state,
        orderBookSelected: {
          ...action.payload,
          orderBookSelectedTimestamp: Date.now(),
        },
      };

    case UPDATE_ORDER_BOOK_TOTAL:
      return {...state, orderBookTotal: action.payload}

    default:
      return state;
  }
};
