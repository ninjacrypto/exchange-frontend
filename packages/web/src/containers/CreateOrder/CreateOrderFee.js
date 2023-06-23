import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './CreateOrder.module.scss';
import { formatCrypto } from '../../utils/numbers';

import { withNamespaces } from 'react-i18next';

const CreateOrderFee = ({ currencySettings, tradingPair, total, side, t }) => {
  const singleCurrencySettings = currencySettings[tradingPair.baseCurrency];

  const feePercent =
    singleCurrencySettings[`${side.toLowerCase()}ServiceCharge`] / 100;
  const fee = total * feePercent;

  return (
    <React.Fragment>
      <p className={styles.orderFee}>
        {t('forms.estimatedFee')} {formatCrypto(fee)}{' '}
        {tradingPair.quoteCurrency}
      </p>
    </React.Fragment>
  );
};

CreateOrderFee.propTypes = {
  total: PropTypes.string.isRequired,
};

CreateOrderFee.defaultProps = {
  total: 0,
};

const mapStateToProps = ({ exchangeSettings }) => ({
  currencySettings: exchangeSettings.currencySettings,
});

export default withNamespaces()(connect(mapStateToProps)(CreateOrderFee));
