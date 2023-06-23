import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';

import { Box, Tag, Paragraph } from 'components/Wrapped';
import {
  getWithdrawalHistory,
  withdrawalRequest,
} from 'redux/actions/portfolio';
import styles from './Wallet.module.scss';
import {
  formatNumberToPlaces,
  trimNumber,
  subtract,
  multiply,
  divide,
  add,
} from 'utils';
import { nestedTranslate } from 'utils/strings';
import { withNamespaces } from 'react-i18next';
import { WalletCurrencySelect } from 'pages/Wallet';
import {
  AeraPassWithdrawal,
  CryptoWithdrawal,
  FiatWithdrawalManual,
  FiatWithdrawalSelector,
} from 'pages/Wallet';
import { Requires2FA } from 'containers/Requires2FA';
import { WithdrawalLimit } from 'containers/WithdrawalLimit';
import { ConditionalWrapper } from 'components/Helpers';

const FIAT_MANUAL = 'Fiat-Manual';
const FIAT_PAYMENT_GATEWAY = 'Fiat-PG';
const FIAT_ACH = 'Fiat-ACH';
const FIXED = 'Fixed';
const PERCENTAGE = 'Percentage';
const BOTH = 'Fixed + Percentage';

class Withdrawals extends Component {
  state = {
    selectedOption: { value: '', label: '' },
    currencyInfo: {},
  };

  onCurrencySelected = ({ selectedOption, currencyInfo }) => {
    this.setState({ selectedOption, currencyInfo });
    this.props.getWithdrawalHistory(selectedOption.value);
  };

  getBalance() {
    const {
      selectedOption: { value: currency },
    } = this.state;
    const { portfolios } = this.props;
    const decimalPrecision = this.getDecimalPrecision();

    let balance = _.get(portfolios, `${currency}.balance`, 0);
    let balanceInTrade = _.get(portfolios, `${currency}.balanceInTrade`, 0);
    let totalBalance = _.get(portfolios, `${currency}.totalBalance`, 0);

    balance = trimNumber(balance, decimalPrecision);
    balanceInTrade = trimNumber(balanceInTrade, decimalPrecision);
    totalBalance = trimNumber(totalBalance, decimalPrecision);

    return {
      balance,
      balanceInTrade,
      totalBalance,
    };
  }

  isFiat() {
    const { currencyInfo } = this.state;
    const walletType = _.get(currencyInfo, 'walletType');

    return walletType ? _.includes(walletType, 'Fiat') : false;
  }

  // renderWithdrawalComponent() {
  //   const {
  //     selectedOption: { value: currency },
  //     currencyInfo,
  //   } = this.state;

  //   const { aeraPassEnabled } = this.props;

  //   if (aeraPassEnabled) {
  //     return (
  //       <AeraPassWithdrawal
  //         calculateServiceCharge={this.calculateServiceCharge}
  //         currency={currency}
  //         currencyInfo={currencyInfo}
  //         decimalPrecision={this.getDecimalPrecision()}
  //       />
  //     );
  //   }

  //   switch (_.get(currencyInfo, 'walletType')) {
  //     case FIAT_MANUAL:
  //     case FIAT_PAYMENT_GATEWAY:
  //       return (
  //         <FiatWithdrawalManual
  //           calculateServiceCharge={this.calculateServiceCharge}
  //           currency={currency}
  //           currencyInfo={currencyInfo}
  //           balanceInfo={this.getBalance()}
  //           decimalPrecision={this.getDecimalPrecision()}
  //         />
  //       );
  //     default:
  //       return (
  //         <CryptoWithdrawal
  //           calculateServiceCharge={this.calculateServiceCharge}
  //           currency={currency}
  //           currencyInfo={currencyInfo}
  //           balanceInfo={this.getBalance()}
  //           decimalPrecision={this.getDecimalPrecision()}
  //         />
  //       );
  //   }
  // }

  // renderWithdrawalServiceCharge() {
  //   const {
  //     currencyInfo,
  //     selectedOption: { value: currency },
  //   } = this.state;
  //   const withdrawalServiceChargeType = _.get(
  //     currencyInfo,
  //     'withdrawalServiceChargeType',
  //   );
  //   const withdrawalServiceCharge = formatNumberToPlaces(
  //     _.get(currencyInfo, 'withdrawalServiceCharge'),
  //   );

  //   switch (withdrawalServiceChargeType) {
  //     case FIXED:
  //       return `${withdrawalServiceCharge} ${currency}`;
  //     case PERCENTAGE:
  //       return `${withdrawalServiceCharge}%`;
  //     default:
  //       return '';
  //   }
  // }

  calculateServiceCharge = (balance, withdrawalAmount) => {
    if (withdrawalAmount) {
      withdrawalAmount = parseFloat(withdrawalAmount);

      const { currencyInfo } = this.state;
      const decimalPrecision = this.getDecimalPrecision();
      const withdrawalServiceChargeType = _.get(
        currencyInfo,
        'withdrawalServiceChargeType',
      );

      const withdrawalServiceChargeFixed = _.get(
        currencyInfo,
        'withdrawalServiceChargeFixed',
      );

      const withdrawalServiceChargePercentage = _.get(
        currencyInfo,
        'withdrawalServiceChargePercentage',
      );
      const formatter = value => trimNumber(value, decimalPrecision);

      switch (withdrawalServiceChargeType) {
        case FIXED:
          return {
            serviceCharge: withdrawalServiceChargeFixed,
            willReceive: withdrawalAmount,
            balanceAfter: formatter(subtract(subtract(balance, withdrawalAmount), withdrawalServiceChargeFixed)),
          };
        case PERCENTAGE:
          const serviceCharge = ((withdrawalAmount * withdrawalServiceChargePercentage) / 100);
          return {
            serviceCharge,
            willReceive : withdrawalAmount,
            balanceAfter: formatter(subtract(balance, withdrawalAmount + serviceCharge)),
          };
        case BOTH:
          const serviceChargePercentage =  ((withdrawalAmount * withdrawalServiceChargePercentage) / 100) + withdrawalServiceChargeFixed;

          return {
            serviceCharge: serviceChargePercentage,
            willReceive: withdrawalAmount,
            balanceAfter: formatter(
              (subtract(subtract(balance, withdrawalAmount), serviceChargePercentage))
            ),
          };
        default:
          return { serviceCharge: 0, balanceAfter: 0 };
      }
    } else {
      return { serviceCharge: 0, balanceAfter: balance, willReceive: 0 };
    }
  };

  getDecimalPrecision() {
    const {
      currencyInfo: { decimalPrecision },
    } = this.state;

    return decimalPrecision < 8 ? decimalPrecision : 8;
  }

  renderWithdrawalArea() {
    const {
      selectedOption: { value: currency },
    } = this.state;

    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'wallet.withdrawals');

    return (
      // <ConditionalWrapper
      //   wrapper={<Requires2FA />}
      //   enableWrapper={}
      // >
      //   <React.Fragment>
      //     {this.renderWithdrawalComponent()}
      //   </React.Fragment>
      // </ConditionalWrapper>
      <React.Fragment>{this.renderWithdrawalComponent()}</React.Fragment>
    );
  }

  renderWithdrawalComponent() {
    const {
      selectedOption: { value: currency },
      currencyInfo,
    } = this.state;

    const { aeraPassEnabled } = this.props;

    if (aeraPassEnabled) {
      return (
        <AeraPassWithdrawal
          calculateServiceCharge={this.calculateServiceCharge}
          currency={currency}
          currencyInfo={currencyInfo}
          decimalPrecision={this.getDecimalPrecision()}
        />
      );
    }

    switch (_.get(currencyInfo, 'walletType')) {
      case FIAT_MANUAL:
      // return (
      //   <FiatWithdrawalManual
      //     calculateServiceCharge={this.calculateServiceCharge}
      //     currency={currency}
      //     currencyInfo={currencyInfo}
      //     balanceInfo={this.getBalance()}
      //     decimalPrecision={this.getDecimalPrecision()}
      //   />
      // );
      case FIAT_PAYMENT_GATEWAY:
        return (
          <FiatWithdrawalSelector
            calculateServiceCharge={this.calculateServiceCharge}
            currency={currency}
            currencyInfo={currencyInfo}
            balanceInfo={this.getBalance()}
            decimalPrecision={this.getDecimalPrecision()}
          />
        );
      case FIAT_ACH:
        return (
          <FiatWithdrawalSelector
            calculateServiceCharge={this.calculateServiceCharge}
            currency={currency}
            currencyInfo={currencyInfo}
            balanceInfo={this.getBalance()}
            decimalPrecision={this.getDecimalPrecision()}
          />
        );
      default:
        return (
          <CryptoWithdrawal
            calculateServiceCharge={this.calculateServiceCharge}
            currency={currency}
            currencyInfo={currencyInfo}
            balanceInfo={this.getBalance()}
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
      <React.Fragment>
        <Box
          background="background-3"
          pad="medium"
          className={cx(styles.boxContainer)}
          round={{ size: 'xxsmall', corner: 'bottom' }}
        >
          <WithdrawalLimit background="background-3" type="progress" />
          <WalletCurrencySelect
            redirectType="withdrawals"
            onCurrencySelected={this.onCurrencySelected}
          />

          {!_.startsWith(currency, 'ALL') && this.renderWithdrawalArea()}
        </Box>
      </React.Fragment>
    );
  }
}

export const WithdrawalHeadingValue = ({ heading, value }) => (
  <p>
    {`${heading}: `}
    <strong>{value}</strong>
  </p>
);

const mapStateToProps = ({
  markets,
  portfolio,
  exchangeSettings: {
    settings: { aeraPassEnabled },
  },
}) => ({
  coins: markets.currencies,
  addresses: portfolio.addresses,
  portfolios: portfolio.portfolios,
  aeraPassEnabled,
});

export default withRouter(
  withNamespaces()(
    connect(mapStateToProps, { getWithdrawalHistory, withdrawalRequest })(
      Withdrawals,
    ),
  ),
);
