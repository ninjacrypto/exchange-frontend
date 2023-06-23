import _ from 'lodash';
import { formatNumberToPlaces, convertCurrency, add } from 'utils';
import instance, { authenticatedInstance } from 'api';
import { triggerToast, triggerModalOpen } from 'redux/actions/ui';

export const LOAD_BALANCE_STARTED = 'LOAD_BALANCE_STARTED';
export const LOAD_BALANCE_SUCCESS = 'LOAD_BALANCE_SUCCESS';
export const LOAD_BALANCE_FAIL = 'LOAD_BALANCE_FAIL';

export const LOAD_PAIRS_STARTED = 'LOAD_PAIRS_STARTED';
export const LOAD_PAIRS_SUCCESS = 'LOAD_PAIRS_SUCCESS';
export const LOAD_PAIRS_FAIL = 'LOAD_PAIRS_FAIL';

// Format the data to a standard data format, this allows us to update in one place if
// data formats ever change on the backend.
const formatMarketData = singleMarketData => {
  const {
    base,
    quote,
    maker_fee,
    maker_fee_pro,
    taker_fee,
    taker_fee_pro,
  } = singleMarketData;

  return {
    baseCurrency: base,
    quoteCurrency: quote,
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
      takerFee: taker_fee_pro,
    },
  };
};

export const getNDWalletBalance = () => {
  return async dispatch => {
    dispatch({
      type: LOAD_BALANCE_STARTED,
    });

    try {
      const { data } = await authenticatedInstance({
        url: '/okx/balance',
        method: 'GET',
      });

      if (_.isEqual(data.status, 'Success')) {
        dispatch({
          type: LOAD_BALANCE_SUCCESS,
          payload: data.data,
        });
      } else {
        dispatch({ type: LOAD_BALANCE_FAIL });
      }
    } catch (e) {
      console.log(e.response);
      dispatch({ type: LOAD_BALANCE_FAIL });
    }
  };
};

export const getNDWalletPairs = () => {
  return async dispatch => {
    dispatch({
      type: LOAD_PAIRS_STARTED,
    });

    try {
      const { data } = await authenticatedInstance({
        url: '/okx/pairs',
        method: 'GET',
      });

      if (_.isEqual(data.status, 'Success')) {
        const formattedMarketData = data.data.map(singleMarketData =>
          formatMarketData(singleMarketData),
        );
        let  tradingPairs = [];
        formattedMarketData.forEach(singleMarketData => {
            const {tradingPair } = singleMarketData;
            tradingPairs.push(tradingPair);
        });
        dispatch({
          type: LOAD_PAIRS_SUCCESS,
          payload: tradingPairs,
        });
      } else {
        dispatch({ type: LOAD_PAIRS_FAIL });
      }
    } catch (e) {
      console.log(e.response);
      dispatch({ type: LOAD_PAIRS_FAIL });
    }
  };
};
