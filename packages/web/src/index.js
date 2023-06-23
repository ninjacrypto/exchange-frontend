import * as React from 'react';
import * as ReactDOM from 'react-dom';
import _ from 'lodash';
import { store, persistor, beforeLift } from 'redux/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import 'react-table/react-table.css';
import 'react-virtualized/styles.css';
import * as serviceWorker from './serviceWorker';
import cx from 'classnames';

// eslint-disable-next-line
import { socket } from 'realtime';
import './i18n';

import './index.scss';
import App from './layouts/App';
import { Loading } from 'components/Loading';

import { ReactTableDefaults } from 'react-table';
import { Box, Text } from 'components/Wrapped';

Object.assign(ReactTableDefaults, {
  NoDataComponent: () => null,
  TdComponent: ({ children, className, ...rest }) => {
    return (
      <Box
        pad="none"
        round={false}
        className={cx(['rt-td', className])}
        justify="center"
        {...rest}
      >
        <React.Fragment>
          {_.isString(children) ? (
            <Text size="xsmall">{children}</Text>
          ) : (
            children
          )}
        </React.Fragment>
      </Box>
    );
  },
});

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={<Loading />} persistor={persistor} onBeforeLift={beforeLift}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById('root'),
);

serviceWorker.unregister();
