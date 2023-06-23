import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';

import { initializeOpenOrders } from 'redux/actions/orders';
import { socket } from 'realtime';
import {
  updateTradingPair,
} from 'redux/actions/exchange';


const OpenOrdersData = ({ initializeOpenOrders, updateTradingPair }) => {
  const updateSocketConnection = useCallback(
    (status = 'on') => {
      const handleAllPendingOrders = data => {
        initializeOpenOrders(data);
      };

      socket[status]('PO', handleAllPendingOrders);
    },
    [initializeOpenOrders],
  );

  useEffect(() => {
    updateSocketConnection();
    // store.getState().orders.openOrders = [];
    updateTradingPair('ALL');
    socket.subscribe('PO', 'ALL');
    initializeOpenOrders([])

    window.addEventListener('online', () => {
      setTimeout(() => {
        // store.getState().orders.openOrders = [];
        updateTradingPair('ALL');
        socket.subscribe('PO', 'ALL');
        initializeOpenOrders([])
      }, 5000);
    },
    [initializeOpenOrders, updateTradingPair],
    );

    return () => {
      socket.unsubscribe('PO', ['ALL']);
      updateSocketConnection('off');
    };
  }, [initializeOpenOrders, updateTradingPair]);

  return <React.Fragment />;
};

const mapStateToProps = ({ auth }) => ({
  authorization: auth.authorization,
  isAuthenticated: auth.isAuthenticated,
});


export default connect(mapStateToProps, {
  updateTradingPair,
  initializeOpenOrders,
})(OpenOrdersData);
