import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';

import {
  GAUTH_REQUEST_STARTED,
  GAUTH_REQUEST_SUCCESS,
  GAUTH_REQUEST_FAIL,
  GAUTH_ENABLE_STARTED,
  GAUTH_ENABLE_SUCCESS,
  GAUTH_ENABLE_FAIL,
  GAUTH_DISABLE_STARTED,
  GAUTH_DISABLE_SUCCESS,
  GAUTH_DISABLE_FAIL,
} from 'redux/actions/gAuth';

import { LOAD_PROFILE_SUCCESS, SAVE_REFERRAL_ID } from 'redux/actions/profile';

export const GET_USER_TEMP_AUTH_TOKEN = 'GET_USER_TEMP_AUTH_TOKEN';
export const CLEAR_USER_TEMP_AUTH_TOKEN = 'CLEAR_USER_TEMP_AUTH_TOKEN';
export const SEND_EMAIL_OTP_SUCCESS = 'SEND_EMAIL_OTP_SUCCESS';
export const SEND_EMAIL_OTP_FAIL = 'SEND_EMAIL_OTP_FAIL';
export const AUTHENTICATE_USER = 'AUTHENTICATE_USER';
export const USER_AUTHENTICATED = 'USER_AUTHENTICATED';
export const USER_NOT_AUTHENTICATED = 'USER_NOT_AUTHENTICATED';
export const RESET_TEMP_AUTH = 'RESET_TEMP_AUTH';

const initialState = {
  isLoading: false,
  isAuthenticated: false,
  authorization: null,
  tempAuthToken: null,
  twoFaMethod: false,
  gAuthEnabled: false,
  gAuthSecretKey: null,
  gAuthQrCode: null,
  referralId: '',
  deviceVerificationRequired: false,
};

const initialAuthReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_USER_TEMP_AUTH_TOKEN:
      return {
        ...state,
        isAuthenticated: false,
        tempAuthToken: action.payload.tempAuthToken,
        twoFaMethod: action.payload.twoFAMehtod,
        deviceVerificationRequired: action.payload.deviceVerificationRequired
      };
    case USER_AUTHENTICATED:
      return {
        ...state,
        tempAuthToken: null,
        twoFaMethod: null,
        isAuthenticated: true,
        authorization: action.payload.bearerToken,
      };
    case SEND_EMAIL_OTP_FAIL:
      return {
        ...state,
        isAuthenticated: false,
        tempAuthToken: null,
        twoFaMethod: null,
        authorization: null,
      };
    case LOAD_PROFILE_SUCCESS:
      return { ...state, gAuthEnabled: action.payload.is2FAEnabled };
    case GAUTH_REQUEST_STARTED:
      return { ...state, isLoading: true };
    case GAUTH_REQUEST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        gAuthSecretKey: action.payload.pairingCode,
        gAuthQrCode: action.payload.qrCode,
      };
    case GAUTH_REQUEST_FAIL:
      return {
        ...state,
        isLoading: false,
        gAuthSecretKey: null,
        gAuthQrCode: null,
      };
    case GAUTH_ENABLE_STARTED:
      return { ...state, isLoading: true, gAuthEnabled: false };
    case GAUTH_ENABLE_SUCCESS:
      return { ...state, isLoading: false, gAuthEnabled: true };
    case GAUTH_ENABLE_FAIL:
      return { ...state, isLoading: false, gAuthEnabled: false };
    case GAUTH_DISABLE_STARTED:
    case GAUTH_DISABLE_FAIL:
      return { ...state, gAuthEnabled: true };
    case GAUTH_DISABLE_SUCCESS:
      return {
        ...state,
        gAuthEnabled: false,
        gAuthSecretKey: null,
        gAuthQrCode: null,
      };
    case USER_NOT_AUTHENTICATED:
      return { ...initialState };
    case SAVE_REFERRAL_ID:
      return { ...state, referralId: action.payload };

    case RESET_TEMP_AUTH: 
      return { ...state, tempAuthToken: null }
    default:
      return state;
  }
};

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['isAuthenticated', 'authorization', 'gAuthEnabled', 'referralId'],
};

export const authReducer = persistReducer(
  authPersistConfig,
  initialAuthReducer,
);
