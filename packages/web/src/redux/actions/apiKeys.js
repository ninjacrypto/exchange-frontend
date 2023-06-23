import { authenticatedInstance } from 'api';
import { triggerToast } from 'redux/actions/ui';

export const GET_API_KEYS_STARTED = 'GET_API_KEYS_STARTED';
export const GET_API_KEYS_SUCCESS = 'GET_API_KEYS_SUCCESS';
export const GET_API_KEYS_FAIL = 'GET_API_KEYS_FAIL';
export const GENERATE_API_KEY_STARTED = 'GENERATE_API_KEY_STARTED';
export const GENERATE_API_KEY_SUCCESS = 'GENERATE_API_KEY_SUCCESS';
export const GENERATE_API_KEY_FAIL = 'GENERATE_API_KEY_FAIL';
export const DELETE_API_KEY_STARTED = 'DELETE_API_KEY_STARTED';
export const DELETE_API_KEY_SUCCESS = 'DELETE_API_KEY_SUCCESS';
export const DELETE_API_KEY_FAIL = 'DELETE_API_KEY_FAIL';

export const loadApiKeys = keyType => {
  return async dispatch => {
    dispatch({ type: GET_API_KEYS_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/ListApiKey',
        method: 'POST',
        data: {
          keyType,
        },
      });

      if (data.status === 'Success') {
        dispatch({
          type: GET_API_KEYS_SUCCESS,
          payload: data.data,
        });
      } else {
        dispatch({ type: GET_API_KEYS_FAIL });
        dispatch(triggerToast(data.message));
      }
    } catch (e) {
      dispatch({ type: GET_API_KEYS_FAIL });
      dispatch(triggerToast('somethingWentWrong'));
    }
  };
};

// export const generateApiKey = (values, cb) => {
//   return async dispatch => {
//     dispatch({ type: GENERATE_API_KEY_STARTED });

//     try {
//       const { data } = await authenticatedInstance({
//         url: '/api/GenerateApiKey',
//         method: 'POST',
//         data: values,
//       });

//       if (data.status === 'Success') {
//         dispatch({
//           type: GENERATE_API_KEY_SUCCESS,
//           payload: {
//             key: data.data.publicKey,
//             type: values.keyType, // Todo: Update in the w/ different types based on response
//           },
//         });
//         dispatch(
//           triggerModalOpen(
//             'keyGenerated',
//             // <ApiKeySuccessMessage
//             //   publicKey={data.data.publicKey}
//             //   privateKey={data.data.privateKey}
//             // />,
//           ),
//         );
//         dispatch(triggerToast('apiKeyAdded', 'success', 2500));
//         cb();
//       } else {
//         dispatch({ type: GENERATE_API_KEY_FAIL });
//         dispatch(triggerToast(data.message));
//       }
//     } catch (e) {
//       dispatch({ type: GENERATE_API_KEY_FAIL });
//       dispatch(triggerToast('somethingWentWrong'));
//     }
//   };
// };

export const deleteApiKey = (key, cb) => {
  return async dispatch => {
    dispatch({ type: DELETE_API_KEY_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/DeleteApiKey',
        method: 'POST',
        data: {
          key,
        },
      });

      if (data.status === 'Success') {
        dispatch({
          type: DELETE_API_KEY_SUCCESS,
          payload: key,
        });
        dispatch(triggerToast('apiKeyRemoved', 'success', 2500));
        cb();
      } else {
        dispatch({ type: DELETE_API_KEY_FAIL });
        dispatch(triggerToast(data.message));
      }
    } catch (e) {
      dispatch({ type: DELETE_API_KEY_FAIL });
      dispatch(triggerToast('somethingWentWrong'));
    }
  };
};
