import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';

import {
  USER_SIGNUP_STARTED,
  USER_SIGNUP_SUCCESS,
  USER_SIGNUP_FAIL,
  USER_SIGNUP_FINISHED,
  USER_LOGIN_STARTED,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_2FA_LOGIN_STARTED,
  USER_2FA_LOGIN_FAILED,
  USER_LOGOUT_STARTED,
  USER_FORGOT_PASSWORD_STARTED,
  USER_FORGOT_PASSWORD_SUCCESS,
  USER_FORGOT_PASSWORD_FAIL,
  USER_CHANGE_PASSWORD_OTP_STARTED,
  USER_CHANGE_PASSWORD_OTP_SUCCESS,
  USER_CHANGE_PASSWORD_OTP_FAIL,
  USER_CHANGE_PASSWORD_OTP_LOADING,
  USER_CHANGE_PASSWORD_STARTED,
  USER_CHANGE_PASSWORD_SUCCESS,
  USER_CHANGE_PASSWORD_FAIL,
  USER_CHANGE_PASSWORD_FINISHED,
  USER_EMAIL_VERIFICATION_STARTED,
  USER_EMAIL_VERIFICATION_SUCCESS,
  USER_EMAIL_VERIFICATION_FAIL,
  LOAD_PROFILE_STARTED,
  LOAD_PROFILE_SUCCESS,
  LOAD_PROFILE_FAIL,
  LOAD_LOGIN_HISTORY_STARTED,
  LOAD_LOGIN_HISTORY_SUCCESS,
  LOAD_LOGIN_HISTORY_FAIL,
  LOAD_FEE_DISCOUNT_STATUS_STARTED,
  LOAD_FEE_DISCOUNT_STATUS_SUCCESS,
  LOAD_FEE_DISCOUNT_STATUS_FAIL,
  LOAD_COPY_TRADING_ENROLLMENT_STATUS,
  LOAD_COPY_TRADING_USER_TRADERS,
  LOAD_COPY_TRADING_USER_TRADERS_STARTED,
  SET_ADDITIONAL_FIELDS_REQUIREMENT,
  LOAD_ADDITIONAL_FIELDS_SUCCESS,
  LOAD_TRADING_VOLUME_DISCOUNTS_SUCCESS,
} from 'redux/actions/profile';

import {
  GET_AFFILIATE_SUMMARY_STARTED,
  GET_AFFILIATE_SUMMARY_SUCCESS,
  GET_AFFILIATE_SUMMARY_FAIL,
  GET_AFFILIATE_REFERRALS_STARTED,
  GET_AFFILIATE_REFERRALS_SUCCESS,
  GET_AFFILIATE_REFERRALS_FAIL,
  GET_AFFILIATE_COMMISSION_STARTED,
  GET_AFFILIATE_COMMISSION_SUCCESS,
  GET_AFFILIATE_COMMISSION_FAIL,
} from 'redux/actions/affiliates';

import {
  GET_IPWHITELISTING_STARTED,
  GET_IPWHITELISTING_SUCCESS,
  GET_IPWHITELISTING_FAIL,
  GET_DEVICEWHITELISTING_STARTED,
  GET_DEVICEWHITELISTING_SUCCESS,
  GET_DEVICEWHITELISTING_FAIL,
} from 'redux/actions/ipwhitelisting';

import {
  GET_USER_TEMP_AUTH_TOKEN,
  USER_NOT_AUTHENTICATED,
  USER_AUTHENTICATED,
} from 'redux/reducers/auth';

import {
  GET_API_KEYS_STARTED,
  GET_API_KEYS_SUCCESS,
  GET_API_KEYS_FAIL,
  GENERATE_API_KEY_STARTED,
  GENERATE_API_KEY_SUCCESS,
  GENERATE_API_KEY_FAIL,
  DELETE_API_KEY_STARTED,
  DELETE_API_KEY_SUCCESS,
  DELETE_API_KEY_FAIL,
} from 'redux/actions/apiKeys';

const initialState = {
  isLoading: false,
  isLoginLoading: false,
  is2FALoginLoading: false,
  isProfileLoading: false,
  signupStarted: false,
  passwordChanged: false,
  passwordChangedOTP: undefined,
  passwordResetStarted: false,
  passwordResetCompleted: false,
  emailVerificationCompleted: false,
  profile: {
    loginHistory: [],
  },
  affiliateInfo: {
    summary: {},
    affiliates: [],
    commission: [],
  },
  ipwhitelistingInfo: [],
  devicewhitelistingInfo: [],
  apiKeys: [],
  tradingDiscountTiers: [],
  feeDiscountStatus: false,
  copyTradingEnrollmentStatus: false,
  copyTradingFollowing: {},
  isCopyTradingLoading: true,
  additionalFieldsRequired: false,
  additionalAccountFields: [],
};

export const initialUserReducer = (state = initialState, action) => {
  switch (action.type) {
    //* SIGN UP
    case USER_SIGNUP_STARTED:
      return { ...state, isloading: true, signupStarted: false };
    case USER_SIGNUP_SUCCESS:
      return { ...state, isloading: false, signupStarted: true };
    case USER_SIGNUP_FINISHED:
      return { ...state, isloading: false, signupStarted: false };
    case USER_SIGNUP_FAIL:
      return { ...state, isloading: false, signupStarted: false };

    //* EMAIL VERIFICATION
    case USER_EMAIL_VERIFICATION_STARTED:
      return {
        ...state,
        isLoading: true,
        emailVerificationCompleted: false,
      };
    case USER_EMAIL_VERIFICATION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        emailVerificationCompleted: true,
      };
    case USER_EMAIL_VERIFICATION_FAIL: {
      return {
        ...state,
        isLoading: false,
        emailVerificationCompleted: false,
      };
    }

    //* LOGIN
    case USER_LOGIN_STARTED:
      return { ...state, isLoginLoading: true };
    case USER_LOGIN_SUCCESS:
      return { ...state, isLoginLoading: false, is2FALoginLoading: false };
    case USER_LOGIN_FAIL:
      return { ...state, isLoginLoading: false };
    case GET_USER_TEMP_AUTH_TOKEN:
      return { ...state, isLoginLoading: false };

    //* 2FA LOGIN
    case USER_2FA_LOGIN_STARTED:
      return { ...state, is2FALoginLoading: true };
    case USER_2FA_LOGIN_FAILED:
      return { ...state, is2FALoginLoading: false };
    case USER_AUTHENTICATED:
      return { ...state, is2FALoginLoading: false };
    case USER_NOT_AUTHENTICATED:
      return { ...initialState };

    //* LOAD PROFILE
    case LOAD_PROFILE_STARTED:
      return { ...state, isProfileLoading: true };
    case LOAD_PROFILE_SUCCESS:
      return {
        ...state,
        isProfileLoading: false,
        profile: {
          ...action.payload,
          loginHistory: [...state.profile.loginHistory],
        },
      };
    case LOAD_PROFILE_FAIL:
      return { ...state, isProfileLoading: false };

    //* LOGIN HISTORY
    case LOAD_LOGIN_HISTORY_STARTED:
      return { ...state, isLoading: true };
    case LOAD_LOGIN_HISTORY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        profile: {
          ...state.profile,
          loginHistory: action.payload,
        },
      };
    case LOAD_LOGIN_HISTORY_FAIL:
      return {
        ...state,
        isLoading: false,
      };

    //* API KEYS

    // List all
    case GET_API_KEYS_STARTED:
      return { ...state, isLoading: true };
    case GET_API_KEYS_SUCCESS:
      return { ...state, isLoading: false, apiKeys: action.payload };
    case GET_API_KEYS_FAIL:
      return { ...state, isLoading: false };

    // Generate new
    case GENERATE_API_KEY_STARTED:
      return { ...state, isLoading: true };
    case GENERATE_API_KEY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        apiKeys: [...state.apiKeys, action.payload],
      };
    case GENERATE_API_KEY_FAIL:
      return { ...state, isLoading: false };

    // Delete existing
    case DELETE_API_KEY_STARTED:
      return { ...state, isLoading: true };
    case DELETE_API_KEY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        apiKeys: state.apiKeys.filter(({ key }) => key !== action.payload),
      };
    case DELETE_API_KEY_FAIL:
      return { ...state, isLoading: false };

    //* AFFILIATE SUMMARY
    case GET_AFFILIATE_SUMMARY_STARTED:
      return { ...state, isloading: true };
    case GET_AFFILIATE_SUMMARY_SUCCESS:
      return {
        ...state,
        isloading: false,
        affiliateInfo: {
          ...state.affiliateInfo,
          summary: action.payload,
        },
      };
    case GET_AFFILIATE_SUMMARY_FAIL:
      return { ...state, isloading: false };

    //* AFFILIATE REFERRALS (AFFILIATES)
    case GET_AFFILIATE_REFERRALS_STARTED:
      return { ...state, isloading: true };
    case GET_AFFILIATE_REFERRALS_SUCCESS:
      return {
        ...state,
        isloading: false,
        affiliateInfo: {
          ...state.affiliateInfo,
          affiliates: action.payload,
        },
      };
    case GET_AFFILIATE_REFERRALS_FAIL:
      return { ...state, isloading: false };

    //* AFFILIATE COMMISIONS
    case GET_AFFILIATE_COMMISSION_STARTED:
      return { ...state, isloading: true };
    case GET_AFFILIATE_COMMISSION_SUCCESS:
      return {
        ...state,
        isloading: false,
        affiliateInfo: {
          ...state.affiliateInfo,
          commission: action.payload,
        },
      };
    case GET_AFFILIATE_COMMISSION_FAIL:
      return { ...state, isloading: false };

    // IPWHITELISTING DATA
      case GET_IPWHITELISTING_STARTED:
        return { ...state, isloading: true };
      case GET_IPWHITELISTING_SUCCESS:
        return {
          ...state,
          isloading: false,
          ipwhitelistingInfo: action.payload
        };
      case GET_IPWHITELISTING_FAIL:
        return { ...state, isloading: false };

    // DEVICEWHITELISTING DATA
    case GET_DEVICEWHITELISTING_STARTED:
      return { ...state, isloading: true };
    case GET_DEVICEWHITELISTING_SUCCESS:
      return {
        ...state,
        isloading: false,
        devicewhitelistingInfo: action.payload
      };
    case GET_DEVICEWHITELISTING_FAIL:
      return { ...state, isloading: false };

    //* LOAD FEES
    case LOAD_FEE_DISCOUNT_STATUS_STARTED:
      return { ...state, isLoading: true };
    case LOAD_FEE_DISCOUNT_STATUS_FAIL:
      return { ...state, isLoading: false };
    case LOAD_FEE_DISCOUNT_STATUS_SUCCESS:
      return { ...state, isLoading: false, feeDiscountStatus: action.payload };
    case LOAD_TRADING_VOLUME_DISCOUNTS_SUCCESS:
      return { ...state, tradingDiscountTiers: action.payload }

    case LOAD_COPY_TRADING_ENROLLMENT_STATUS:
      return { ...state, copyTradingEnrollmentStatus: action.payload };
    case LOAD_COPY_TRADING_USER_TRADERS_STARTED:
      return { ...state, isCopyTradingLoading: true };
    case LOAD_COPY_TRADING_USER_TRADERS:
      return {
        ...state,
        copyTradingFollowing: action.payload,
        isCopyTradingLoading: false,
      };

    //* CHANGE PASSWORD
    case USER_CHANGE_PASSWORD_OTP_STARTED:
      return { ...state, isLoading: true, passwordChangedOTP: false };
    case USER_CHANGE_PASSWORD_OTP_SUCCESS:
      return { ...state, isLoading: false, passwordChangedOTP: true };
    case USER_CHANGE_PASSWORD_OTP_FAIL:
      return { ...state, isLoading: false, passwordChangedOTP: false };
    case USER_CHANGE_PASSWORD_OTP_LOADING:
      return { ...state, isLoading: true };

    case USER_CHANGE_PASSWORD_STARTED:
      return { ...state, isLoading: true, passwordChanged: false };
    case USER_CHANGE_PASSWORD_SUCCESS:
      return { ...state, isLoading: false, passwordChanged: true };
    case USER_CHANGE_PASSWORD_FAIL:
      return { ...state, isLoading: false, passwordChanged: false };
    case USER_CHANGE_PASSWORD_FINISHED:
      return {
        ...state,
        isLoading: false,
        passwordChanged: false,
        passwordChangedOTP: false,
      };

    //* FORGOT PASSWORD
    case USER_FORGOT_PASSWORD_STARTED:
      return {
        ...state,
        isLoading: true,
        passwordResetStarted: false,
        passwordResetCompleted: false,
      };
    case USER_FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        isLoading: false,
        passwordResetStarted: true,
        passwordResetCompleted: false,
      };
    case USER_FORGOT_PASSWORD_FAIL:
      return {
        ...state,
        isLoading: false,
        passwordResetStarted: false,
        passwordResetCompleted: false,
      };

    //* LOGOUT
    case USER_LOGOUT_STARTED:
      return { ...initialState };

    // ADDITIONAL FIELDS
    case SET_ADDITIONAL_FIELDS_REQUIREMENT:
      return { ...state, additionalFieldsRequired: action.payload };
    case LOAD_ADDITIONAL_FIELDS_SUCCESS:
      return { ...state, additionalAccountFields: action.payload };

    //* DEFAULT
    default:
      return state;
  }
};

const persistConfig = {
  key: 'user',
  storage: storage,
  whitelist: ['profile'],
};

export const userReducer = persistReducer(persistConfig, initialUserReducer);
