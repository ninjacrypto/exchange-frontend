import React from 'react';
import { Select } from 'components/Wrapped';
import { connect } from 'react-redux';
import { changeFiat } from 'redux/actions/exchangeSettings';
import { getWalletTotal } from 'redux/actions/portfolio';

const FiatToggler = ({
  fiatList,
  currencyCode,
  changeFiat,
  getWalletTotal,
}) => {

  const onChange = value => {
    changeFiat(value);
    getWalletTotal();
  };

  return <Select options={fiatList} defaultValue={currencyCode} onChange={onChange} />;
};

const mapStateToProps = ({
  markets: {
    rateList: { fiat },
  },
  exchangeSettings: {
    currencyCode,
    settings: { fiatList },
  },
}) => ({
  currencyCode,
  fiat,
  fiatList,
});

export default connect(
  mapStateToProps,
  { changeFiat, getWalletTotal }
)(FiatToggler);
