import React, { Component } from 'react';
import { connect } from 'react-redux';
import { numberParser } from 'utils';
import PropTypes from 'prop-types';
import { PrettyNumberTZ } from 'components/Helpers';
import { getRateList } from 'redux/selectors/markets';
import { convertCurrency } from 'utils';

class FiatConverter extends Component {
  format(value) {
    const { language, currencyCode } = this.props;

    // if (value === '0') {
    //   return;
    // }

    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(value);
  }

  parseValue(value) {
    return !isNaN(parseFloat(value)) ? value : numberParser.parse(value);
  }

  getCoinTrackerFiat() {
    const { market, lastPrice, currencyCode } = this.props;
    const value = convertCurrency(lastPrice, {
      from: market,
      to: currencyCode,
    });
    const formatted = this.format(value);

    return formatted ? formatted : '';
  }

  getWalletFiat() {
    const { currency, walletBalance, currencyCode } = this.props;
    const parsedValue = this.parseValue(walletBalance);
    const value = convertCurrency(parsedValue, {
      from: currency,
      to: currencyCode,
    });

    return value ? this.format(value) : this.format(0);
  }

  render() {
    const { isFiat, color, returnValue } = this.props;

    if (returnValue) {
      return isFiat ? this.getCoinTrackerFiat() : this.getWalletFiat();
    }

    return isFiat ? (
      <PrettyNumberTZ number={this.getCoinTrackerFiat()} color={color} />
    ) : (
      <PrettyNumberTZ number={this.getWalletFiat()} color={color} />
    );
  }
}

const mapStateToProps = state => {
  const {
    exchangeSettings: { currencyCode, language },
  } = state;
  return {
    rateList: getRateList(state),
    currencyCode,
    language,
  };
};

FiatConverter.propTypes = {
  currency: PropTypes.string,
  walletBalance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isFiat: PropTypes.bool,
  market: PropTypes.string,
  lastPrice: PropTypes.number,
  color: PropTypes.string,
};

export default connect(mapStateToProps)(FiatConverter);
