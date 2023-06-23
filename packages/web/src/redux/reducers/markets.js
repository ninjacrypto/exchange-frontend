import {
  ADD_MARKET,
  UPDATE_MARKET_DATA,
  ADD_CURRENCY,
  ADD_TRADING_PAIR,
  INITIALIZE_MARKET_DATA,
  UPDATE_BULK_MARKET_DATA,
  GET_CRYPTO_RATE_LIST_STARTED,
  GET_CRYPTO_RATE_LIST_SUCCESS,
  GET_CRYPTO_RATE_LIST_FAIL,
  GET_FIAT_RATE_LIST_STARTED,
  GET_FIAT_RATE_LIST_SUCCESS,
  GET_FIAT_RATE_LIST_FAIL,
} from 'redux/actions/markets';

const initialState = {
  isLoading: true,
  isMarketsInitialized: false,
  currencies: [],
  markets: [],
  prices: {},
  tradingPairs: [],
  tradingPairsByCurrency: {},
  rateList: {},
  tradingFees: {},
};

export const marketReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_CURRENCY:
      return { ...state, currencies: [...state.currencies, action.payload] };
    case ADD_MARKET:
      return { ...state, markets: [...state.markets, action.payload] };
    case ADD_TRADING_PAIR:
      return {
        ...state,
        tradingPairs: [...state.tradingPairs, action.payload],
      };
    case INITIALIZE_MARKET_DATA:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        isMarketsInitialized: true,
      };
    case UPDATE_BULK_MARKET_DATA:
      return { ...state, prices: action.payload };
    case UPDATE_MARKET_DATA:
      return {
        ...state,
        isLoading: false,
        prices: {
          ...state.prices,
          [action.payload.quoteCurrency]: {
            ...state.prices[action.payload.quoteCurrency],
            [action.payload.baseCurrency]: action.payload.marketData,
          },
        },
      };
    case GET_CRYPTO_RATE_LIST_STARTED:
    case GET_FIAT_RATE_LIST_STARTED:
      return { ...state, isLoading: true };
    case GET_CRYPTO_RATE_LIST_FAIL:
    case GET_FIAT_RATE_LIST_FAIL:
      return { ...state, isLoading: false };
    case GET_CRYPTO_RATE_LIST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        rateList: {
          ...state.rateList,
          crypto: action.payload,
        },
      };
    case GET_FIAT_RATE_LIST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        rateList: {
          ...state.rateList,
          fiat: action.payload,
        },
      };
    default:
      return state;
  }
};
