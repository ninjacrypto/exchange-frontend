import axios from 'axios';
import qs from 'qs';
import _ from 'lodash';
import { loadProgressBar } from 'axios-progress-bar';
import { backendUrl, tsApiUrl } from 'setup';

import { ExchangeApi } from './exchangeApi';
import { store } from 'redux/store';
import { logOut } from 'redux/actions/profile';
import { triggerToast } from 'redux/actions/ui';
import { setErrorStatus } from 'redux/actions/exchangeSettings';

const config = {
  baseURL: backendUrl,
};

const instance = axios.create(config);
const pollingInstance = axios.create(config);
const socialTradeInstance = axios.create({ baseURL: tsApiUrl });

export const setBearer = bearer => {
  instance.defaults.headers.common['Authorization'] = bearer?.startsWith(
    'Bearer',
  )
    ? bearer
    : `Bearer ${bearer}`;
  pollingInstance.defaults.headers.common['Authorization'] = bearer?.startsWith(
    'Bearer',
  )
    ? bearer
    : `Bearer ${bearer}`;
  socialTradeInstance.defaults.headers.common[
    'Authorization'
  ] = bearer?.startsWith('Bearer') ? bearer : `Bearer ${bearer}`;
};

export const apiInstance = async ({ url, method = 'GET', data }) => {
  if (method === 'POST') {
    return instance({
      url,
      method,
      data,
    });
  } else if (method === 'GET') {
    return instance({
      url: `${url}?${qs.stringify(data)}`,
      method,
    });
  }
};

export const authenticatedInstance = async ({
  url,
  method,
  headers = {},
  data,
  polling = false,
}) => {
  const willUseInstance = !polling ? instance : pollingInstance;

  const updatedHeaders = {
    ...headers,
  };

  if (method === 'POST') {
    return willUseInstance({
      url,
      method,
      headers: updatedHeaders,
      data,
    });
  } else if (method === 'GET') {
    return willUseInstance({
      url: `${url}?${qs.stringify(data)}`,
      method,
      headers: updatedHeaders,
    });
  }
};

export const getSocialTradeInstance = () => {
  return socialTradeInstance;
};

const handleError = error => {
  const status = _.get(error, 'response.status');

  if (status === 400) {
    return error.response;
  }

  if (status === 401) {
    // console.log(error);
    const {
      auth: { isAuthenticated },
    } = store.getState();

    if (isAuthenticated) {
      store.dispatch(logOut());
    } else {
      // const message = _.get(error, 'response.data.Message');
      // store.dispatch(triggerToast(message));
      store.dispatch(triggerToast('error401', 'warn', 2500, 'error401'));
      return error.response;
    }
  }
  if (status === 403) {
    // const message = _.get(error, 'response.data.Message');
    // store.dispatch(triggerToast(message));
    return error.response;
  }

  if (!status) {
    store.dispatch(setErrorStatus());
  }
};

instance.interceptors.response.use(null, handleError);

pollingInstance.interceptors.response.use(null, error => {
  if (_.get(error, 'response.status') === 401) {
    const {
      auth: { isAuthenticated },
    } = store.getState();

    if (isAuthenticated) {
      store.dispatch(logOut());
    }
  }
});

socialTradeInstance.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    return Promise.reject(
      (error.response && error.response.data) || { data: {} },
    );
  },
);

export const exchangeApi = new ExchangeApi({ config, handleError });

window.exchangeApi = exchangeApi;

loadProgressBar({ showSpinner: true }, instance);

window.authenticatedInstance = authenticatedInstance;

export default instance;
