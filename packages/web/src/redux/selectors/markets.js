import { createSelector } from 'reselect';
import _ from 'lodash';
import { fx } from 'utils';

const getCryptoRateList = state => state.markets.rateList.crypto;

const getFiatRateList = state => state.markets.rateList.fiat;

const getMarketGroups = ({
  exchangeSettings: {
    settings: { marketsByGroup },
  },
  userSettings: { favorites },
}) => ({ favorites, ...marketsByGroup });

const getGroupedOnlyPairs = ({
  exchangeSettings: {
    settings: { groupedOnlyPairs },
  },
}) => groupedOnlyPairs;

const getPrices = ({ markets: { prices } }) => prices;

const getCurrentMarket = (__, { currentMarket }) => currentMarket;

export const getRateList = createSelector(
  [getCryptoRateList, getFiatRateList],
  (cryptoRateList, fiatRateList) => {
    const rateList = { ...cryptoRateList, ...fiatRateList };
    fx.rates = rateList;
    return rateList;
  },
);

export const getPricesByMarket = createSelector(
  [getMarketGroups, getPrices],
  ({ marketLookup }, prices) => {
    const marketsByGroup = {
      favorites: [],
    };

    Object.entries(prices).forEach(([market, tradingPairs]) => {
      const marketGroup = marketLookup[market];

      if (marketsByGroup[marketGroup]) {
        const currentTradingPairs = marketsByGroup[marketGroup];
        marketsByGroup[marketGroup] = [
          ...currentTradingPairs,
          ...Object.values(tradingPairs),
        ];
      } else {
        marketsByGroup[marketGroup] = Object.values(tradingPairs);
      }
    });

    return marketsByGroup;
  },
);

export const getTradingDataByGroup = createSelector(
  [getCurrentMarket, getMarketGroups, getPrices, getGroupedOnlyPairs],
  (currentMarket, marketsByGroup, prices, groupedOnlyPairs) => {
    const tradingPairs = [];

    if (!_.isEmpty(prices)) {
      marketsByGroup[currentMarket].forEach(singleMarket => {
        if (_.includes(singleMarket, '_')) {
          const [baseCurrency, quoteCurrency] = singleMarket.split('_');
          const singlePrice = _.get(
            prices,
            `${quoteCurrency}.${baseCurrency}`,
          );

          if (singlePrice) {
            singlePrice.favorite = true;
            tradingPairs.push(singlePrice);
          }
        } else {
          if (!_.isEmpty(prices[singleMarket])) {
            Object.values(prices[singleMarket]).forEach(singlePair => {
              if (!_.get(groupedOnlyPairs, `${singlePair.quoteCurrency}.${singlePair.baseCurrency}`)) {
                tradingPairs.push(singlePair)
              }
            })

          }
        }
      });
    }

    return tradingPairs;
  },
);

export const getCryptoPairs = createSelector(
  [getMarketGroups, getPrices, getGroupedOnlyPairs],
  (marketsByGroup, prices, groupedOnlyPairs) => {
    const cryptoPairs = [];

    if (!_.isEmpty(prices)) {
      Object.values(prices).forEach(price => {
        Object.values(price).forEach(pair => {
          cryptoPairs.push({
            baseCurrency: pair.baseCurrency,
            quoteCurrency: pair.quoteCurrency
          });
        });
      });
    }

    return cryptoPairs;
  },
);
