import produce from 'immer';
import _ from 'lodash';
import { getUserFavorites } from 'redux/selectors/userSettings';
import { authenticatedInstance } from 'api';
import { getIsAuthenticated } from 'redux/selectors/auth';
import { numberParser, setNumbroLocale } from 'utils';

export const UPDATE_FAVORITES = 'UPDATE_FAVORITES';
export const UPDATE_NUMBER_FORMAT = 'UPDATE_NUMBER_FORMAT';
export const UPDATE_HIDE_BALANCES = 'UPDATE_HIDE_BALANCES';
export const UPDATE_HIDE_LOW_BALANCES = 'UPDATE_HIDE_LOW_BALANCES';
export const UPDATE_LAYOUT_PREFERENCE = 'UPDATE_LAYOUT_PREFERENCE';
export const UPDATE_EXCHANGE_LAYOUTS = 'UPDATE_EXCHANGE_LAYOUTS';

export const updateFavorites = ({ tradingPair, remove }) => {
  return async (dispatch, getState) => {
    const isAuthenticated = getIsAuthenticated(getState());
    const userFavorites = getUserFavorites(getState());
    const nextFavorites = produce(userFavorites, draftState => {
      remove ? _.pull(draftState, tradingPair) : draftState.push(tradingPair);
    });

    dispatch({
      type: UPDATE_FAVORITES,
      payload: nextFavorites,
    });

    if (isAuthenticated) {
      try {
        const { data } = await authenticatedInstance({
          url: '/api/Customer_Favourite_Pairs',
          method: 'POST',
          data: {
            data: nextFavorites,
          },
          polling: true,
        });

        if (data.status === 'Success') {
          dispatch(loadFavorites());
        }
      } catch (e) {
        console.log(e);
      }
    }
  };
};

export const loadFavorites = () => {
  return async dispatch => {
    try {
      const { data } = await authenticatedInstance({
        url: '/api/Customer_Favourite_Pairs',
        method: 'GET',
        polling: true,
      });

      if (data.status === 'Success') {
        dispatch({
          type: UPDATE_FAVORITES,
          payload: data.data,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };
};

const setDelimiters = numberFormat => {
  const delimiters = { thousandSeparator: ',', decimalSeparator: '.' };

  if (numberFormat === 'period') {
    numberParser.setDelimiters(delimiters);
  } else if (numberFormat === 'comma') {
    delimiters.thousandSeparator = '.';
    delimiters.decimalSeparator = ',';
    numberParser.setDelimiters(delimiters);
  }

  setNumbroLocale();
};

export const setNumberFormat = numberFormat => {
  return (dispatch, getState) => {
    const { language } = getState().exchangeSettings;

    if (numberFormat === 'df') {
      numberParser.setLocale(language);
    }

    setDelimiters(numberFormat);

    dispatch({
      type: UPDATE_NUMBER_FORMAT,
      payload: numberFormat,
    });
  };
};

export const setHideBalances = value => {
  return {
    type: UPDATE_HIDE_BALANCES,
    payload: value,
  };
};

export const setHideLowBalances = value => {
  return {
    type: UPDATE_HIDE_LOW_BALANCES,
    payload: value,
  };
};

export const updateLayoutPreference = value => {
  return {
    type: UPDATE_LAYOUT_PREFERENCE,
    payload: value,
  }
}

export const updateExchangeLayouts = value => {
  return {
    type: UPDATE_EXCHANGE_LAYOUTS,
    payload: value,
  }
}