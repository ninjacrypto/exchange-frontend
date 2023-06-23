import {
  INITIALIZE_OPEN_ORDERS,
  UPDATE_OPEN_ORDERS,
  LOAD_TRADE_HISTORY_STARTED,
  LOAD_TRADE_HISTORY_SUCCESS,
  LOAD_TRADE_HISTORY_FAIL,
  LOAD_ORDER_HISTORY_STARTED,
  LOAD_ORDER_HISTORY_SUCCESS,
  LOAD_ORDER_HISTORY_FAIL,
  SET_PERCENT_AMOUNT,
} from 'redux/actions/orders';
import { USER_LOGOUT_STARTED } from 'redux/actions/profile';

const initialState = {
  isOpenOrdersLoading: true,
  openOrders: [],
  isTradeHistoryLoading: true,
  tradeHistory: [],
  isOrderHistoryLoading: true,
  orderHistory: [],
  percentAmount: {
    sellValue: undefined,
    buyValue: undefined,
    buyMarketValue: undefined,
  },
};

export const ordersReducer = (state = initialState, action) => {
  switch (action.type) {
    case INITIALIZE_OPEN_ORDERS:
      return { ...state, openOrders: action.payload };
    case UPDATE_OPEN_ORDERS:
      return { ...state, openOrders: action.payload };
    case LOAD_TRADE_HISTORY_STARTED:
      return { ...state, isTradeHistoryLoading: true };
    case LOAD_TRADE_HISTORY_SUCCESS:
      return {
        ...state,
        isTradeHistoryLoading: false,
        tradeHistory: action.payload,
      };
    case LOAD_TRADE_HISTORY_FAIL:
      return { ...state, isTradeHistoryLoading: false };
    case LOAD_ORDER_HISTORY_STARTED:
      return { ...state, isOrderHistoryLoading: true };
    case LOAD_ORDER_HISTORY_SUCCESS:
      return {
        ...state,
        isOrderHistoryLoading: false,
        orderHistory: action.payload,
      };
    case LOAD_ORDER_HISTORY_FAIL:
      return { ...state, isOrderHistoryLoading: false };
    case SET_PERCENT_AMOUNT:
      return {
        ...state,
        percentAmount: {
          // ...state.percentAmount,
          [action.payload.side]: action.payload.amount,
          [`${action.payload.side}Timestamp`]: Date.now(),
          value: action.payload.amount,
          totalValue: action.payload.totalValue
        },
      };
    case USER_LOGOUT_STARTED:
      return { ...initialState };
    default:
      return state;
  }
};
