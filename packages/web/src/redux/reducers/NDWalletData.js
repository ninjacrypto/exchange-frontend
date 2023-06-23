import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';

import {
  LOAD_BALANCE_STARTED,
  LOAD_BALANCE_SUCCESS,
  LOAD_BALANCE_FAIL,
  LOAD_PAIRS_STARTED,
  LOAD_PAIRS_SUCCESS,
  LOAD_PAIRS_FAIL,
} from 'redux/actions/NDWalletData';

const initialState = {
  balance: [],
  isBalanceLoading: false,
  tradingPairs: [],
  isPairsLoading: false
};

export const NDWalletReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_BALANCE_STARTED:
      return { ...state, isBalanceLoading: true };
    case LOAD_BALANCE_SUCCESS:
      return {
        ...state,
        isBalanceLoading: false,
        balance: action.payload,
      };
    case LOAD_BALANCE_FAIL:
      return {
        ...state,
        isBalanceLoading: false,
      };

    // ------------- PAIRS -------------

    case LOAD_PAIRS_STARTED:
      return { ...state, isPairsLoading: true };
    case LOAD_PAIRS_SUCCESS:
      return {
        ...state,
        isPairsLoading: false,
        tradingPairs: action.payload,
      };
    case LOAD_PAIRS_FAIL:
      return {
        ...state,
        isPairsLoading: false,
      };

    default:
      return state;
  }
};
