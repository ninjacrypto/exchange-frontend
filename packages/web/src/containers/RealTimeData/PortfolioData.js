import React, { useCallback, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';

import { initializePortfolio } from 'redux/actions/portfolio';
import { socket } from 'realtime';
import { getIsAuthenticated } from 'redux/selectors/auth';

const PortfolioDataHandler = ({ initializePortfolio }) => {
  const updateSocketConnection = useCallback(
    (status = 'on') => {
      const handleInitializePortfolio = data => {
        initializePortfolio(data);
      };

      socket[status]('BL', handleInitializePortfolio);

    },
    [initializePortfolio],
  );

  useEffect(() => {
    socket.subscribe('BL');
    window.addEventListener('online', () => {
      setTimeout(() => {
        socket.subscribe('BL');
      }, 5000);
    });
    updateSocketConnection();

    return () => {
      socket.unsubscribe('BL');
      updateSocketConnection('off');
    };
  }, [updateSocketConnection]);

  useEffect(() => {});

  return <React.Fragment />;
};

const PortfolioData = connect(null, {
  initializePortfolio,
})(PortfolioDataHandler);

const PortfolioDataWrapper = () => {
  const isAuthenticated = useSelector(getIsAuthenticated);
  const bearerToken = useSelector(
    ({ auth: { authorization } }) => authorization,
  );

  if (!isAuthenticated || !bearerToken) {
    return null;
  }

  return <PortfolioData />;
};

export default PortfolioDataWrapper;
