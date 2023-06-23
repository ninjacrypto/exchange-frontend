import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { PrettyNumberTZ } from 'components/Helpers';
import { getRateList } from 'redux/selectors/markets';
import { convertCurrency } from 'utils';
import { formatNumberToPlaces, numberParser } from 'utils/numbers';

class CurrencyConverter extends Component {

  convertToFiat() {
    const { from, to, amount } = this.props;
    const value = convertCurrency(amount, {
        from: from,
        to: to,
      });

    return formatNumberToPlaces(value, 2);
  }
  
  convertToCrypto() {
    const { from, to, amount } = this.props;
    const value = convertCurrency(amount, {
        from: from,
        to: to,
      });

    return formatNumberToPlaces(value, 8);
  }

  render() {
    const { isFiat, color } = this.props;

    return isFiat ? (
      <PrettyNumberTZ number={this.convertToFiat()} color={color} />
    ) : (
      <PrettyNumberTZ number={this.convertToCrypto()} color={color} />
    );
  }
}

const mapStateToProps = state => {
  const {
    exchangeSettings: { language },
  } = state;
  return {
    rateList: getRateList(state),
    language,
  };
};

CurrencyConverter.propTypes = {
  currency: PropTypes.string,
  walletBalance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isFiat: PropTypes.bool,
  market: PropTypes.string,
  lastPrice: PropTypes.number,
  color: PropTypes.string,
};

export default connect(mapStateToProps)(CurrencyConverter);
