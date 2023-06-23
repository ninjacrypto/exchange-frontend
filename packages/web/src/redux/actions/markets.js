import _ from 'lodash';
import { authenticatedInstance } from 'api';

export const ADD_CURRENCY = 'ADD_CURRENCY';
export const ADD_MARKET = 'ADD_MARKET';
export const ADD_TRADING_PAIR = 'ADD_TRADING_PAIR';
export const UPDATE_MARKET_DATA = 'UPDATE_MARKET_DATA';
export const UPDATE_EXCHANGE_DATA = 'UPDATE_EXCHANGE_DATA';
export const INITIALIZE_MARKET_DATA = 'INITIALIZE_MARKET_DATA';
export const UPDATE_BULK_MARKET_DATA = 'UPDATE_BULK_MARKET_DATA';
export const GET_CRYPTO_RATE_LIST_STARTED = 'GET_CRYPTO_RATE_LIST_STARTED';
export const GET_CRYPTO_RATE_LIST_SUCCESS = 'GET_CRYPTO_RATE_LIST_SUCCESS';
export const GET_CRYPTO_RATE_LIST_FAIL = 'GET_CRYPTO_RATE_LIST_FAIL';
export const GET_FIAT_RATE_LIST_STARTED = 'GET_FIAT_RATE_LIST_STARTED';
export const GET_FIAT_RATE_LIST_SUCCESS = 'GET_FIAT_RATE_LIST_SUCCESS';
export const GET_FIAT_RATE_LIST_FAIL = 'GET_FIAT_RATE_LIST_FAIL';

// Format the data to a standard data format, this allows us to update in one place if
// data formats ever change on the backend.
const formatMarketData = singleMarketData => {
  const {
    base,
    quote,
    full_name,
    price,
    base_volume,
    quote_volume,
    change_in_price,
    high_24hr,
    low_24hr,
    maker_fee,
    maker_fee_pro,
    taker_fee,
    taker_fee_pro,
    is_nd_wallet,
  } = singleMarketData;

  return {
    baseCurrency: base,
    quoteCurrency: quote,
    currencyFullName: full_name,
    lastPrice: price,
    volume24h: quote_volume,
    volumeBaseCurrency24h: base_volume,
    priceChange24h: change_in_price,
    priceHigh24h: high_24hr,
    priceLow24h: low_24hr,
    isNDWallet: is_nd_wallet,
    tradingPair: {
      baseCurrency: base,
      quoteCurrency: quote,
    },
    tradingFees: {
      makerFee: maker_fee,
      takerFee: taker_fee,
    },
    tradingFeesPro: {
      makerFee: maker_fee_pro,
      takerFee: taker_fee_pro
    }
  };
};

// TODO: This should be optimized -- we only need to add in the trading pairs once
// Doing all of the checks each time a price is updated hinders performance.
export const updateMarketData = marketData => {
  const formattedMarketData = formatMarketData(marketData);

  return (dispatch, getState) => {
    const {
      markets,
      exchange: { tradingPair: exchangeTradingPair },
    } = getState();

    const { baseCurrency, quoteCurrency, tradingPair } = formattedMarketData;

    if (_.isEqual(tradingPair, exchangeTradingPair)) {
      dispatch({
        type: UPDATE_EXCHANGE_DATA,
        payload: formattedMarketData,
      });
    }

    if (
      !_.isEqual(
        formattedMarketData,
        _.get(markets.prices, `${quoteCurrency}.${baseCurrency}`),
      )
    ) {
      dispatch({
        type: UPDATE_MARKET_DATA,
        payload: {
          quoteCurrency,
          baseCurrency,
          marketData: formattedMarketData,
        },
      });
    }
  };
};

export const updateBulkMarketData = marketData => {
  return (dispatch, getState) => {
    const formattedMarketData = marketData.map(singleMarketData =>
      formatMarketData(singleMarketData),
    );

    const {
      exchange: { tradingPair: exchangeTradingPair },
    } = getState();

    const prices = {};

    formattedMarketData.forEach(singleMarketData => {
      const { baseCurrency, quoteCurrency, tradingPair } = singleMarketData;

      if (!(quoteCurrency in prices)) {
        prices[quoteCurrency] = {};
      }

      prices[quoteCurrency][baseCurrency] = singleMarketData;

      if (_.isEqual(tradingPair, exchangeTradingPair)) {
        dispatch({
          type: UPDATE_EXCHANGE_DATA,
          payload: singleMarketData,
        });
      }
    });

    dispatch({
      type: UPDATE_BULK_MARKET_DATA,
      payload: prices,
    });
  };
};

export const initializeMarketData = marketData => {

  const formattedMarketData = marketData.map(singleMarketData =>
    formatMarketData(singleMarketData),
  );

  const markets = {
    tradingPairs: [],
    markets: [],
    currencies: [],
    prices: {},
    tradingPairsByCurrency: {},
    tradingFees: {},
  };

  // Add all data to the markets object, this will be in the format the reducer uses.
  formattedMarketData.forEach(singleMarketData => {
    const { baseCurrency, quoteCurrency, tradingPair } = singleMarketData;

    if (!markets.tradingPairsByCurrency[baseCurrency]) {
      markets.tradingPairsByCurrency[baseCurrency] = [];
    }

    if (!markets.tradingPairsByCurrency[quoteCurrency]) {
      markets.tradingPairsByCurrency[quoteCurrency] = [];
    }

    markets.tradingPairsByCurrency[quoteCurrency].push(tradingPair);
    markets.tradingPairsByCurrency[baseCurrency].push(tradingPair);
    markets.tradingPairs.push(tradingPair);
    markets.markets.push(quoteCurrency);
    markets.currencies.push(quoteCurrency);
    markets.currencies.push(baseCurrency);

    if (!(quoteCurrency in markets.prices)) {
      markets.prices[quoteCurrency] = {};
      markets.tradingFees[quoteCurrency] = {};
    }

    markets.prices[quoteCurrency][baseCurrency] = singleMarketData;
    markets.tradingFees[quoteCurrency][baseCurrency] =
      singleMarketData.tradingFees;
  });

  // Use [...new Set()] to get unique values in the arrays
  return {
    type: INITIALIZE_MARKET_DATA,
    payload: {
      tradingPairs: markets.tradingPairs,
      tradingPairsByCurrency: markets.tradingPairsByCurrency,
      markets: [...new Set(markets.markets)],
      currencies: [...new Set(markets.currencies)],
      prices: markets.prices,
      tradingFees: markets.tradingFees,
    },
  };
};

export const getCryptoRateList = () => {
  return async dispatch => {
    dispatch({
      type: GET_CRYPTO_RATE_LIST_STARTED,
    });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/get_crypto_price',
        method: 'GET',
        polling: true,
      });

      if (data.status === 'Success') {
        const rateList = data.data.rateList.reduce(
          (current, { currency, rate }) => {
            current[currency] = 1 / rate;
            return current;
          },
          {},
        );
        dispatch({ type: GET_CRYPTO_RATE_LIST_SUCCESS, payload: rateList });
      } else {
      }
    } catch (e) {
      console.log(e);
      dispatch({
        type: GET_CRYPTO_RATE_LIST_FAIL,
      });
    }
  };
};

export const updateCryptoRateList = data => {
  if (data.status === 'Success') {
    const rateList = data.data.rateList.reduce(
      (current, { currency, rate }) => {
        current[currency] = 1 / rate;
        return current;
      },
      {},
    );
    return { type: GET_CRYPTO_RATE_LIST_SUCCESS, payload: rateList };
  }
};

export const getFiatRateList = () => {
  return async dispatch => {
    dispatch({
      type: GET_FIAT_RATE_LIST_STARTED,
    });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/get_fiat_price',
        method: 'GET',
        polling: true,
      });

      if (data.status === 'Success') {
        const rateList = data.data.rateList.reduce(
          (current, { currency, rate }) => {
            current[currency] = rate;
            return current;
          },
          {},
        );
        dispatch({ type: GET_FIAT_RATE_LIST_SUCCESS, payload: rateList });
      } else {
      }
    } catch (e) {
      console.log(e);
      dispatch({
        type: GET_FIAT_RATE_LIST_FAIL,
      });
    }
  };
};

export const updateFiatRateList = data => {
  if (data.status === 'Success') {
    const rateList = data.data.rateList.reduce(
      (current, { currency, rate }) => {
        current[currency] = rate;
        return current;
      },
      {},
    );
    return { type: GET_FIAT_RATE_LIST_SUCCESS, payload: rateList };
  }
};
