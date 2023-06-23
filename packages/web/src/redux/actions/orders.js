import _ from 'lodash';
import { moment } from 'i18n';
import { authenticatedInstance } from 'api';
import { triggerToast } from 'redux/actions/ui';
import { getNDWalletBalance } from 'redux/actions/NDWalletData';

export const INITIALIZE_OPEN_ORDERS = 'INITIALIZE_OPEN_ORDERS';
export const UPDATE_OPEN_ORDERS = 'UPDATE_OPEN_ORDERS';
export const LOAD_ORDER_HISTORY_STARTED = 'LOAD_ORDER_HISTORY_STARTED';
export const LOAD_ORDER_HISTORY_SUCCESS = 'LOAD_ORDER_HISTORY_SUCCESS';
export const LOAD_ORDER_HISTORY_FAIL = 'LOAD_ORDER_HISTORY_FAIL';
export const LOAD_TRADE_HISTORY_STARTED = 'LOAD_TRADE_HISTORY_STARTED';
export const LOAD_TRADE_HISTORY_SUCCESS = 'LOAD_TRADE_HISTORY_SUCCESS';
export const LOAD_TRADE_HISTORY_FAIL = 'LOAD_TRADE_HISTORY_FAIL';
export const SET_PERCENT_AMOUNT = 'SET_PERCENT_AMOUNT';

const formatOpenOrder = order => {
  const {
    order_id,
    base,
    quote,
    pending,
    volume,
    rate,
    stop_price,
    type,
    side,
    timestamp,
    status,
  } = order;

  return {
    orderId: order_id,
    tradingPair: `${base}/${quote}`,
    volume: volume,
    pendingVolume: pending,
    price: rate,
    stopPrice: stop_price,
    orderType: type,
    orderSide: side,
    orderState: status,
    date: timestamp,
    // moment
    //   .utc(timestamp)
    //   .local()
    //   .format('L HH:mm'),
  };
};

export const updateOpenOrders = order => {
  const formattedOrder = formatOpenOrder(order.Data);

  return (dispatch, getState) => {
    const openOrders = getState().orders.openOrders.slice(0);
    const index = _.findIndex(openOrders, ['orderId', formattedOrder.orderId]);

    if (index >= 0) {
      if (formattedOrder.orderState) {
        openOrders.splice(index, 1);
      } else {
        openOrders[index] = formattedOrder;
      }
    } else {
      if (!formattedOrder.orderState) {
        openOrders.unshift(formattedOrder);
      }
    }

    dispatch({
      type: UPDATE_OPEN_ORDERS,
      payload: openOrders,
    });
  };
};

export const initializeOpenOrders = orders => {
  return (dispatch, getState) => {
    if (orders.length !== 0) {
      let openOrders = {};
      const stateOpenOrders = getState().orders.openOrders;
      let formattedOrders;
      if (formattedOrders == undefined || formattedOrders == null) {
        formattedOrders = [];
      }

      if (stateOpenOrders.length === 0) {
        formattedOrders = orders.map(singleOrder => {
          return formatOpenOrder(singleOrder);
        });

        openOrders = formattedOrders;

        let index = _.findIndex(
          openOrders,
          e => {
            return e.orderId == formattedOrders[0].orderId;
          },
          0,
        );

        if (index >= 0) {
          if (formattedOrders[0].orderState) {
            openOrders.splice(index, 1);
          } else {
            openOrders[index] = formattedOrders[0];
          }
        }
      } else {
        const formattedOrder = orders.map(singleOrder =>
          formatOpenOrder(singleOrder),
        );
        openOrders = stateOpenOrders.slice(0);
        let index = _.findIndex(
          openOrders,
          e => {
            return e.orderId == formattedOrder[0].orderId;
          },
          0,
        );

        if (index >= 0) {
          if (formattedOrder[0].orderState) {
            openOrders.splice(index, 1);
          } else {
            openOrders[index] = formattedOrder[0];
          }
        } else {
          if (!formattedOrder[0].orderState) {
            openOrders.unshift(formattedOrder[0]);
          }
        }
      }

      dispatch({
        type: INITIALIZE_OPEN_ORDERS,
        payload: openOrders,
      });
    } else {
      dispatch({
        type: INITIALIZE_OPEN_ORDERS,
        payload: orders,
      });
    }
  };
};

// export const initializeOpenOrders = orders => {
//   const formattedOrders = orders.map(singleOrder =>
//     formatOpenOrder(singleOrder),
//   );

//   return {
//     type: INITIALIZE_OPEN_ORDERS,
//     payload: formattedOrders,
//   };
// };

export const cancelOrder = order => {
  return async dispatch => {
    try {
      const { data } = await authenticatedInstance({
        url: '/api/CancelOrder',
        method: 'POST',
        data: {
          side: order.orderSide.toUpperCase(),
          pair: order.tradingPair.replace('/', '_'),
          orderId: order.orderId,
        },
      });

      if (data.status === 'Success') {
        dispatch(triggerToast('orderCancelled', 'success'));
      } else {
        dispatch(triggerToast(data.message, 'error')); 
      }
    } catch (e) {}
  };
};

const handlePlaceOrder = _.debounce(
  async (dispatch, orderData) => {
    // Format any numbers to strings
    const formattedData = {};
    Object.entries(orderData).forEach(([key, value]) => {
      if (_.includes(['rate', 'volume', 'stop', 'trail'], key)) {
        formattedData[key] = value.toString();
      } else {
        formattedData[key] = value;
      }
    });

    try {
      const { data } = await authenticatedInstance({
        url: 'api/PlaceOrder',
        method: 'POST',
        data: { ...formattedData },
      });

      if (data.status === 'Success') {
        const hasSuccess = _.includes(
          ['MSG_ORDER_ACCEPTED', 'Success_General'],
          data?.message,
        );
        dispatch(triggerToast(data?.message, hasSuccess ? 'success' : 'error'));
        dispatch(getNDWalletBalance());
      } else {
        if (_.isEqual(data.message, 'OKX_Failure')) {
          dispatch(triggerToast(data.data, 'error'));
        } else {
          dispatch(triggerToast(data.message, 'error'));
        }
      }
    } catch (e) {
      console.log(e);
    }
  },
  1500,
  { leading: true, trailing: false },
);

const handlePlaceOrderPriced = _.debounce(
  async (dispatch, orderData) => {
    // Format any numbers to strings
    const formattedData = {};
    Object.entries(orderData).forEach(([key, value]) => {
      if (_.includes(['rate', 'stop', 'trail'], key)) {
        formattedData[key] = value.toString();
      } else {
        formattedData[key] = value;
      }
    });
    formattedData['amount'] = parseFloat(formattedData.volume);
    delete formattedData.type
    delete formattedData.volume

    try {
      const { data } = await authenticatedInstance({
        url: 'api/PlaceOrder_Priced',
        method: 'POST',
        data: { ...formattedData },
      });

      if (data.status === 'Success') {
        const hasSuccess = _.includes(
          ['MSG_ORDER_ACCEPTED', 'Success_General'],
          data?.message,
        );
        dispatch(triggerToast(data?.message, hasSuccess ? 'success' : 'error'));
        dispatch(getNDWalletBalance());
      } else {
        if (_.isEqual(data.message, 'OKX_Failure')) {
          dispatch(triggerToast(data.data, 'error'));
        } else {
          dispatch(triggerToast(data.message, 'error'));
        }
      }
    } catch (e) {
      console.log(e);
    }
  },
  1500,
  { leading: true, trailing: false },
);

export const placeOrder = orderData => {
  delete orderData.total;

  return dispatch => handlePlaceOrder(dispatch, orderData);
};

export const placeOrderPriced = orderData => {
  delete orderData.total;

  return dispatch => handlePlaceOrderPriced(dispatch, orderData);
};

const handleGetTradeHistory = _.debounce(async (dispatch, tradingPair) => {
  if (tradingPair !== 'ALL') {
    tradingPair = `${tradingPair.quoteCurrency}-${tradingPair.baseCurrency}`;
  }
  try {
    dispatch({
      type: LOAD_TRADE_HISTORY_STARTED,
    });

    const { data } = await authenticatedInstance({
      url: '/api/TradeHistory',
      method: 'GET',
      data: {
        side: 'ALL',
        pair: tradingPair,
        count: 100,
        page: 1,
      },
      polling: true,
    });

    if (data.status === 'Success') {
      dispatch({
        type: LOAD_TRADE_HISTORY_SUCCESS,
        payload: data.data,
      });
    }
  } catch (e) {
    dispatch({
      type: LOAD_TRADE_HISTORY_FAIL,
    });
  }
}, 1500);

// By default will fetch all trade history, for specific trading pairs `tradingPair` should
// be the standard tradingPair shape across the app.
export const getTradeHistory = (tradingPair = 'ALL') => {
  return dispatch => handleGetTradeHistory(dispatch, tradingPair);
};

const formatUserOrderHistory = tradeHistory =>
  tradeHistory.map(({ currencyPair, ...rest }) => {
    const [trade, market] = currencyPair.split('-');

    return {
      market,
      trade,
      ...rest,
    };
  });

export const getOrderHistory = (tradingPair = 'ALL') => {
  if (tradingPair !== 'ALL') {
    tradingPair = `${tradingPair.quoteCurrency}-${tradingPair.baseCurrency}`;
  }

  return async dispatch => {
    try {
      dispatch({
        type: LOAD_ORDER_HISTORY_STARTED,
      });

      const { data } = await authenticatedInstance({
        url: '/api/TradeHistory_Grouped',
        method: 'GET',
        data: {
          side: 'ALL',
          pair: tradingPair,
        },
        polling: true,
      });

      if (data.status === 'Success') {
        dispatch({
          type: LOAD_ORDER_HISTORY_SUCCESS,
          payload: formatUserOrderHistory(data.data),
        });
      }
    } catch (e) {
      dispatch({
        type: LOAD_ORDER_HISTORY_FAIL,
      });
    }
  };
};

export const setAmount = (side, percentSelected, marketOrder) => {
  return (dispatch, getState) => {
    const { portfolios } = getState().portfolio;
    const {
      tradingPair: { baseCurrency, quoteCurrency },
      orderBookAsk
    } = getState().exchange;

    let lastPrice;
    let totalValue;
    let currency = side === 'BUY' ? quoteCurrency : baseCurrency;
    const balance = _.get(portfolios, `${currency}.balance`, 0);

    if (side === 'BUY') {
      if (!_.isEmpty(orderBookAsk)) {
        orderBookAsk.sort((a, b) => a.price - b.price);
        let roundTotal = 0
        orderBookAsk.forEach((element) => {
          element.total = (element.volume * element.price);
          if (roundTotal == 0) {
            element.roundTotal = roundTotal + element.total;
            roundTotal = element.roundTotal;
          } else {
            if (roundTotal < (percentSelected * balance)) {
              element.roundTotal = roundTotal + element.total;
              roundTotal = element.roundTotal;

              if (roundTotal >= (percentSelected * balance)) {
                lastPrice = element.price;
                return;
              } else {
                lastPrice = element.price;
              }
            }
          }
        });
      }
    }

    let amount = side === 'BUY'
        ? (percentSelected * balance) / lastPrice
        : percentSelected * balance;

    amount = amount === Infinity ? 0 : amount;

    if (side === 'BUY') {
      totalValue = percentSelected * balance
      totalValue = totalValue === Infinity ? 0 : totalValue;
    }
  
    dispatch({
      type: SET_PERCENT_AMOUNT,
      payload: {
        side: `${side.toLowerCase()}Value`,
        amount,
        totalValue
      },
    });
  };
};
