import { createSelector } from 'reselect';
import _ from 'lodash';

export const getUserFavorites = ({ userSettings: { favorites } }) => favorites;

const getTradingPair = (__, { tradingPair }) => tradingPair;

export const isFavorite = createSelector(
  [getUserFavorites, getTradingPair],
  (userFavorites, tradingPair) => {
    return _.includes(userFavorites, tradingPair);
  },
);
