import { authenticatedInstance } from 'api';

export const GET_AFFILIATE_SUMMARY_STARTED = 'GET_AFFILIATE_SUMMARY_STARTED';
export const GET_AFFILIATE_SUMMARY_SUCCESS = 'GET_AFFILIATE_SUMMARY_SUCCESS';
export const GET_AFFILIATE_SUMMARY_FAIL = 'GET_AFFILIATE_SUMMARY_FAIL';
export const GET_AFFILIATE_REFERRALS_STARTED =
  'GET_AFFILIATE_REFERRALS_STARTED';
export const GET_AFFILIATE_REFERRALS_SUCCESS =
  'GET_AFFILIATE_REFERRALS_SUCCESS';
export const GET_AFFILIATE_REFERRALS_FAIL = 'GET_AFFILIATE_REFERRALS_FAIL';
export const GET_AFFILIATE_COMMISSION_STARTED =
  'GET_AFFILIATE_COMMISSION_STARTED';
export const GET_AFFILIATE_COMMISSION_SUCCESS =
  'GET_AFFILIATE_COMMISSION_SUCCESS';
export const GET_AFFILIATE_COMMISSION_FAIL = 'GET_AFFILIATE_COMMISSION_FAIL';

export const loadAffiliatesSummary = () => {
  return async dispatch => {
    dispatch({ type: GET_AFFILIATE_SUMMARY_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/Affiliate_Summary',
        method: 'GET',
      });

      if (data.status === 'Success') {
        dispatch({
          type: GET_AFFILIATE_SUMMARY_SUCCESS,
          payload: data.data,
        });
      } else {
        dispatch({ type: GET_AFFILIATE_SUMMARY_FAIL });
        // dispatch(triggerModalOpen(data.message));
      }
    } catch (e) {
      dispatch({ type: GET_AFFILIATE_SUMMARY_FAIL });
    }
  };
};

export const loadAffiliatesReferrals = () => {
  return async dispatch => {
    dispatch({ type: GET_AFFILIATE_REFERRALS_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/My_Affiliate',
        method: 'GET',
      });

      if (data.status === 'Success') {
        dispatch({
          type: GET_AFFILIATE_REFERRALS_SUCCESS,
          payload: data.data,
        });
      } else {
        dispatch({ type: GET_AFFILIATE_REFERRALS_FAIL });
        // dispatch(triggerModalOpen(data.message));
      }
    } catch (e) {
      dispatch({ type: GET_AFFILIATE_REFERRALS_FAIL });
    }
  };
};

export const loadAffiliatesCommission = () => {
  return async dispatch => {
    dispatch({ type: GET_AFFILIATE_COMMISSION_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/Affiliate_Commission',
        method: 'GET',
      });

      if (data.status === 'Success') {
        dispatch({
          type: GET_AFFILIATE_COMMISSION_SUCCESS,
          payload: data.data,
        });
      } else {
        dispatch({ type: GET_AFFILIATE_COMMISSION_FAIL });
        // dispatch(triggerModalOpen(data.message));
      }
    } catch (e) {
      dispatch({ type: GET_AFFILIATE_COMMISSION_FAIL });
    }
  };
};
