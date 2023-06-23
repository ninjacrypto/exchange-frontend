import historyProvider from './historyProvider';
import streamProvider from './streamProvider';
import { store } from 'redux/store';

const supportedResolutions = ['1', '5', '15', '60', '240', 'D', 'W'];

const config = {
  supported_resolutions: supportedResolutions,
};

const datafeed = {
  onReady: cb => {
    // console.log('=====onReady running');
    setTimeout(() => cb(config), 0);
  },
  searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
    // console.log('====Search Symbols running');
  },
  resolveSymbol: (
    symbolName,
    onSymbolResolvedCallback,
    onResolveErrorCallback,
  ) => {
    // expects a symbolInfo object in response
    // console.log('======resolveSymbol running');
    // console.log('resolveSymbol:',{symbolName})
    // eslint-disable-next-line no-unused-vars
    const { exchange: { tradingPairSettings }, } = store.getState();
    const split_data = symbolName.split(/[:/]/);
    // console.log({split_data})
    const symbol_stub = {
      name: symbolName,
      description: '',
      type: 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      ticker: symbolName,
      exchange: '',
      minmov: 1,
      pricescale: Math.pow(10, tradingPairSettings.tickDecimals),
      has_intraday: true,
      intraday_multipliers: ['1', '5', '15', '60', '240', '1440', '10080', '43800'],
      supported_resolution: supportedResolutions,
      volume_precision: 8,
      data_status: 'streaming',
      // has_empty_bars: true,
    };

    // if (split_data[2].match(/USD|EUR|JPY|AUD|GBP|KRW|CNY/)) {
    //   symbol_stub.pricescale = 100
    // }

    setTimeout(function() {
      onSymbolResolvedCallback(symbol_stub);
      // console.log('Resolving that symbol....', symbol_stub);
    }, 0);

    // onResolveErrorCallback('Not feeling it today')
  },
  getBars: async (
    symbolInfo,
    resolution,
    from,
    to,
    onHistoryCallback,
    onErrorCallback,
    firstDataRequest,
  ) => {
    // console.log('=====getBars running');
    // console.log(
    //   `Requesting bars between ${new Date(
    //     from * 1000,
    //   ).toISOString()} and ${new Date(to * 1000).toISOString()}`,
    // );
    try {
      let bars = [];
      let series;

      do {
        series = await historyProvider.getBars(
          symbolInfo,
          resolution,
          from,
          to,
          firstDataRequest,
        );

        firstDataRequest = false;

        if (series[0]) {
          to = series[0].time / 1000;
        } else {
          to = 0;
        }

        bars = bars.concat(series);

      } while (to > from && series.length);

      if (bars.length) {
        onHistoryCallback(bars.sort((a, b) => a.time - b.time), { noData: false });
      } else {
        onHistoryCallback(bars, { noData: true });
      }
    } catch (e) {
      onErrorCallback(e);
    }
    // Need to handle error here.
  },
  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscribeUID,
    onResetCacheNeededCallback,
  ) => {
    // console.log('=====subscribeBars runnning');
    streamProvider.subscribeBars(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscribeUID,
      onResetCacheNeededCallback,
    );
  },
  unsubscribeBars: subscriberUID => {
    // console.log('=====unsubscribeBars running');
    streamProvider.unsubscribeBars(subscriberUID);
  },
  calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {
    //optional
    // console.log('=====calculateHistoryDepth running')
    // // while optional, this makes sure we request 24 hours of minute data at a time
    // return resolution < 60 ? {resolutionBack: 'D', intervalBack: '1'} : undefined
  },
  getMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
    //optional
    // console.log('=====getMarks running');
  },
  getTimeScaleMarks: (
    symbolInfo,
    startDate,
    endDate,
    onDataCallback,
    resolution,
  ) => {
    //optional
    // console.log('=====getTimeScaleMarks running');
  },
  getServerTime: cb => {
    // console.log('=====getServerTime running');
  },
};

export default datafeed;
