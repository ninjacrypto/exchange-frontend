import {
  authenticatedInstance
} from 'api';

export const GET_IPWHITELISTING_STARTED = 'GET_IPWHITELISTING_STARTED';
export const GET_IPWHITELISTING_SUCCESS = 'GET_IPWHITELISTING_SUCCESS';
export const GET_IPWHITELISTING_FAIL = 'GET_IPWHITELISTING_FAIL';

export const GET_DEVICEWHITELISTING_STARTED = 'GET_DEVICEWHITELISTING_STARTED';
export const GET_DEVICEWHITELISTING_SUCCESS = 'GET_DEVICEWHITELISTING_SUCCESS';
export const GET_DEVICEWHITELISTING_FAIL = 'GET_DEVICEWHITELISTING_FAIL';

export const loadIPWhitelisting = () => {
  return async dispatch => {
    dispatch({
      type: GET_IPWHITELISTING_STARTED
    });

    try {
      const {
        data
      } = await authenticatedInstance({
        url: '/api/Get_IP_Whitelist',
        method: 'GET',
      });

      if (data.status === 'Success') {
        dispatch({
          type: GET_IPWHITELISTING_SUCCESS,
          payload: data.data,
        });
      } else {
        dispatch({
          type: GET_IPWHITELISTING_FAIL
        });
      }
    } catch (e) {
      dispatch({
        type: GET_IPWHITELISTING_FAIL
      });
    }
  };
};

export const loadDeviceWhitelisting = () => {
  return async dispatch => {
    dispatch({
      type: GET_DEVICEWHITELISTING_STARTED
    });

    try {
      const {
        data
      } = await authenticatedInstance({
        url: '/api/list-whitelisted-devices',
        method: 'GET',
      });

      if (data.status === 'Success') {
        dispatch({
          type: GET_DEVICEWHITELISTING_SUCCESS,
          payload: data.data,
        });
      } else {
        dispatch({
          type: GET_DEVICEWHITELISTING_FAIL
        });
      }
    } catch (e) {
      dispatch({
        type: GET_DEVICEWHITELISTING_FAIL
      });
    }
  };
};

// export const deleteIPWhitelisting = (key, cb) => {
//   return async dispatch => {
//     dispatch({
//       type: DELETE_IPWHITELISTING_STARTED
//     });

//     try {
//       const {
//         data
//       } = await authenticatedInstance({
//         url: '/api/Delete_IP_Whitelist',
//         method: 'POST',
//         data: {
//           cidr,
//           type
//         },
//       });

//       if (data.status === 'Success') {
//         dispatch({
//           type: DELETE_IPWHITELISTING_SUCCESS,
//           payload: {
//             cidr,
//             type
//           },
//         });
//         // dispatch(triggerToast('apiKeyRemoved', 'success', 2500));
//         // cb();
//       } else {
//         dispatch({
//           type: DELETE_IPWHITELISTING_FAIL
//         });
//         // dispatch(triggerToast(data.message));
//       }
//     } catch (e) {
//       dispatch({
//         type: DELETE_IPWHITELISTING_FAIL
//       });
//       // dispatch(triggerToast('somethingWentWrong'));
//     }
//   };
// };