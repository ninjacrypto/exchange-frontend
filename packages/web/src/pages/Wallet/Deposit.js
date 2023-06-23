import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Box } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';

import {
  CryptoDeposit,
  FiatDepositManual,
  FiatDepositSelector,
} from 'pages/Wallet';
import { triggerToast } from 'redux/actions/ui';
import {
  generateDepositAddress,
  getDepositHistory,
} from 'redux/actions/portfolio';
import cx from 'classnames';
import styles from './Wallet.module.scss';
import WalletCurrencySelect from './WalletCurrencySelect';

const FIAT_MANUAL = 'Fiat-Manual';
const FIAT_PAYMENT_GATEWAY = 'Fiat-PG';
const FIAT_ACH = 'Fiat-ACH';

class Deposit extends React.Component {
  state = {
    selectedOption: { value: '', label: '' },
    currencyInfo: {},
  };

  onCurrencySelected = ({ selectedOption, currencyInfo }) => {
    this.setState({ selectedOption, currencyInfo });
    this.props.getDepositHistory(selectedOption.value, _.get(currencyInfo, 'walletType', selectedOption.value === `ALLC` ? 'Crypto' : 'Fiat'));
  };

  getDecimalPrecision() {
    const {
      currencyInfo: { decimalPrecision },
    } = this.state;

    return decimalPrecision < 8 ? decimalPrecision : 8;
  }

  renderDepositComponent() {
    const {
      selectedOption: { value: currency },
      currencyInfo,
    } = this.state;

    switch (currencyInfo.walletType) {
      case FIAT_MANUAL:
        return (
          <FiatDepositManual
            currency={currency}
            currencyInfo={currencyInfo}
            decimalPrecision={this.getDecimalPrecision()}
          />
        );
      case FIAT_PAYMENT_GATEWAY:
        return (
          <FiatDepositSelector
            currency={currency}
            currencyInfo={currencyInfo}
            decimalPrecision={this.getDecimalPrecision()}
          />
        );
      case FIAT_ACH:
        return (
          <FiatDepositSelector
            currency={currency}
            currencyInfo={currencyInfo}
            decimalPrecision={this.getDecimalPrecision()}
          />
        );
      default:
        return (
          <CryptoDeposit
            currency={currency}
            currencyInfo={currencyInfo}
            decimalPrecision={this.getDecimalPrecision()}
          />
        );
    }
  }

  render() {
    const {
      selectedOption: { value: currency },
    } = this.state;

    return (
      <Box
        background="background-3"
        pad="medium"
        className={cx(styles.boxContainer)}
        round={{ size: 'xxsmall', corner: 'bottom' }}
      >
        <WalletCurrencySelect
          redirectType="deposits"
          onCurrencySelected={this.onCurrencySelected}
        />

        {!_.startsWith(currency, 'ALL') && this.renderDepositComponent()}
      </Box>
    );
  }
}

const mapStateToProps = ({
  markets: { currencies },
  exchangeSettings: { currencySettings },
}) => ({
  currencies,
  currencySettings,
});

export default withRouter(
  withNamespaces()(
    connect(
      mapStateToProps,
      { generateDepositAddress, getDepositHistory, triggerToast },
    )(Deposit),
  ),
);
