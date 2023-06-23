import { createSelector } from 'reselect';
import _ from 'lodash';

const getTradingPairSettings = ({
  exchangeSettings: {
    settings: { tradingPairSettings },
  },
}) => tradingPairSettings;

const getTradingPairFromProps = (__, { tradingPair }) => tradingPair;

export const getSingleTradingPairSettings = createSelector(
  [getTradingPairSettings, getTradingPairFromProps],
  (tradingPairSettings, tradingPair) => {
    const settings = singleTradingPairSettings(
      tradingPairSettings,
      tradingPair,
    );

    return settings;
  },
);

export const singleTradingPairSettings = (
  tradingPairSettings,
  { baseCurrency, quoteCurrency },
) => {
  const defaultSettings = {
    minOrderValue: 0.0001,
    minTickSize: 0.0001,
    minTradeAmount: 0.0001,
    orderValueDecimals: 4,
    tickDecimals: 4,
    tradeAmountDecimals: 4,
  };

  const settings = _.get(
    tradingPairSettings,
    `${baseCurrency}${quoteCurrency}`,
    defaultSettings,
  );

  // Object.keys(settings).forEach(singleKey => {
  //   if (settings[singleKey] === 0) {
  //     settings[singleKey] = defaultSettings[singleKey];
  //   }
  // });

  return settings;
};
