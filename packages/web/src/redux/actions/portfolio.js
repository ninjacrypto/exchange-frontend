import _ from 'lodash';
import { formatNumberToPlaces, convertCurrency, add } from 'utils';
import instance, { authenticatedInstance } from 'api';
import { triggerToast, triggerModalOpen } from 'redux/actions/ui';
import { getRateList } from 'redux/selectors/markets';

export const UPDATE_PORTFOLIO = 'UPDATE_PORTFOLIO';
export const LOAD_PORTFOLIO_STARTED = 'LOAD_PORTFOLIO_STARTED';
export const LOAD_PORTFOLIO_SUCCESS = 'LOAD_PORTFOLIO_SUCCESS';
export const LOAD_PORTFOLIO_FAIL = 'LOAD_PORTFOLIO_FAIL';
export const INITIALIZE_PORTFOLIO = 'INITIALIZE_PORTFOLIO';
export const UPDATE_PORTFOLIOS = 'UPDATE_PORTFOLIOS';
export const GENERATE_DEPOSIT_ADDRESS_STARTED =
  'GENERATE_DEPOSIT_ADDRESS_STARTED';
export const GENERATE_DEPOSIT_ADDRESS_SUCCESS =
  'GENERATE_DEPOSIT_ADDRESS_SUCCESS';
export const GENERATE_DEPOSIT_ADDRESS_FAIL = 'GENERATE_DEPOSIT_ADDRESS_FAIL';
export const LOAD_DEPOSIT_HISTORY_SUCCESS = 'LOAD_DEPOSIT_HISTORY_SUCCESS';
export const LOAD_WITHDRAWAL_HISTORY_SUCCESS =
  'LOAD_WITHDRAWAL_HISTORY_SUCCESS';
export const FETCH_ALL_DEPOSIT_ADDRESSES_STARTED =
  'FETCH_ALL_DEPOSIT_ADDRESSES_STARTED';
export const FETCH_ALL_DEPOSIT_ADDRESSES_SUCCESS =
  'FETCH_ALL_DEPOSIT_ADDRESSES_SUCCESS';
export const FETCH_ALL_DEPOSIT_ADDRESSES_FAIL =
  'FETCH_ALL_DEPOSIT_ADDRESSES_FAIL';
export const GET_WALLET_TOTAL_STARTED = 'GET_WALLET_TOTAL_STARTED';
export const GET_WALLET_TOTAL_SUCCESS = 'GET_WALLET_TOTAL_SUCCESS';
export const GET_WALLET_TOTAL_FAIL = 'GET_WALLET_TOTAL_FAIL';
export const SET_WITHDRAWAL_LIMIT = 'SET_WITHDRAWAL_LIMIT';

export const LOAD_DERIVATIVES_PORTFOLIO_STARTED = 'LOAD_DERIVATIVES_PORTFOLIO_STARTED';
export const LOAD_DERIVATIVES_PORTFOLIO_SUCCESS = 'LOAD_DERIVATIVES_PORTFOLIO_SUCCESS';
export const LOAD_DERIVATIVES_PORTFOLIO_FAIL = 'LOAD_DERIVATIVES_PORTFOLIO_FAIL';

export const getPortfolioData = () => {
  return async (dispatch, getState) => {
    dispatch({ type: LOAD_PORTFOLIO_STARTED });

    try {
      const response = await authenticatedInstance({
        url: '/api/GetBalance',
        method: 'POST',
        data: {
          currency: 'ALL',
        },
        polling: true,
      });
      const { currencySettings } = getState().exchangeSettings;
      // eslint-disable-next-line no-unused-vars
      const rateList = getRateList(getState());

      let balances = {};

      response.data.data.forEach(singleBalance => {
        if (
          _.get(
            currencySettings,
            `${singleBalance.currency}.currencyEnabled`,
            false,
          )
        ) {
          const { currency, balance, balanceInTrade } = singleBalance;
          const totalBalance = add(balance, balanceInTrade);
          balances[currency] = singleBalance;
          balances[currency].totalBalance = totalBalance;
          balances[currency].btcValue = convertCurrency(totalBalance, {
            from: currency,
            to: 'BTC',
          });
          balances[currency].balanceBtcValue = convertCurrency(balance, {
            from: currency,
            to: 'BTC',
          });
          balances[currency].balanceInTradeBtcValue = convertCurrency(
            balanceInTrade,
            {
              from: currency,
              to: 'BTC',
            },
          );
        }
      });

      dispatch({
        type: LOAD_PORTFOLIO_SUCCESS,
        payload: balances,
      });

      dispatch(getWalletTotal());
    } catch (e) {
      console.log(e.response);
      dispatch({ type: LOAD_PORTFOLIO_FAIL });
      // dispatch(triggerToast('Failed to load portfolio data.'));
    }
  };
};

const getBalanceValues = (currency, balanceInfo) => {
  const { balance, balance_in_trade } = balanceInfo;
  const totalBalance = add(balance, balance_in_trade);

  let updatedBalance = {
    ...balanceInfo,
    currency,
  };

  updatedBalance.totalBalance = totalBalance;
  updatedBalance.btcValue = convertCurrency(totalBalance, {
    from: currency,
    to: 'BTC',
  });
  updatedBalance.balanceBtcValue = convertCurrency(balance, {
    from: currency,
    to: 'BTC',
  });
  updatedBalance.balanceInTradeBtcValue = convertCurrency(balance_in_trade, {
    from: currency,
    to: 'BTC',
  });

  return updatedBalance;
};

export const initializePortfolio = data => {
  return async (dispatch, getState) => {
    const {
      exchangeSettings: { currencySettings },
      portfolio: { portfolios },
    } = getState();

      if (Object.keys(currencySettings).length === 0 && currencySettings.constructor === Object) {
      const intervaTime = setInterval(() => {
          const { currencySettings } = getState().exchangeSettings;
          if (currencySettings.length !== 0) {
            clearInterval(intervaTime);
          }
          const rateList = getRateList(getState());
  
          let balances = {};
      
          Object.entries(data).forEach(([currency, singleBalance]) => {
            if (_.get(currencySettings, `${currency}.currencyEnabled`, false)) {
              balances[currency] = getBalanceValues(currency, singleBalance);
            }
          });

          dispatch({
            type: INITIALIZE_PORTFOLIO,
            payload: balances,
          });
      
          dispatch(getWalletTotal());
        }, 2000);

      } else {
      // eslint-disable-next-line no-unused-vars
      const rateList = getRateList(getState());
  
      let balances = {};
  
      Object.entries(data).forEach(([currency, singleBalance]) => {
        if (_.get(currencySettings, `${currency}.currencyEnabled`, false)) {
          balances[currency] = getBalanceValues(currency, singleBalance);
        }
      });

      dispatch({
        type: INITIALIZE_PORTFOLIO,
        payload: {
          ...portfolios,
          ...balances,
        },
      });
  
      dispatch(getWalletTotal());
      }
  };
};

export const updatePortfolio = data => {
  return async (dispatch, getState) => {
    const {
      exchangeSettings: { currencySettings },
      portfolio: { portfolios },
    } = getState();

    let balances = {};

    Object.entries(data).forEach(([currency, singleBalance]) => {
      if (_.get(currencySettings, `${currency}.currencyEnabled`, false)) {
        balances[currency] = getBalanceValues(currency, singleBalance);
      }
    });

    dispatch({
      type: UPDATE_PORTFOLIOS,
      payload: {
        ...portfolios,
        ...balances,
      },
    });

    dispatch(getWalletTotal());
  };
};

export const generateDepositAddress = currency => {
  return async dispatch => {
    dispatch({ type: GENERATE_DEPOSIT_ADDRESS_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: '/api/GenerateAddress',
        method: 'POST',
        data: {
          currency,
        },
      });
      if (data.status === 'Success') {
        dispatch({
          type: GENERATE_DEPOSIT_ADDRESS_SUCCESS,
          payload: {
            currency,
            address: data.data.address,
          },
        });
        dispatch(triggerToast('addressSuccess', 'success', 1500));
        dispatch(fetchAllDepositAddresses());
      } else {
        dispatch({ type: GENERATE_DEPOSIT_ADDRESS_FAIL });
        dispatch(triggerModalOpen(data.message));
      }
    } catch (e) {
      dispatch({ type: GENERATE_DEPOSIT_ADDRESS_FAIL });
      dispatch(triggerModalOpen('somethingWentWrong'));
    }
  };
};

export const fetchAllDepositAddresses = () => {
  return async dispatch => {
    dispatch({ type: FETCH_ALL_DEPOSIT_ADDRESSES_STARTED });

    try {
      const { data } = await instance({
        url: '/api/ListAllAddresses',
        method: 'GET',
      });

      if (data.status === 'Success') {
        const addresses = _.transform(
          data.data,
          (result, value, key) => (result[key.toLowerCase()] = value),
        );

        dispatch({
          type: FETCH_ALL_DEPOSIT_ADDRESSES_SUCCESS,
          payload: addresses,
        });
      } else {
        dispatch({ type: FETCH_ALL_DEPOSIT_ADDRESSES_FAIL });
        // dispatch(triggerModalOpen(data.message));
      }
    } catch (e) {
      dispatch({ type: FETCH_ALL_DEPOSIT_ADDRESSES_FAIL });
      dispatch(triggerModalOpen('somethingWentWrong'));
    }
  };
};

export const withdrawalRequest = (withdrawalData, { hasAddressTag, cb }) => {

  return async dispatch => {
    try {
      if (hasAddressTag) {
        if (!withdrawalData.addressTag) {
          withdrawalData.addressTag = ' ';
        }
      } else {
        delete withdrawalData.addressTag;
      }

      const { data } = await authenticatedInstance({
        url: '/api/withdraw-crypto?fee=v2',
        method: 'POST',
        data: withdrawalData,
      });

      if (data.status === 'Success') {
        dispatch(triggerModalOpen('withdrawalRequest'));
        dispatch(getWithdrawalHistory(withdrawalData.currency));
      } else {
        dispatch(triggerModalOpen(data.message));
      }
    } catch (e) {
      console.log(e);
    }
    if (cb) {
      cb();
    }
  };
};

export const aeraPassWithdrawalRequest = (withdrawalData, { cb }) => {
  return async dispatch => {
    try {
      const { data } = await authenticatedInstance({
        url: '/api/RequestTransfer_AeraPass',
        method: 'POST',
        data: withdrawalData,
      });

      if (data.status === 'Success') {
        dispatch(triggerModalOpen('withdrawalRequest'));
        dispatch(getWithdrawalHistory(withdrawalData.currency));
      } else {
        dispatch(triggerModalOpen(data.message, 'error'));
      }
    } catch (e) {
      console.log(e);
    }
    if (cb) {
      cb();
    }
  };
};

export const updatePortfolioData = portfolioData => {
  return (dispatch, getState) => {
    const { portfolio } = getState();
    const { currency } = portfolioData;

    if (!_.isEqual(portfolioData, _.get(portfolio.portfolios, currency))) {
      dispatch({
        type: UPDATE_PORTFOLIO,
        payload: portfolioData,
      });
    }
  };
};

export const getDepositHistory = (currency, walletType) => {
  const isFiat = walletType.includes('Fiat');

  currency = _.startsWith(currency, 'ALL') ? 'ALL' : currency;
  return async dispatch => {
    try {
      let response;
      if (isFiat) {
        response = await authenticatedInstance({
          url: '/api/List_Fiat_Manual_Deposit_Requests',
          method: 'GET',
          data: {
            currency,
          },
        });
      } else {
        response = await authenticatedInstance({
          url: `api/GetDeposits`,
          method: 'POST',
          data: {
            currency,
          },
        });
      }

      const { data } = response;

      if (data.status === 'Success') {
        dispatch({
          type: LOAD_DEPOSIT_HISTORY_SUCCESS,
          payload: isFiat ? data.data : data.data.deposits,
        });
      }
    } catch (e) {}
  };
};

export const getWithdrawalHistory = currency => {
  return async dispatch => {
    try {
      const { data } = await authenticatedInstance({
        url: `api/GetWithdrawals`,
        method: 'POST',
        data: {
          currency,
        },
      });

      if (data.status === 'Success') {
        dispatch({
          type: LOAD_WITHDRAWAL_HISTORY_SUCCESS,
          payload: data.data.withdrawals,
        });
      }
    } catch (e) {}
  };
};

export const getWalletTotal = () => {
  return (dispatch, getState) => {
    dispatch({
      type: GET_WALLET_TOTAL_STARTED,
    });

    try {
      const {
        portfolio: { portfolios },
        exchangeSettings: { language, currencyCode },
      } = getState();
      // eslint-disable-next-line
      const rateList = getRateList(getState());

      const portfoliobalance = format => {
        let totalType;

        return Object.values(portfolios).reduce(
          (total, { currency, totalBalance }) => {
            totalType = convertCurrency(totalBalance, {
              from: currency,
              to: format ? format : currencyCode,
            });

            return total + totalType;
          },
          0,
        );
      };

      dispatch({
        type: GET_WALLET_TOTAL_SUCCESS,
        payload: {
          btcTotal: formatNumberToPlaces(portfoliobalance('BTC')),
          fiatTotal: new Intl.NumberFormat(language, {
            style: 'currency',
            currency: currencyCode,
          }).format(portfoliobalance()),
        },
      });
    
    } catch (e) {
      dispatch({
        type: GET_WALLET_TOTAL_FAIL,
      });
    }
  };
};

export const getWithdrawalLimits = () => {
  return async dispatch => {
    try {
      const { data } = await authenticatedInstance({
        url: '/api/Get_User_Withdrawal_Limits',
        method: 'GET',
      });

      if (data.status === 'Success') {
        dispatch({
          type: SET_WITHDRAWAL_LIMIT,
          payload: data.data[0],
        });
      }
    } catch (e) {}
  };
};

export const getDerivativesPortfolio = data => {
  return async (dispatch, getState) => {
    dispatch({ type: LOAD_DERIVATIVES_PORTFOLIO_STARTED });

    try {
      const { data } = await authenticatedInstance({
        url: `/derivatives/get-balance`,
        method: 'GET'
      });

      if (data.status === 'Success') {
      dispatch({
        type: LOAD_DERIVATIVES_PORTFOLIO_SUCCESS,
        payload: data.data,
      });
    }

    } catch (e) {
      dispatch({ type: LOAD_DERIVATIVES_PORTFOLIO_FAIL });
    }
  };
};
