import {
  LOAD_CURRENCIES_STARTED,
  LOAD_CURRENCIES_SUCCESS,
  LOAD_CURRENCIES_FAIL,
  LOAD_PAYMENT_METHODS_SUCCESS,
  SELECTED_PAYMENT_METHOD,
  LOAD_USER_PAYMENT_METHODS_STARTED,
  LOAD_USER_PAYMENT_METHODS_SUCCESS,
  LOAD_USER_PAYMENT_METHODS_FAIL,
  LOAD_MY_OFFERS_STARTED,
  LOAD_MY_OFFERS_SUCCESS,
  LOAD_MY_OFFERS_FAIL,
  LOAD_MY_ORDERS_STARTED,
  LOAD_MY_ORDERS_SUCCESS,
  LOAD_MY_ORDERS_FAIL,
  LOAD_P2PBALANCE_STARTED,
  LOAD_P2PBALANCE_SUCCESS,
  LOAD_P2PBALANCE_FAIL,
  LOAD_P2PWALLET_STARTED,
  LOAD_P2PWALLET_SUCCESS,
  LOAD_P2PWALLET_FAIL,
} from 'redux/actions/p2p';

const initialState = {
  p2pCurrencies: {},
  p2pPaymentMethods: {},
  p2pUserPaymentMethods: [],
  isMyUPMLoading: true,
  myOffers: [],
  isMyOffersLoading: true,
  myOrders: [],
  isMyOrdersLoading: true,
  p2pBalance: [],
  isP2PBalanceLoading: true,
  p2pWalletBalances: [],
  isP2PWalletLoading: true,
};

export const p2pReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_CURRENCIES_SUCCESS:
      return {
        ...state,
        p2pCurrencies: action.payload,
      };
    case LOAD_PAYMENT_METHODS_SUCCESS:
      return {
        ...state,
        p2pPaymentMethods: action.payload,
      };

    //* MY PAYMENT METHODS
    case LOAD_USER_PAYMENT_METHODS_STARTED:
      return { ...state, isMyUPMLoading: true };

    case LOAD_USER_PAYMENT_METHODS_SUCCESS:
      return {
        ...state,
        isMyUPMLoading: false,
        p2pUserPaymentMethods: action.payload,
      };

    case LOAD_USER_PAYMENT_METHODS_FAIL:
      return {
        ...state,
        isMyUPMLoading: false,
      };

    //* MY OFFERS

    case LOAD_MY_OFFERS_STARTED:
      return { ...state, isMyOffersLoading: true };
    case LOAD_MY_OFFERS_SUCCESS:
      return {
        ...state,
        isMyOffersLoading: false,
        myOffers: action.payload,
      };
    case LOAD_MY_OFFERS_FAIL:
      return {
        ...state,
        isMyOffersLoading: false,
      };

    //* MY ORDERS

    case LOAD_MY_ORDERS_STARTED:
      return { ...state, isMyOrdersLoading: true };
    case LOAD_MY_ORDERS_SUCCESS:
      return {
        ...state,
        isMyOrdersLoading: false,
        myOrders: action.payload,
      };
    case LOAD_MY_ORDERS_FAIL:
      return {
        ...state,
        isMyOrdersLoading: false,
      };

    //* P2P BALANCE

    case LOAD_P2PBALANCE_STARTED:
      return { ...state, isP2PBalanceLoading: true };
    case LOAD_P2PBALANCE_SUCCESS:
      return {
        ...state,
        isP2PBalanceLoading: false,
        p2pBalance: action.payload,
      };
    case LOAD_P2PBALANCE_FAIL:
      return {
        ...state,
        isP2PBalanceLoading: false,
      };

    //* P2P Wallet Balances

    case LOAD_P2PWALLET_STARTED:
      return { ...state, isP2PWalletLoading: true };
    case LOAD_P2PWALLET_SUCCESS:
      return {
        ...state,
        isP2PWalletLoading: false,
        p2pWalletBalances: action.payload,
      };
    case LOAD_P2PWALLET_FAIL:
      return {
        ...state,
        isP2PWalletLoading: false,
      };

    default:
      return state;
  }
};
