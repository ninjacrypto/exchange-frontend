import _ from 'lodash';
import { moment } from 'i18n';
import { authenticatedInstance } from 'api';
import { triggerToast } from 'redux/actions/ui';

export const LOAD_CURRENCIES_STARTED = 'LOAD_CURRENCIES_STARTED';
export const LOAD_CURRENCIES_SUCCESS = 'LOAD_CURRENCIES_SUCCESS';
export const LOAD_CURRENCIES_FAIL = 'LOAD_CURRENCIES_FAIL';
export const LOAD_PAYMENT_METHODS_SUCCESS = 'LOAD_PAYMENT_METHODS_SUCCESS';
export const LOAD_USER_PAYMENT_METHODS_STARTED =
  'LOAD_USER_PAYMENT_METHODS_STARTED';
export const LOAD_USER_PAYMENT_METHODS_SUCCESS =
  'LOAD_USER_PAYMENT_METHODS_SUCCESS';
export const LOAD_USER_PAYMENT_METHODS_FAIL = 'LOAD_USER_PAYMENT_METHODS_FAIL';
export const LOAD_MY_OFFERS_STARTED = 'LOAD_MY_OFFERS_STARTED';
export const LOAD_MY_OFFERS_SUCCESS = 'LOAD_MY_OFFERS_SUCCESS';
export const LOAD_MY_OFFERS_FAIL = 'LOAD_MY_OFFERS_FAIL';

export const LOAD_MY_ORDERS_STARTED = 'LOAD_MY_ORDERS_STARTED';
export const LOAD_MY_ORDERS_SUCCESS = 'LOAD_MY_ORDERS_SUCCESS';
export const LOAD_MY_ORDERS_FAIL = 'LOAD_MY_ORDERS_FAIL';

export const LOAD_P2PBALANCE_STARTED = 'LOAD_P2PBALANCE_STARTED';
export const LOAD_P2PBALANCE_SUCCESS = 'LOAD_P2PBALANCE_SUCCESS';
export const LOAD_P2PBALANCE_FAIL = 'LOAD_P2PBALANCE_FAIL';

export const LOAD_P2PWALLET_STARTED = 'LOAD_P2PWALLET_STARTED';
export const LOAD_P2PWALLET_SUCCESS = 'LOAD_P2PWALLET_SUCCESS';
export const LOAD_P2PWALLET_FAIL = 'LOAD_P2PWALLET_FAIL';

export const getP2PCurrencies = () => {
  return async (dispatch, getState) => {
    try {
      const response = await authenticatedInstance({
        url: '/p2p/currencies',
        method: 'GET',
      });

      if (response.data.Status === 'Success') {
        dispatch({
          type: LOAD_CURRENCIES_SUCCESS,
          payload: response.data,
        });
      }
    } catch (e) {
      console.log(e.response);
    }
  };
};

export const getPaymentMethods = () => {
  return async (dispatch, getState) => {
    try {
      const response = await authenticatedInstance({
        url: '/p2p/payment-methods',
        method: 'GET',
      });

      if (response.status === 200) {
        dispatch({
          type: LOAD_PAYMENT_METHODS_SUCCESS,
          payload: response.data.Data,
        });
      }
    } catch (e) {
      console.log(e.response);
    }
  };
};

export const getUserPaymentMethods = () => {
  return async dispatch => {
    dispatch({ type: LOAD_USER_PAYMENT_METHODS_STARTED });
    try {
      const { data } = await authenticatedInstance({
        url: '/p2p/get-userpayment-methods',
        method: 'GET',
      });

      if (data.Status === 'Success') {
        dispatch({
          type: LOAD_USER_PAYMENT_METHODS_SUCCESS,
          payload: data.Data,
        });
      } else {
        dispatch({ type: LOAD_USER_PAYMENT_METHODS_FAIL });
      }
    } catch (e) {
      dispatch({ type: LOAD_USER_PAYMENT_METHODS_FAIL });
    }
  };
};

export const getMyOffers = initilizeValues => {
  if (!initilizeValues) {
    initilizeValues = {
      Asset: '',
      Side: '',
      Amount: '0',
      DateFrom: '',
      DateTo: '',
      StatusText: '',
    };
  }

  return async dispatch => {
    dispatch({ type: LOAD_MY_OFFERS_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: '/p2p/my-offers',
        method: 'POST',
        data: initilizeValues,
      });

      if (data.Status === 'Success') {
        dispatch({ type: LOAD_MY_OFFERS_SUCCESS, payload: data.Data });
      } else {
        dispatch({ type: LOAD_MY_OFFERS_FAIL });
      }
    } catch (e) {
      dispatch({ type: LOAD_MY_OFFERS_FAIL });
    }
  };
};

export const getMyOrders = () => {
  let initilizeValues = {
    OrderGuid: '',
  };

  return async dispatch => {
    dispatch({ type: LOAD_MY_ORDERS_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: '/p2p/my-orders',
        method: 'POST',
        data: initilizeValues,
      });

      if (data.Status === 'Success') {
        dispatch({ type: LOAD_MY_ORDERS_SUCCESS, payload: data.Data });
      } else {
        dispatch({ type: LOAD_MY_ORDERS_FAIL });
      }
    } catch (e) {
      dispatch({ type: LOAD_MY_ORDERS_FAIL });
    }
  };
};

export const getP2PBalance = initilizeValues => {
  if (!initilizeValues) {
    initilizeValues = {
      Currency: 'ALL',
    };
  }

  return async dispatch => {
    dispatch({ type: LOAD_P2PBALANCE_STARTED });
    try {
      const { data } = await authenticatedInstance({
        url: '/p2p/balance',
        method: 'POST',
        data: initilizeValues,
      });

      if (data.Status === 'Success') {
        dispatch({ type: LOAD_P2PBALANCE_SUCCESS, payload: data.Data });
      } else {
        dispatch({ type: LOAD_P2PBALANCE_FAIL });
      }
    } catch (e) {
      dispatch({ type: LOAD_P2PBALANCE_FAIL });
    }
  };
};

export const getP2PWallet = () => {
  return async dispatch => {
    dispatch({ type: LOAD_P2PWALLET_STARTED });
    try {
      const { data } = await authenticatedInstance({
        url: '/p2p/balances',
        method: 'GET',
      });

      if (data.Status === 'Success') {
        dispatch({ type: LOAD_P2PWALLET_SUCCESS, payload: data.Data });
      } else {
        dispatch({ type: LOAD_P2PWALLET_FAIL });
      }
    } catch (e) {
      dispatch({ type: LOAD_P2PWALLET_FAIL });
    }
  };
};
