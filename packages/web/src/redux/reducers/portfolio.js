import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';

import {
  UPDATE_PORTFOLIO,
  UPDATE_PORTFOLIOS,
  LOAD_PORTFOLIO_STARTED,
  LOAD_PORTFOLIO_SUCCESS,
  LOAD_PORTFOLIO_FAIL,
  INITIALIZE_PORTFOLIO,
  GENERATE_DEPOSIT_ADDRESS_STARTED,
  GENERATE_DEPOSIT_ADDRESS_SUCCESS,
  GENERATE_DEPOSIT_ADDRESS_FAIL,
  FETCH_ALL_DEPOSIT_ADDRESSES_STARTED,
  FETCH_ALL_DEPOSIT_ADDRESSES_SUCCESS,
  FETCH_ALL_DEPOSIT_ADDRESSES_FAIL,
  LOAD_DEPOSIT_HISTORY_SUCCESS,
  LOAD_WITHDRAWAL_HISTORY_SUCCESS,
  GET_WALLET_TOTAL_STARTED,
  GET_WALLET_TOTAL_SUCCESS,
  GET_WALLET_TOTAL_FAIL,
  SET_WITHDRAWAL_LIMIT,
  LOAD_DERIVATIVES_PORTFOLIO_STARTED,
  LOAD_DERIVATIVES_PORTFOLIO_SUCCESS,
  LOAD_DERIVATIVES_PORTFOLIO_FAIL
} from 'redux/actions/portfolio';
import { USER_LOGOUT_STARTED } from 'redux/actions/profile';

const initialState = {
  isLoading: true,
  portfolios: {},
  addresses: {},
  depositHistory: [],
  walletTotals: {
    btcTotal: undefined,
    fiatTotal: undefined,
  },
  withdrawalHistory: [],
  isGeneratingAddress: false,
  withdrawalLimit: {},
};

export const initialPortfolioReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_PORTFOLIO:
      return {
        ...state,
        isLoading: false,
        portfolios: {
          ...state.portfolios,
          [action.payload.currency]: action.payload,
        },
      };
    case LOAD_PORTFOLIO_STARTED:
    case GET_WALLET_TOTAL_STARTED:
    case FETCH_ALL_DEPOSIT_ADDRESSES_STARTED:
    case LOAD_DERIVATIVES_PORTFOLIO_STARTED:
      return { ...state, isLoading: true };
    case GENERATE_DEPOSIT_ADDRESS_STARTED:
      return { ...state, isLoading: true, isGeneratingAddress: true };
    case LOAD_PORTFOLIO_SUCCESS:
      return { ...state, isLoading: false, portfolios: action.payload };

    case INITIALIZE_PORTFOLIO:
      return { ...state, isLoading: false, portfolios: action.payload };
    case UPDATE_PORTFOLIOS:
      return { ...state, portfolios: action.payload };

    case LOAD_DERIVATIVES_PORTFOLIO_SUCCESS:
      return { ...state, isLoading: false, derivativesPortfolios: action.payload }

    case FETCH_ALL_DEPOSIT_ADDRESSES_SUCCESS:
      return {
        ...state,
        isLoading: false,
        addresses: {
          ...state.addresses,
          ...action.payload,
        },
      };
    case GENERATE_DEPOSIT_ADDRESS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isGeneratingAddress: false,
        addresses: {
          ...state.addresses,
          [action.payload.currency]: action.payload.address,
        },
      };
    case LOAD_PORTFOLIO_FAIL:
    case GET_WALLET_TOTAL_FAIL:
    case FETCH_ALL_DEPOSIT_ADDRESSES_FAIL:
    case LOAD_DERIVATIVES_PORTFOLIO_FAIL:
      return { ...state, isLoading: false };
    case GENERATE_DEPOSIT_ADDRESS_FAIL:
      return { ...state, isLoading: false, isGeneratingAddress: false };
    case LOAD_DEPOSIT_HISTORY_SUCCESS:
      return { ...state, depositHistory: action.payload };
    case LOAD_WITHDRAWAL_HISTORY_SUCCESS:
      return { ...state, withdrawalHistory: action.payload };
    case GET_WALLET_TOTAL_SUCCESS:
      return {
        ...state,
        isLoading: false,
        walletTotals: {
          btcTotal: action.payload.btcTotal,
          fiatTotal: action.payload.fiatTotal,
        },
      };
    case SET_WITHDRAWAL_LIMIT: {
      return { ...state, withdrawalLimit: action.payload };
    }
    case USER_LOGOUT_STARTED: {
      return { ...initialState };
    }
    default:
      return state;
  }
};

const persistConfig = {
  key: 'portfolio',
  storage: storage,
  whitelist: [],
};

export const portfolioReducer = persistReducer(
  persistConfig,
  initialPortfolioReducer,
);
