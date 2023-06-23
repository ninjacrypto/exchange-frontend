import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import {
  loadSettings,
  loadCurrencySettings,
} from 'redux/actions/exchangeSettings';
import {
  getP2PCurrencies,
  getPaymentMethods,
  getUserPaymentMethods,
  getMyOffers,
  getP2PWallet,
} from 'redux/actions/p2p';
import {
  loadFeeDiscountStatus,
  getAdditionalFields,
  loadProfile,
  getUserTradingVolumeDiscounts,
  callRenewTokenFun
} from 'redux/actions/profile';
import { loadFavorites } from 'redux/actions/userSettings';
import { getNDWalletBalance } from 'redux/actions/NDWalletData';

export const InitialData = ({ isAuthenticated }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadSettings());
    dispatch(loadCurrencySettings());
    dispatch(getPaymentMethods());
    dispatch(getP2PCurrencies());

    if (isAuthenticated) {
      dispatch(loadFeeDiscountStatus());
      dispatch(getAdditionalFields());
      dispatch(loadFavorites());
      dispatch(loadProfile());
      dispatch(getUserTradingVolumeDiscounts());
      dispatch(callRenewTokenFun());
      dispatch(getUserPaymentMethods());
      dispatch(getMyOffers());
      dispatch(getP2PWallet());
      dispatch(getNDWalletBalance());
    }
  }, [dispatch]);

  return null;
};
