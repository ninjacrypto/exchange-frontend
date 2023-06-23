import _ from 'lodash';

export const getTradeHistory = ({ exchange: { tradeHistory } }) => tradeHistory;
export const getRecentTradeHistoryItem = ({ exchange: { tradeHistory } }) =>
  _.get(tradeHistory, '[0]', {});
