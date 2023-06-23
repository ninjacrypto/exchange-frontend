import { applyMiddleware, combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
// import reduxLogger from 'redux-logger';
import reduxThunk from 'redux-thunk';
import { persistStore } from 'redux-persist';
import { setBearer, exchangeApi } from 'api';

import { userReducer } from './reducers/user';
import { uiReducer } from './reducers/ui';
import { marketReducer } from './reducers/markets';
import { portfolioReducer } from './reducers/portfolio';
import { authReducer } from './reducers/auth';
import { exchangeReducer } from './reducers/exchange';
import { ordersReducer } from './reducers/orders';
import { currencyDataReducer } from './reducers/currencyData';
import { settingsReducer } from './reducers/exchangeSettings';
import { userSettingsReducer } from './reducers/userSettings';
import { initializeLocale } from './actions/exchangeSettings';
import { p2pReducer } from './reducers/p2p';
import { NDWalletReducer } from './reducers/NDWalletData';
import { socket } from 'realtime';

const rootReducer = combineReducers({
  exchange: exchangeReducer,
  markets: marketReducer,
  portfolio: portfolioReducer,
  user: userReducer,
  auth: authReducer,
  ui: uiReducer,
  orders: ordersReducer,
  currencyData: currencyDataReducer,
  exchangeSettings: settingsReducer,
  userSettings: userSettingsReducer,
  p2p: p2pReducer,
  NDWalletData: NDWalletReducer
});

export const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(reduxThunk)),
);
export const persistor = persistStore(store, null);


export const beforeLift = () => {
  store.dispatch(initializeLocale());
  const { auth: { authorization } } = store.getState();
  if (authorization) {
    setBearer(authorization);
    exchangeApi.setAuthentication(authorization);
    socket.login(authorization);
  }
}