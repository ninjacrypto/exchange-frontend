import {
  LOAD_SETTINGS_STARTED,
  LOAD_SETTINGS_SUCCESS,
  LOAD_SETTINGS_FAIL,
  LOAD_CURRENCY_SETTINGS_STARTED,
  LOAD_CURRENCY_SETTINGS_SUCCESS,
  LOAD_CURRENCY_SETTINGS_FAIL,
  LOAD_CONTENT_PAGES_STARTED,
  LOAD_CONTENT_PAGES_SUCCESS,
  LOAD_CONTENT_PAGES_FAIL,
  LOAD_FEE_DISCOUNT_TIERS_STARTED,
  LOAD_FEE_DISCOUNT_TIERS_SUCCESS,
  LOAD_FEE_DISCOUNT_TIERS_FAIL,
  LOAD_LANGUAGE_LIST_SUCCESS,
  CHANGE_LANGUAGE,
  CHANGE_FIAT_CODE,
  SET_ERROR_STATUS,
  SET_ERROR_STATUS_451,
  SET_COOKIES_ENABLED,
  SET_COOKIE_CONSENT,
} from 'redux/actions/exchangeSettings';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const initialState = {
  settings: {},
  currencySettings: {},
  isCurrencySettingsLoading: true,
  isSettingsLoading: true,
  isLoading: true,
  feeDiscountTiers: [],
  isFeeDiscountTiersLoading: true,
  language: 'tr',
  fullLanguage: {},
  languageList: [],
  currencyCode: 'USD',
  hasGeneralError: false,
  hasHttp451Error: false,
  contentPages: {},
  isContentPagesLoading: true,
  enableCookieConsent: false,
  hasCookieConsent: false,
  consentGiven: false,
};

export const initialSettingsReducer = (state = initialState, action) => {
  switch (action.type) {

    case SET_ERROR_STATUS_451:
      return { ...state, hasHttp451Error: true, isSettingsLoading: false };

    case LOAD_SETTINGS_STARTED:
      return { ...state, isSettingsLoading: true };
    case LOAD_SETTINGS_SUCCESS:
      return { ...state, settings: action.payload, isSettingsLoading: false };
    case LOAD_SETTINGS_FAIL:
      return { ...state, isSettingsLoading: false };

    case SET_COOKIES_ENABLED:
      return { ...state, enableCookieConsent: action.payload };
    case SET_COOKIE_CONSENT:
      return { ...state, hasCookieConsent: action.payload, consentGiven: true };

    case LOAD_CURRENCY_SETTINGS_STARTED:
      return { ...state, isCurrencySettingsLoading: true };
    case LOAD_CURRENCY_SETTINGS_SUCCESS:
      return {
        ...state,
        currencySettings: action.payload,
        isCurrencySettingsLoading: false,
      };
    case LOAD_CURRENCY_SETTINGS_FAIL:
      return { ...state, isCurrencySettingsLoading: false };

    case LOAD_CONTENT_PAGES_STARTED:
      return { ...state, isContentPagesLoading: true };
    case LOAD_CONTENT_PAGES_SUCCESS:
      return {
        ...state,
        contentPages: action.payload,
        isContentPagesLoading: false,
      };
    case LOAD_CONTENT_PAGES_FAIL:
      return { ...state, isContentPagesLoading: false };

    case LOAD_FEE_DISCOUNT_TIERS_STARTED:
      return { ...state, isFeeDiscountTiersLoading: true };
    case LOAD_FEE_DISCOUNT_TIERS_SUCCESS:
      return {
        ...state,
        feeDiscountTiers: action.payload,
        isFeeDiscountTiersLoading: false,
      };
    case LOAD_FEE_DISCOUNT_TIERS_FAIL:
      return { ...state, isFeeDiscountTiersLoading: false };

    case LOAD_LANGUAGE_LIST_SUCCESS:
      return { ...state, languageList: action.payload };
    case CHANGE_LANGUAGE:
      return {
        ...state,
        language: action.payload.code,
        fullLanguage: action.payload,
      };
    case CHANGE_FIAT_CODE:
      return { ...state, currencyCode: action.payload };
    case SET_ERROR_STATUS:
      return { ...state, hasGeneralError: action.payload };
 
    default:
      return state;
  }
};

const persistConfig = {
  key: 'exchangeSettings',
  storage: storage,
  whitelist: [
    'language',
    'languageList',
    'fullLanguage',
    'currencyCode',
    'enableCookieConsent',
    'hasCookieConsent',
    'consentGiven',
  ],
};

export const settingsReducer = persistReducer(
  persistConfig,
  initialSettingsReducer,
);
