import {
  CURRENCY_DATA_STARTED,
  CURRENCY_DATA_SUCCESS,
  CURRENCY_DATA_FAIL,
} from 'redux/actions/currencyData';

const initialState = {
  currencies: {},
  isLoading: true,
};

export const currencyDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case CURRENCY_DATA_STARTED:
      return { ...state, isLoading: true };
    case CURRENCY_DATA_SUCCESS:
      return { ...state, currencies: action.payload, isLoading: false };
    case CURRENCY_DATA_FAIL:
      return { ...state, isLoading: false };
    default:
      return state;
  }
};
