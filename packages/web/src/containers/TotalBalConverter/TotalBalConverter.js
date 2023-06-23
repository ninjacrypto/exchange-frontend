import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { PrettyNumberTZ } from 'components/Helpers';
import { getRateList } from 'redux/selectors/markets';
import { convertCurrency } from 'utils';
import { formatNumberToPlaces, numberParser } from 'utils/numbers';

class TotalBalConverter extends Component {
  format(value) {
    const { language, currencyCode } = this.props;


    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(value);
  }

  calculateTotalFiat() {
    const { market, portfolios, currencyCode } = this.props;
    let totalType;

    return this.format(Object.values(portfolios).reduce(
      (total, { currency, totalBalance }) => {
        totalType = convertCurrency(totalBalance, {
          from: currency,
          to: currencyCode,
        });

        return total + totalType;
      },
      0,
    ),);
  }
  
  calculateTotalBTC() {
    const { market, portfolios, currencyCode } = this.props;
    let totalType;

    return formatNumberToPlaces(Object.values(portfolios).reduce(
      (total, { currency, totalBalance }) => {
        totalType = convertCurrency(totalBalance, {
          from: currency,
          to: 'BTC',
        });

        return total + totalType;
      },
      0,
    ),);
  }

  render() {
    const { isFiat, color, returnValue } = this.props;

    return isFiat ? (
      <PrettyNumberTZ number={this.calculateTotalFiat()} color={color} />
    ) : (
      <PrettyNumberTZ number={this.calculateTotalBTC()} color={color} />
    );
  }
}

const mapStateToProps = state => {
  const {
    exchangeSettings: { currencyCode, language },
    portfolio: { portfolios },
  } = state;
  return {
    rateList: getRateList(state),
    currencyCode,
    language,
    portfolios,
  };
};

TotalBalConverter.propTypes = {
  currency: PropTypes.string,
  walletBalance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isFiat: PropTypes.bool,
  market: PropTypes.string,
  lastPrice: PropTypes.number,
  color: PropTypes.string,
};

export default connect(mapStateToProps)(TotalBalConverter);
