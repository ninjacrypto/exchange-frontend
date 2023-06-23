import { authenticatedInstance } from 'api';
import { triggerToast, triggerModalOpen } from 'redux/actions/ui';
import { loadProfile } from 'redux/actions/profile';

export const GAUTH_REQUEST_STARTED = 'GAUTH_REQUEST_STARTED';
export const GAUTH_REQUEST_SUCCESS = 'GAUTH_REQUEST_SUCCESS';
export const GAUTH_REQUEST_FAIL = 'GAUTH_REQUEST_FAIL';
export const GAUTH_ENABLE_STARTED = 'GAUTH_ENABLE_STARTED';
export const GAUTH_ENABLE_SUCCESS = 'GAUTH_ENABLE_SUCCESS';
export const GAUTH_ENABLE_FAIL = 'GAUTH_ENABLE_FAIL';
export const GAUTH_DISABLE_STARTED = 'GAUTH_DISABLE_STARTED';
export const GAUTH_DISABLE_SUCCESS = 'GAUTH_DISABLE_SUCCESS';
export const GAUTH_DISABLE_FAIL = 'GAUTH_DISABLE_FAIL';

export const requestGauth = () => {
  return async dispatch => {
    dispatch({ type: GAUTH_REQUEST_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/GAuth_Enable_Request',
        method: 'GET',
      });

      if (data.status === 'Success') {
        dispatch({
          type: GAUTH_REQUEST_SUCCESS,
          payload: {
            pairingCode: data.data.pairingCode,
            qrCode: data.data.qR_Code,
          },
        });
      } else {
        dispatch({ type: GAUTH_REQUEST_FAIL });
      }
    } catch (data) {
      dispatch({ type: GAUTH_REQUEST_FAIL });
    }
  };
};

export const enableGauth = authCode => {
  return async dispatch => {
    dispatch({ type: GAUTH_ENABLE_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/GAuth_Set_Enable',
        method: 'POST',
        data: authCode,
      });

      if (data.status === 'Success') {
        dispatch({ type: GAUTH_ENABLE_SUCCESS });
        dispatch(triggerToast('2faEnabled', 'success', 1200));
        dispatch(loadProfile());
      } else {
        dispatch({ type: GAUTH_ENABLE_FAIL });
        dispatch(triggerModalOpen(data.message));
      }
    } catch (e) {
      dispatch({ type: GAUTH_ENABLE_FAIL });
      dispatch(triggerModalOpen('somethingWentWrong'));
    }
  };
};

export const disableGauth = authCode => {
  return async dispatch => {
    dispatch({ type: GAUTH_DISABLE_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/GAuth_Disable_Request',
        method: 'POST',
        data: authCode,
      });

      if (data.status === 'Success') {
        dispatch({ type: GAUTH_DISABLE_SUCCESS });
        dispatch(triggerToast('2faDisabled', 'success', 1200));
        dispatch(loadProfile());
        dispatch(requestGauth());
      } else {
        dispatch({ type: GAUTH_DISABLE_FAIL });
        dispatch(triggerModalOpen(data.message));
      }
    } catch (e) {
      dispatch({ type: GAUTH_DISABLE_FAIL });
      dispatch(triggerModalOpen('somethingWentWrong'));
    }
  };
};
