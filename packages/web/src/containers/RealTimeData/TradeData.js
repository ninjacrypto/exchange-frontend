import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { store } from 'redux/store';

import {
  updateTradingPair,
  updateOrderBook,
  updateOrderBookTotal,
  updateTradeHistory,
  initializeTradeHistory,
  initializeOrderBook,
  UPDATE_ORDER_BOOK_ASKS,
  UPDATE_ORDER_BOOK_BIDS,
  clearExchange,
} from 'redux/actions/exchange';

import {
  initializeOpenOrders,
  updateOpenOrders,
  getTradeHistory,
} from 'redux/actions/orders';
import { socket } from 'realtime';

const TradeData = ({
  authorization,
  initializeOrderBook,
  initializeTradeHistory,
  updateTradeHistory,
  initializeOpenOrders,
  tradingPair,
  updateTradingPair,
  updateOrderBookTotal,
  isAuthenticated,
  clearExchange,
  isOrderBook = false,
}) => {
  const [socketTradingPair, setSocketTradingPair] = useState();

  const invokeNewTradingPair = useCallback(
    (tradingPair) => {

      updateTradingPair(tradingPair);
      socket.subscribe(
        ['OB', 'RT', 'OT'],
        `${tradingPair.baseCurrency}_${tradingPair.quoteCurrency}`,
      );

      if (isAuthenticated) {
        // store.getState().orders.openOrders = [];
        initializeOpenOrders([])
        socket.subscribe(
          'PO',
          `${tradingPair.baseCurrency}_${tradingPair.quoteCurrency}`
        );
      }

      window.addEventListener('online', () => {
        setTimeout(() => {
          socket.subscribe(
            ['OB', 'RT', 'OT'],
            `${tradingPair.baseCurrency}_${tradingPair.quoteCurrency}`,
          );
    
          if (isAuthenticated) {
            // store.getState().orders.openOrders = [];
            initializeOpenOrders([])
            socket.subscribe(
              'PO',
              `${tradingPair.baseCurrency}_${tradingPair.quoteCurrency}`
            );
          }
        }, 5000);
      });
    },
    [updateTradingPair, isAuthenticated, authorization],
  );

  const updateSocketConnection = useCallback(
    (status = 'on') => {
      const handleOrderBook = data => {
        const { bids, asks } = data;
        initializeOrderBook(asks, UPDATE_ORDER_BOOK_ASKS);
        initializeOrderBook(bids, UPDATE_ORDER_BOOK_BIDS);
      };

      const handleAllMatched = data => {
        initializeTradeHistory(data);
      };

      const handleAllPendingOrders = data => {
        initializeOpenOrders(data);
      };

      const handleOrderBookTotal = data => {
        updateOrderBookTotal(data);
      };

      socket[status]('OB', handleOrderBook);

      socket[status]('RT', handleAllMatched);

      socket[status]('OT', handleOrderBookTotal);

      if (!isOrderBook) {
        socket[status]('PO', handleAllPendingOrders);
      }
    },
    [
      initializeOrderBook,
      initializeTradeHistory,
      updateTradeHistory,
      initializeOpenOrders,
      updateOrderBookTotal,
      isOrderBook,
    ],
  );

  useEffect(() => {
    updateSocketConnection();

    return () => {
      updateSocketConnection('off');
    };
  }, [updateSocketConnection]);

  useEffect(() => {
    if (!_.isEqual(tradingPair, socketTradingPair)) {
      invokeNewTradingPair(tradingPair);
      setSocketTradingPair(tradingPair);
    }
  }, [
    tradingPair,
    invokeNewTradingPair,
    setSocketTradingPair,
    socketTradingPair,
  ]);

  useEffect(() => {
    return () => {
      if (socketTradingPair) {
        socket.unsubscribe(
          ['OB', 'RT', 'OT'],
          `${socketTradingPair.baseCurrency}_${socketTradingPair.quoteCurrency}`,
        );
        if (!isOrderBook) {
          // socket.unsubscribe('CH');
        }
      }
    }
  }, [socketTradingPair])

  useEffect(() => {
    if (socketTradingPair) {
      if (isAuthenticated) {
        // store.getState().orders.openOrders = [];
        initializeOpenOrders([])
        socket.subscribe('PO',  `${socketTradingPair.baseCurrency}_${socketTradingPair.quoteCurrency}`)
      }
    }

    
  window.addEventListener('online', () => {
    setTimeout(() => {
      if (socketTradingPair) {
        if (isAuthenticated) {
          // store.getState().orders.openOrders = [];
          initializeOpenOrders([])
          socket.subscribe('PO',  `${socketTradingPair.baseCurrency}_${socketTradingPair.quoteCurrency}`)
        }
      }
    }, 5000);
  });

    return () => {
      if (socketTradingPair) {
        if (isAuthenticated) {
          socket.unsubscribe('PO',  `${socketTradingPair.baseCurrency}_${socketTradingPair.quoteCurrency}`)
        }
      }
    }
  }, [isAuthenticated, socketTradingPair])

  useEffect(() => {

    return () => {
      clearExchange();
    }
  }, [clearExchange])

  return (<React.Fragment />);
};

TradeData.propTypes = {
  tradingPair: PropTypes.object.isRequired,
};

const mapStateToProps = ({ auth }) => ({
  authorization: auth.authorization,
  isAuthenticated: auth.isAuthenticated,
});

export default connect(mapStateToProps, {
  updateTradingPair,
  updateOrderBook,
  updateOrderBookTotal,
  updateTradeHistory,
  initializeTradeHistory,
  initializeOrderBook,
  initializeOpenOrders,
  updateOpenOrders,
  clearExchange,
  getTradeHistory,
})(TradeData);
