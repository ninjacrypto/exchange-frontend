import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import {
  UPDATE_FAVORITES,
  UPDATE_NUMBER_FORMAT,
  UPDATE_HIDE_BALANCES,
  UPDATE_HIDE_LOW_BALANCES,
  UPDATE_LAYOUT_PREFERENCE,
  UPDATE_EXCHANGE_LAYOUTS,
} from 'redux/actions/userSettings';

const initialState = {
  favorites: [],
  numberFormat: 'df',
  hideBalances: false,
  hideLowBalances: false,
  layoutPreference: 'pro',
  exchangeLayouts: {},
};

export const initialUserSettingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_FAVORITES:
      return { ...state, favorites: action.payload };

    case UPDATE_NUMBER_FORMAT:
      return { ...state, numberFormat: action.payload };

    case UPDATE_HIDE_BALANCES:
      return { ...state, hideBalances: action.payload };
    case UPDATE_HIDE_LOW_BALANCES:
      return { ...state, hideLowBalances: action.payload };

    case UPDATE_LAYOUT_PREFERENCE:
      return { ...state, layoutPreference: action.payload };

    case UPDATE_EXCHANGE_LAYOUTS:
      return { ...state, exchangeLayouts: action.payload };

    default:
      return state;
  }
};

const persistConfig = {
  key: 'userSettings',
  storage: storage,
  whitelist: [
    'favorites',
    'numberFormat',
    'hideBalances',
    'hideLowBalances',
    'layoutPreference',
    'exchangeLayouts',
  ],
};

export const userSettingsReducer = persistReducer(
  persistConfig,
  initialUserSettingsReducer,
);
