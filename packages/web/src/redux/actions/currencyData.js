import instance from 'api';
import _ from 'lodash';
import produce from 'immer';
import { normalize, schema } from 'normalizr';

import coinDescriptionsJson from 'assets/coin-descriptions.json';

export const CURRENCY_DATA_STARTED = 'CURRENCY_DATA_STARTED';
export const CURRENCY_DATA_SUCCESS = 'CURRENCY_DATA_SUCCESS';
export const CURRENCY_DATA_FAIL = 'CURRENCY_DATA_FAIL';

const currency = new schema.Entity(
  'currencies',
  {},
  {
    idAttribute: 'symbol',
  },
);

const coinDescriptions = normalize(coinDescriptionsJson, [currency]);

export const getCurrencyData = () => {
  return async dispatch => {
    dispatch({
      type: CURRENCY_DATA_STARTED,
    });

    try {
      const { data } = await instance({
        url: '/api/get_coin_stats',
        method: 'GET',
      });

      if (data.status === 'Success') {
        const marketCapData = data.data;

        const updatedCurrencyData = produce(
          marketCapData,
          draftCurrencyData => {
            Object.entries(draftCurrencyData).forEach(
              ([key, singleCurrency]) => {
                _.set(
                  draftCurrencyData,
                  `${key}.symbol`,
                  singleCurrency.symbol.toUpperCase(),
                );
                const additionalData = _.get(
                  coinDescriptions,
                  `entities.currencies.${singleCurrency.symbol.toUpperCase()}`,
                );

                if (additionalData) {
                  draftCurrencyData[key].additionalData = additionalData;
                }
              },
            );
          },
        );

        dispatch({
          type: CURRENCY_DATA_SUCCESS,
          payload: updatedCurrencyData,
        });
      }
      // Remove currencies we only have a description for.
    } catch (e) {
      console.log(e);
    }
  };
};

export const updateCurrencyData = data => {
  if (data.status === 'Success') {
    const marketCapData = data.data;

    const updatedCurrencyData = produce(marketCapData, draftCurrencyData => {
      Object.entries(draftCurrencyData).forEach(([key, singleCurrency]) => {
        const symbol = singleCurrency?.exchangeTicker.toUpperCase();
        _.set(
          draftCurrencyData,
          `${key}.symbol`,
          symbol,
        );
        const additionalData = _.get(
          coinDescriptions,
          `entities.currencies.${symbol}`,
        );

        if (additionalData) {
          draftCurrencyData[key].additionalData = additionalData;
        }
      });
    });

    return {
      type: CURRENCY_DATA_SUCCESS,
      payload: updatedCurrencyData,
    };
  }
};
