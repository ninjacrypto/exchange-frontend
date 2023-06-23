import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
  updateCryptoRateList,
  updateFiatRateList,
} from 'redux/actions/markets';

import {
  initializeMarketData,
  updateMarketData,
  updateBulkMarketData,
} from 'redux/actions/markets';
import { updateCurrencyData } from 'redux/actions/currencyData';
import { socket } from 'realtime';
import { PollingDataQuery } from './PollingDataQuery';
import { exchangeApi } from 'api';

const MarketData = ({
  updateBulkMarketData,
  initializeMarketData,
  updateMarketData,
  updateFiatRateList,
  updateCryptoRateList,
  enableCryptoFeatures,
  updateCurrencyData,
  isMarketsInitialized,
}) => {
  useEffect(() => {
    socket.subscribe('MK');
    window.addEventListener('online', () => {
      setTimeout(() => {
        socket.subscribe('MK');
      }, 5000);
    });
  }, []);

  useEffect(() => {
    socket.on('MK', async data => {
      if (isMarketsInitialized) {
        updateBulkMarketData(data);
      } else {
        initializeMarketData(data);
      }
    });
  }, [
    updateBulkMarketData,
    initializeMarketData,
    updateMarketData,
    isMarketsInitialized,
  ]);

  return (
    <>
      <PollingDataQuery
        queryName="cryptoPriceList"
        apiMethod={exchangeApi.getCryptoRateList}
        onSuccess={updateCryptoRateList}
        queryOptions={{ refetchInterval: 10000 }}
      />
      <PollingDataQuery
        queryName="fiatPriceList"
        apiMethod={exchangeApi.getFiatRateList}
        onSuccess={updateFiatRateList}
        queryOptions={{ refetchInterval: 10000 }}
      />
      {enableCryptoFeatures && (
        <PollingDataQuery
          queryName="cryptocurrencyInfo"
          apiMethod={exchangeApi.getCryptocurrencyInfo}
          onSuccess={updateCurrencyData}
          queryOptions={{ refetchInterval: 60000 * 10 }}
        />
      )}
    </>
  );
};

const mapStateToProps = ({
  exchangeSettings: {
    settings: { enableCryptoFeatures },
  },
  markets: { isMarketsInitialized },
}) => ({ enableCryptoFeatures, isMarketsInitialized });

export default connect(mapStateToProps, {
  initializeMarketData,
  updateMarketData,
  updateBulkMarketData,
  updateFiatRateList,
  updateCryptoRateList,
  updateCurrencyData,
})(MarketData);
