import _ from 'lodash';
import qs from 'qs';
import instance, { authenticatedInstance, setBearer, exchangeApi } from 'api';

import {
  USER_AUTHENTICATED,
  USER_NOT_AUTHENTICATED,
  GET_USER_TEMP_AUTH_TOKEN,
  SEND_EMAIL_OTP_SUCCESS,
  SEND_EMAIL_OTP_FAIL,
} from 'redux/reducers/auth';

import { triggerToast, triggerModalOpen } from 'redux/actions/ui';
import { isTrue } from 'utils';
import { loadFavorites } from './userSettings';
import { socket } from 'realtime';

export const USER_SIGNUP_STARTED = 'USER_SIGNUP_STARTED';
export const USER_SIGNUP_SUCCESS = 'USER_SIGNUP_SUCCESS';
export const USER_SIGNUP_FAIL = 'USER_SIGNUP_FAIL';
export const USER_SIGNUP_FINISHED = 'USER_SIGNUP_FINISHED';
export const USER_LOGIN_STARTED = 'USER_LOGIN_STARTED';
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS';
export const USER_LOGIN_FAIL = 'USER_LOGIN_FAIL';
export const USER_2FA_LOGIN_STARTED = 'USER_2FA_LOGIN_STARTED';
export const USER_2FA_LOGIN_FAILED = 'USER_2FA_LOGIN_FAILED';
export const USER_LOGOUT_STARTED = 'USER_LOGOUT_STARTED';
export const USER_FORGOT_PASSWORD_STARTED = 'USER_FORGOT_PASSWORD_STARTED';
export const USER_FORGOT_PASSWORD_SUCCESS = 'USER_FORGOT_PASSWORD_SUCCESS';
export const USER_FORGOT_PASSWORD_FAIL = 'USER_FORGOT_PASSWORD_FAIL';
export const USER_CHANGE_PASSWORD_STARTED = 'USER_CHANGE_PASSWORD_STARTED';
export const USER_CHANGE_PASSWORD_SUCCESS = 'USER_CHANGE_PASSWORD_SUCCESS';
export const USER_CHANGE_PASSWORD_FINISHED = 'USER_CHANGE_PASSWORD_FINISHED';
export const USER_CHANGE_PASSWORD_FAIL = 'USER_CHANGE_PASSWORD_FAIL';
export const USER_CHANGE_PASSWORD_OTP_STARTED =
  'USER_CHANGE_PASSWORD_OTP_STARTED';
export const USER_CHANGE_PASSWORD_OTP_SUCCESS =
  'USER_CHANGE_PASSWORD_OTP_SUCCESS';
export const USER_CHANGE_PASSWORD_OTP_FAIL = 'USER_CHANGE_PASSWORD_OTP_FAIL';
export const USER_CHANGE_PASSWORD_OTP_LOADING =
  'USER_CHANGE_PASSWORD_OTP_LOADING';
export const USER_EMAIL_VERIFICATION_STARTED =
  'USER_EMAIL_VERIFICATION_STARTED';
export const USER_EMAIL_VERIFICATION_SUCCESS =
  'USER_EMAIL_VERIFICATION_SUCCESS';
export const USER_EMAIL_VERIFICATION_FAIL = 'USER_EMAIL_VERIFICATION_FAIL';
export const LOAD_PROFILE_STARTED = 'LOAD_PROFILE_STARTED';
export const LOAD_PROFILE_SUCCESS = 'LOAD_PROFILE_SUCCESS';
export const LOAD_PROFILE_FAIL = 'LOAD_PROFILE_FAIL';
export const LOAD_LOGIN_HISTORY_STARTED = 'LOAD_LOGIN_HISTORY_STARTED';
export const LOAD_LOGIN_HISTORY_SUCCESS = 'LOAD_LOGIN_HISTORY_SUCCESS';
export const LOAD_LOGIN_HISTORY_FAIL = 'LOAD_LOGIN_HISTORY_FAIL';
export const LOAD_FEE_DISCOUNT_STATUS_STARTED =
  'LOAD_FEE_DISCOUNT_STATUS_STARTED';
export const LOAD_FEE_DISCOUNT_STATUS_SUCCESS =
  'LOAD_FEE_DISCOUNT_STATUS_SUCCESS';
export const LOAD_FEE_DISCOUNT_STATUS_FAIL = 'LOAD_FEE_DISCOUNT_STATUS_FAIL';
export const USER_FEE_DISCOUNT_ENABLE = 'USER_FEE_DISCOUNT_ENABLE';
export const USER_FEE_DISCOUNT_DISABLE = 'USER_FEE_DISCOUNT_DISABLE';
export const SAVE_REFERRAL_ID = 'SAVE_REFERRAL_ID';
export const LOAD_COPY_TRADING_ENROLLMENT_STATUS =
  'LOAD_COPY_TRADING_ENROLLMENT_STATUS';
export const LOAD_COPY_TRADING_USER_TRADERS = 'LOAD_COPY_TRADING_USER_TRADERS';
export const LOAD_COPY_TRADING_USER_TRADERS_STARTED =
  'LOAD_COPY_TRADING_USER_TRADERS_STARTED';
export const SET_ADDITIONAL_FIELDS_REQUIREMENT =
  'SET_ADDITIONAL_FIELDS_REQUIREMENT';
export const LOAD_ADDITIONAL_FIELDS_SUCCESS = 'LOAD_ADDITIONAL_FIELDS_SUCCESS';
export const LOAD_TRADING_VOLUME_DISCOUNTS_SUCCESS =
  'LOAD_TRADING_VOLUME_DISCOUNTS_SUCCESS';

export const RENEW_TOKEN_STARTED = 'RENEW_TOKEN_STARTED';
export const RENEW_TOKEN_FAILED = 'RENEW_TOKEN_FAILED';

export let myInterval = null;
export let userEmail = '';

export const signUp = values => {
  delete values.passwordConfirm;
  delete values.agree;

  return async dispatch => {
    dispatch({ type: USER_SIGNUP_STARTED });

    try {
      const { data } = await instance({
        url: '/api/SignUp/v2',
        method: 'POST',
        data: values,
      });

      if (data.status === 'Success') {
        dispatch({ type: USER_SIGNUP_SUCCESS });
        clearCaptcha();
      } else {
        dispatch({ type: USER_SIGNUP_FAIL });
        dispatch(triggerModalOpen(_.has(data, ['message'])? data.message: data.Message));
        clearCaptcha();
      }
    } catch (e) {
      dispatch({ type: USER_SIGNUP_FAIL });
      dispatch(triggerModalOpen('somethingWentWrong'));
      clearCaptcha();
    }
  };
};

export const verifyEmail = values => {
  return async dispatch => {
    dispatch({ type: USER_EMAIL_VERIFICATION_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/VerifyAccount',
        method: 'POST',
        data: values,
      });

      if (data.status === 'Success') {
        dispatch({ type: USER_EMAIL_VERIFICATION_SUCCESS });
        dispatch(triggerToast('successfulEmailVerification', 'success'));
      } else {
        dispatch({ type: USER_EMAIL_VERIFICATION_FAIL });
        dispatch(triggerModalOpen(data.message));
      }
    } catch (e) {
      dispatch({ type: USER_EMAIL_VERIFICATION_FAIL });
      dispatch(triggerModalOpen('somethingWentWrong'));
    }
  };
};

export const logIn = values => {
  return async dispatch => {
    dispatch({ type: USER_LOGIN_STARTED });
    userEmail = values.email;
    try {
      const { data } = await instance({
        url: '/api/AuthenticateUser/v2',
        method: 'POST',
        data: values,
      });

      if (data.status === 'Success') {
        dispatch({
          type: GET_USER_TEMP_AUTH_TOKEN,
          payload: data.data,
        });
        // dispatch(triggerToast('success2fa', 'success'));
        clearCaptcha();
      } else if (data.access_token) {
        dispatch(loginSuccessful(data.access_token));
        clearCaptcha();
      } else if (data.status === 'Error') {
        dispatch({ type: USER_LOGIN_FAIL });
        dispatch(triggerModalOpen(data.message));
        clearCaptcha();
      } else {
        dispatch({ type: USER_LOGIN_FAIL });
        dispatch(triggerModalOpen(_.has(data, ['message'])? data.message: data.Message));
        clearCaptcha();
      }
    } catch (e) {
      dispatch({ type: USER_LOGIN_FAIL });
      dispatch(triggerModalOpen('SignIn_Authentication_Failed'));
      clearCaptcha();
    }
  };
};

export const loginSuccessful = bearerToken => {
  return dispatch => {
    setBearer(bearerToken);
    exchangeApi.setAuthentication(bearerToken);
    socket.login(bearerToken);
    dispatch({
      type: USER_AUTHENTICATED,
      payload: { bearerToken },
    });
    dispatch({ type: USER_LOGIN_SUCCESS });
    // dispatch(triggerToast('successfulLogin', 'success', 3500));
    dispatch(loadProfile());
    dispatch(loadFavorites());
  };
};

export const clearCaptcha = () => {
  if (window.grecaptcha) {
    window.grecaptcha.reset();
  }
}

export const twoFactorLogin = (values) => {
  return async (dispatch, getState) => {
    dispatch({ type: USER_2FA_LOGIN_STARTED });

    const { tempAuthToken } = getState().auth;

    const body = {
      grant_type: 'password',
      username: tempAuthToken,
      password: values.oneTimePassword,
      dvc_otp: '',
    };
    if (values.dvc_otp) {
      body.dvc_otp = values.dvc_otp;
    }
    if (localStorage.getItem('deviceId')) {
      body.dvc_id = localStorage.getItem('deviceId')
    }
    try {
      const response = await instance({
        url: '/token/v2',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify(body),
      });

      if (response.status === 200) {
        dispatch(loginSuccessful(response.data.access_token));
        dispatch(getAdditionalFields());
        dispatch(getUserTradingVolumeDiscounts());
        dispatch(callRenewTokenFun());
      } else {
        dispatch({ type: USER_2FA_LOGIN_FAILED });
        dispatch(
          triggerModalOpen(
            response.data.error_description || response.data.error,
          ),
        );
      }
    } catch (e) {
      dispatch({ type: USER_NOT_AUTHENTICATED });
      dispatch(
        triggerModalOpen(
          'Sorry, something went wrong. Please try to login again.',
        ),
      );
    }
  };
};

export const clearToken = () => {
  return dispatch => {
    dispatch({ type: USER_NOT_AUTHENTICATED });
    dispatch(triggerToast('otpExpired', 'warn'));
  };
};

export const callRenewTokenFun = (props) => {
  return async (dispatch) => {
    try {
      if (props) {
        myInterval = setTimeout(() => { 
          dispatch(renewToken());
         }, 1000 * 200);
      } else {
        dispatch(renewToken());
      }

    } catch (e) {

    }
  };
}

export const renewToken = (props) => {
  return async (dispatch) => {
    try {
        const response = await authenticatedInstance({
          url: '/renew-token',
          method: 'POST',
        });
  
        if (response.status === 200) {
          dispatch(renewTokenSuccessful(response.data.data.access_token));
          dispatch(callRenewTokenFun(response.data.data.expires_in));

        } else {
          socket.logout();
          dispatch({ type: USER_NOT_AUTHENTICATED });
          dispatch(
            triggerModalOpen(
              response.data.data.error_description || response.data.error,
            ),
          );
        }
    } catch (e) {
      dispatch({ type: USER_NOT_AUTHENTICATED });
      socket.logout();
      // dispatch(
      //   triggerModalOpen(
      //     'Sorry, something went wrong. Please try to login again.',
      //   ),
      // );
    }
  };
};

export const renewTokenSuccessful = bearerToken => {
  return dispatch => {
    setBearer(bearerToken);
    exchangeApi.setAuthentication(bearerToken);
    socket.login(bearerToken);
    dispatch({
      type: USER_AUTHENTICATED,
      payload: { bearerToken },
    });
    dispatch({ type: USER_LOGIN_SUCCESS });
  };
};

export const resendOtpToken = () => {
  return async (dispatch, getState) => {
    const { tempAuthToken } = getState().auth;

    try {
      const { data } = await instance({
        url: `/api/AuthenticateUser_Resend_EmailOTP/${tempAuthToken}`,
        method: 'POST',
      });

      if (data.status === 'Success') {
        dispatch({
          type: SEND_EMAIL_OTP_SUCCESS,
        });
        dispatch(triggerToast('emailOtp', 'success'));
      } else {
        dispatch({ type: SEND_EMAIL_OTP_FAIL });
        dispatch(triggerModalOpen(data.message));
      }
    } catch (e) {
      dispatch({ type: SEND_EMAIL_OTP_FAIL });
      dispatch(triggerModalOpen('somethingWentWrong'));
    }
  };
};

export const requestDeviceVerificationOTP = () => {
  return async (dispatch, getState) => {
    let values = {
      email: userEmail,
      dvc_id: ''
    }
    if (localStorage.getItem('deviceId')) {
      values.dvc_id = localStorage.getItem('deviceId')
    }
    try {
      const { data } = await instance({
        url: `/api/Request_Device_Verification_OTP`,
        method: 'POST',
        data: values,
      });
      if (data.status === 'Success') {
        dispatch(triggerToast('emailOtp', 'success'));
      } else {
        dispatch(triggerModalOpen(data.message));
      }
    } catch (e) {
      dispatch(triggerModalOpen('somethingWentWrong'));
    }
  };
};

export const loadProfile = () => {
  return async dispatch => {
    dispatch({ type: LOAD_PROFILE_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/GetProfile',
        method: 'GET',
      });

      if (data.status === 'Success') {
        const { isUserBlocked } = data.data;

        if (isUserBlocked) {
          dispatch(triggerModalOpen('blockAccount.loginMessage'));
          dispatch(logOut());
        } else {
          dispatch({ type: LOAD_PROFILE_SUCCESS, payload: data.data });
        }
      } else {
        dispatch({ type: LOAD_PROFILE_FAIL });
        // dispatch(triggerModalOpen(data.message));
      }
    } catch (e) {
      dispatch({ type: LOAD_PROFILE_FAIL });
      // dispatch(a
      //   triggerToast('Sorry, something went wrong. Please try again later.'),
      // );
    }
  };
};

export const loadLoginHistory = () => {
  return async dispatch => {
    dispatch({ type: LOAD_LOGIN_HISTORY_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/LoginHistory',
        method: 'GET',
      });

      if (data.status === 'Success') {
        dispatch({ type: LOAD_LOGIN_HISTORY_SUCCESS, payload: data.data });
      } else {
        dispatch({ type: LOAD_LOGIN_HISTORY_FAIL });
        // dispatch(triggerModalOpen(data.message));
      }
    } catch (e) {
      dispatch({ type: LOAD_LOGIN_HISTORY_FAIL });
    }
  };
};

export const requestChangePasswordOtp = () => {
  return async (dispatch, getState) => {
    let { passwordChangedOTP } = getState().user;

    if (!passwordChangedOTP) {
      dispatch({ type: USER_CHANGE_PASSWORD_OTP_STARTED });
    }

    dispatch({ type: USER_CHANGE_PASSWORD_OTP_LOADING });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/RequestChangePasswordOTP',
        method: 'POST',
      });

      if (data.status === 'Success') {
        dispatch({ type: USER_CHANGE_PASSWORD_OTP_SUCCESS });
        dispatch(triggerToast('emailOtp', 'success'));
      } else {
        dispatch({ type: USER_CHANGE_PASSWORD_OTP_FAIL });
        dispatch(triggerModalOpen(data.message));
      }
    } catch (e) {
      dispatch({ type: USER_CHANGE_PASSWORD_OTP_FAIL });
      dispatch(triggerModalOpen('somethingWentWrong'));
    }
  };
};

export const changePassword = values => {
  delete values.newPasswordConfirm;

  return async dispatch => {
    dispatch({ type: USER_CHANGE_PASSWORD_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/ChangePassword',
        method: 'POST',
        data: values,
      });

      if (data.status === 'Success') {
        dispatch({ type: USER_CHANGE_PASSWORD_SUCCESS });
        dispatch(triggerToast('successfulPasswordChange', 'success'));
      } else {
        dispatch({ type: USER_CHANGE_PASSWORD_FAIL });
        dispatch(triggerModalOpen(data.message));
      }
    } catch (e) {
      dispatch({ type: USER_CHANGE_PASSWORD_FAIL });
      dispatch(triggerModalOpen('somethingWentWrong'));
    }
  };
};

export const forgotPassword = email => {
  return async dispatch => {
    try {
      const { data } = await instance({
        url: '/api/ForgotPassword',
        method: 'POST',
        data: email,
      });

      if (data.status === 'Success') {
        dispatch({ type: USER_FORGOT_PASSWORD_SUCCESS });
        dispatch(
          triggerToast(
            'messageSentToEmailAddress',
            'success',
            2500,
          ),
        );
        clearCaptcha();
      } else {
        dispatch({ type: USER_FORGOT_PASSWORD_FAIL });
        dispatch(triggerModalOpen(data.message));
        clearCaptcha();
      }
    } catch (e) {
      dispatch({ type: USER_FORGOT_PASSWORD_FAIL });
      dispatch(triggerModalOpen('somethingWentWrong'));
      clearCaptcha();
    }
  };
};

export const logOut = () => {
  return dispatch => {
    setBearer();
    exchangeApi.clearAuthentication();
    socket.logout();
    clearInterval(myInterval);
    dispatch({ type: USER_LOGOUT_STARTED });
    dispatch({ type: USER_NOT_AUTHENTICATED });
    // dispatch(triggerToast('successfulLogout', 'success', 3500));
  };
};

export const signUpFinished = () => ({
  type: USER_SIGNUP_FINISHED,
});

export const changePasswordFinished = () => ({
  type: USER_CHANGE_PASSWORD_FINISHED,
});

export const loadFeeDiscountStatus = () => {
  return async dispatch => {
    dispatch({
      type: LOAD_FEE_DISCOUNT_STATUS_STARTED,
    });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/GetExchangeTokenDiscountEnrollmentStatus',
        method: 'GET',
      });

      if (data.status === 'Success') {
        dispatch({
          type: LOAD_FEE_DISCOUNT_STATUS_SUCCESS,
          payload: data.data,
        });
      }
    } catch (e) {}
  };
};

export const toggleFeeDiscountStatus = currentStatus => {
  return async dispatch => {
    const url = currentStatus
      ? '/api/Dis_Enroll_ExchangeTokenDiscount'
      : '/api/SetExchangeTokenDiscountEnrollment';

    try {
      const { data } = await authenticatedInstance({
        url,
        method: 'POST',
      });

      if (data.status === 'Success') {
        dispatch(triggerToast(data.message, 'success'));
        dispatch(loadFeeDiscountStatus());
      } else {
        dispatch(triggerToast(data.message, 'error'));
      }
    } catch (e) {}
  };
};

export const saveReferralId = ref => {
  return {
    type: SAVE_REFERRAL_ID,
    payload: ref,
  };
};

export const checkCopyTradingEnrollmentStatus = () => {
  return async dispatch => {
    try {
      const { data } = await authenticatedInstance({
        url: '/api/ProTrader_EnrollmentStatus',
        method: 'POST',
      });

      if (data.status === 'Success') {
        dispatch({
          type: LOAD_COPY_TRADING_ENROLLMENT_STATUS,
          payload: isTrue(data.message),
        });
      }
    } catch (e) {}
  };
};

export const getCopyTradingFollowing = () => {
  return async dispatch => {
    dispatch({
      type: LOAD_COPY_TRADING_USER_TRADERS_STARTED,
    });
    try {
      const { data } = await authenticatedInstance({
        url: '/api/ProTrader_MyProTraders',
        method: 'POST',
      });

      if (data.status === 'Success') {
        dispatch({
          type: LOAD_COPY_TRADING_USER_TRADERS,
          payload: data.data[0] || {},
        });
      }
    } catch (e) {
      console.log(e);
    }
  };
};

export const getAdditionalFields = () => {
  return async dispatch => {
    try {
      const { data } = await authenticatedInstance({
        url: '/api/Customer_AddtionalFields',
        method: 'GET',
      });

      if (data.status === 'Success') {
        if (data.data.length) {
          dispatch({
            type: LOAD_ADDITIONAL_FIELDS_SUCCESS,
            payload: data.data,
          });
          dispatch({
            type: SET_ADDITIONAL_FIELDS_REQUIREMENT,
            payload: true,
          });
        } else {
          dispatch({
            type: SET_ADDITIONAL_FIELDS_REQUIREMENT,
            payload: false,
          });
        }
      }
    } catch (e) {}
  };
};

export const getUserTradingVolumeDiscounts = () => {
  return async dispatch => {
    try {
      const { data } = await authenticatedInstance({
        url: '/api/Get_User_Volume_Discount_Limits',
        method: 'GET',
      });

      if (data.status === 'Success') {
        if (data.data.length) {
          const currency = data.data[0].currency;
          data.data.unshift({
            tradedVolume: data.data[0].tradedVolume,
            tradedVolumeLimit: 0,
            currency: data.data[0].currency,
            discount: 0,
          });

          let formattedData = [];

          _.sortBy(data.data, 'tradedVolumeLimit').forEach(
            ({ tradedVolume, tradedVolumeLimit, ...rest }, index) => {
              const isActive = tradedVolume >= tradedVolumeLimit;

              if (rest.currency === currency) {
                formattedData.push({
                  ...rest,
                  tier: index,
                  isActive,
                  tradedVolume,
                  tradedVolumeLimit,
                });
              }
            },
          );

          formattedData.forEach(({ isActive }, index) => {
            if (isActive && _.get(formattedData[index - 1], 'isActive')) {
              formattedData[index - 1].isActive = false;
            }
          });

          dispatch({
            type: LOAD_TRADING_VOLUME_DISCOUNTS_SUCCESS,
            payload: formattedData,
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
};
