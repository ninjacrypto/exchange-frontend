import React, { Component, useEffect, useState } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  formatCrypto,
  formatNumberToPlaces,
  numberParser,
  trimNumber,
} from 'utils/numbers';
import { NumberInput, FormField, TextField } from 'components/Form';
import { Text } from 'components/Wrapped';
import { convertCurrency } from 'utils';

class CreateOrderField extends React.Component {
  state = {
    displayValue: '',
    isActive: false,
  };

  formatNumber(number) {
    const { precision } = this.props;

    return formatNumberToPlaces(number, precision);
  }

  setDisplayValue(value) {
    const number = _.isNumber(value) ? formatCrypto(value, true) : value;
    this.setState({
      displayValue: number,
    });
  }

  setFieldValue(name, value) {
    const { setFieldValue } = this.props.formProps;
    const number = _.isNumber(value) ? value : numberParser.parse(value);
    setFieldValue(name, number);
    if (this.props.name === name) {
      this.setDisplayValue(value);
    }
  }

  handleBlur = e => {
    const {
      target: { value },
    } = e;
    const { name } = this.props;
    const { handleBlur } = this.props.formProps;

    // Need to add this because MaskedInput does not send name through and formik needs it.
    e.target.name = name;

    handleBlur(e);

    // let formattedValue = this.formatNumber(value)
    //   ? this.formatNumber(value)
    //   : value;

    // formattedValue = numberParser.parse(formattedValue)
    this.setState({ isActive: false });
    // console.log('calc1', name, value);
    this.calculateFields(name, value, true);
  };

  calculateFields(name, value, isOnBlur) {
    const { values } = this.props.formProps;

    const {
      tradingPairSettings: { tradeAmountDecimals },
    } = this.props;

    const number = _.isNumber(value) ? value : numberParser.parse(value);

    if (_.has(values, 'total')) {
      if (name === 'rate') {
        const total = trimNumber(number * values.volume, 8);

        this.setFieldValue('total', formatNumberToPlaces(total, 8));
      } else if (name === 'volume') {
        const total = trimNumber(values.rate * number, 8);

        this.setFieldValue('total', formatNumberToPlaces(total, 8));
      } else if (name === 'total') {
        if (values.rate !== '0') {
          const volume = values.rate
            ? trimNumber(number / values.rate, tradeAmountDecimals)
            : 0;
          const total = values.rate ? trimNumber(volume * values.rate, 8) : 0;
          this.setFieldValue('volume', volume);
          if (isOnBlur) {
            value = total;
          }
        }
      }
    }

    this.setFieldValue(name, value);
  }

  handleChange = e => {
    const {
      target: { value },
    } = e;
    const { name } = this.props;

    e.target.name = name;

    const { handleChange } = this.props.formProps;

    handleChange(e);
    this.setState({ isActive: true });
    this.calculateFields(name, value);
  };

  handleKeyDown = ({ key }) => {
    const { name, formProps } = this.props;

    if (
      !formProps.values[name] &&
      _.includes(['.', numberParser.decimalSeparator], key)
    ) {
      formProps.setFieldValue(name, '0.');
      this.setDisplayValue(`0${numberParser.decimalSeparator}`);
    }
  };

  convertToFiat(from, to, amount) {
    const value = convertCurrency(amount, {
        from: from,
        to: to,
      });

    this.setFieldValue('volume', formatNumberToPlaces(value, 2));
  }
  
  convertToCrypto(from, to, amount) {
    const value = convertCurrency(amount, {
        from: from,
        to: to,
      });

    this.setFieldValue('volume', formatNumberToPlaces(value, 8));
  }

  componentDidUpdate(prevProps) {
    const { precision, marketCurrentMode, tradingPair } = this.props;

    if (this.props.marketCurrentMode !== prevProps.marketCurrentMode) {
      if (_.isEqual(marketCurrentMode, 'total')) {
        if (!_.isEmpty(this.props.formProps)) {
          const value = _.get(this.props.formProps, `values.volume`);
          this.convertToFiat(tradingPair.baseCurrency, tradingPair.quoteCurrency, value);
        }
      } else {
        if (!_.isEmpty(this.props.formProps)) {
          const value = _.get(this.props.formProps, `values.volume`);
          this.convertToCrypto(tradingPair.quoteCurrency, tradingPair.baseCurrency, value);
        }
      }
    }

    if (this.props.location.pathname !== prevProps.location.pathname) {
      if (!_.isEmpty(this.props.formProps)) {
        this.props.formProps.handleReset();
      }
    }

    if (
      !_.isEqual(this.props.numberFormat, prevProps.numberFormat) ||
      !_.isEqual(this.props.language, prevProps.language)
    ) {
      if (!_.isEmpty(this.props.formProps)) {
        const value = _.get(this.props.formProps, `values.${this.props.name}`);
        this.setFieldValue(this.props.name, parseFloat(value));
      }
    }

    if (
      !this.state.isActive &&
      !_.isEqual(
        _.get(this.props, `formProps.values.${this.props.name}`),
        _.get(prevProps, `formProps.values.${this.props.name}`),
      )
    ) {
      this.setDisplayValue(
        parseFloat(_.get(this.props, `formProps.values.${this.props.name}`)),
      );
    }

    if (!_.isEqual(this.props.percentAmount, prevProps.percentAmount)) {
      if (!_.isEmpty(this.props.formProps)) {
        const { type } = this.props.formProps.initialValues;
        const {
          percentAmount: { buyValue, sellValue, value, totalValue },
          tradingPairSettings: { tradeAmountDecimals },
          name,
          side,
        } = this.props;
        // console.log('----------',  buyValue, sellValue, value, totalValue);
        if (side === 'ALL' && name === 'volume') {
          this.calculateFields('volume', formatNumberToPlaces(value, 8));
        }

        if (
          side === 'BUY' &&
          name === 'total' &&
          type !== 'MARKET' &&
          totalValue >= 0
        ) {
          this.calculateFields('total', formatNumberToPlaces(totalValue, 8));
        }

        //* BUY case for MARKET since we're setting volume not total
        if (
          side === 'BUY' &&
          name === 'volume' &&
          type === 'MARKET' &&
          _.isEqual(marketCurrentMode, 'volume') &&
          buyValue >= 0
        ) {
          this.calculateFields(
            'volume',
            formatNumberToPlaces(buyValue, tradeAmountDecimals),
          );
        }

        if (
          side === 'BUY' &&
          name === 'volume' &&
          type === 'MARKET' &&
          _.isEqual(marketCurrentMode, 'total') &&
          totalValue >= 0
        ) {
          this.calculateFields(
            'volume',
            formatNumberToPlaces(totalValue, 8),
          );
        }

        if (side === 'SELL' && name === 'volume' && sellValue >= 0) {
          this.calculateFields(
            'volume',
            formatNumberToPlaces(sellValue, tradeAmountDecimals),
          );
        }
      }
    }

    if (!_.isEqual(this.props.orderBookSelected, prevProps.orderBookSelected)) {
      const { name, orderBookSelected } = this.props;

      const newValue = orderBookSelected[name];

      if (_.has(orderBookSelected, name) && prevProps.value !== newValue) {
        this.props.formProps.values.rate = this.props.orderBookSelected.rate;
        const { values } = this.props.formProps;
        let base_balance = 0;
        let quote_balance = 0;
        // side
        // curr
        // market
        // portfolio balance => curr_balance, market_balance
        if (Object.keys(this.props.portfolios).length !== 0) {
          base_balance = this.props.portfolios[
            this.props.tradingPair.baseCurrency
          ].balance;
          quote_balance = this.props.portfolios[
            this.props.tradingPair.quoteCurrency
          ].balance;
        }
        const side = this.props.side;
        // const basecurrency = this.props.tradingPair.baseCurrency;
        // const quotecurrency = this.props.tradingPair.quoteCurrency;

        // const balance = _.get(
        //   portfolios,
        //   `${
        //     side === 'BUY' ? tradingPair.quoteCurrency : tradingPair.baseCurrency
        //   }.balance`,
        //   0,
        // );
        this.setFieldValue(name, parseFloat(newValue));

        if (_.has(this.props.formProps.values, 'stop')) {
          this.setFieldValue('stop', 0);
        }

        if (_.has(values, 'total')) {
          const { rate, volume } = orderBookSelected;
          let total;
          let balance = quote_balance;
          let fvolume = 0;
          if (side === 'SELL') {
            balance = base_balance;
          }
          if (volume) {
            // case when clicked on size
            total = rate * volume;
            fvolume = volume;
          } else {
            // case when clicked on price
            total = rate * values.volume;
            fvolume = values.volume;
          }
          // console.log('balance:', balance, ' side:', side, ' rate:', rate, ' total', total)
          if (total > balance && side === 'BUY') {
            total = balance;
            let newVol = total / rate;
            this.setFieldValue(
              'volume',
              formatNumberToPlaces(newVol, precision),
            );
            // console.log('buy case volume', fvolume);
          }
          if (fvolume > balance && side === 'SELL') {
            fvolume = balance;
            total = fvolume * rate;
            this.setFieldValue(
              'volume',
              formatNumberToPlaces(fvolume, precision),
            );
            //  console.log('sell case volume', fvolume);
          }
          // console.log('total',total ,'value.total', values.total);
          if (total !== values.total) {
            this.setFieldValue('total', formatNumberToPlaces(total, 8));
            //console.log('total3', total);
          }
        }
      }
    }
  }

  render() {
    const {
      label,
      name,
      currency = '---',
      precision,
      value,
      showErrors = false,
      formType,
      // currencyType = 'baseCurrency',
      addonStartDrop,
    } = this.props;

    return (
      <React.Fragment>
        <FormField name={name}>
          {!value ? (
            <NumberInput
              onBlur={this.handleBlur}
              inputOnChange={this.handleChange}
              name={name}
              textAlign="end"
              addonEnd={{
                content: (
                  <Text size="xsmall" textAlign="end">
                    {currency}
                  </Text>
                ),
                background: 'background-3',
                pad: { horizontal: 'xsmall' },
                width: '75px',
              }}
              addonStart={{
                content: (
                  <React.Fragment>
                    {!_.isEqual(formType, 'MARKET') && (
                      <Text size="xsmall" textAlign="start">
                        {label}
                      </Text>
                    )}
                    {_.isEqual(formType, 'MARKET') && (
                      <React.Fragment>{addonStartDrop}</React.Fragment>
                    )}
                  </React.Fragment>
                ),
                background: 'background-3',
                pad: { horizontal: 'xsmall' },
              }}
              precision={precision}
              showErrors={showErrors}
              size="xsmall"
              background="background-3"
              autocomplete="off"
              type="number"
              margin="none"
              pad="xsmall"
            />
          ) : (
            <TextField
              placeholder={value}
              compact={true}
              textAlign="end"
              addonEnd={{
                content: (
                  <Text size="xsmall" textAlign="end">
                    {currency}
                  </Text>
                ),
                background: 'background-3',
                textSize: 'xsmall',
              }}
              addonStart={{
                content: (
                  <Text size="xsmall" textAlign="start">
                    {label}
                  </Text>
                ),
                background: 'background-3',
                pad: { horizontal: 'xsmall' },
                width: '75px',
              }}
              size="xsmall"
              disabled={true}
              margin="none"
              background="background-3"
              pad="xsmall"
            />
          )}
        </FormField>
      </React.Fragment>
    );
  }
}

CreateOrderField.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  fieldStyles: PropTypes.string,
  currency: PropTypes.string,
  value: PropTypes.any,
  precision: PropTypes.number,
};

CreateOrderField.defaultProps = {
  value: null,
  precision: 8,
};

const mapStateToProps = state => ({
  language: state.exchangeSettings.language,
  numberFormat: state.userSettings.numberFormat,
  orderBookSelected: state.exchange.orderBookSelected,
  percentAmount: state.orders.percentAmount,
  tradingPairSettings: state.exchange.tradingPairSettings,
  portfolios: state.portfolio.portfolios,
  tradingPair: state.exchange.tradingPair,
});

export default withRouter(connect(mapStateToProps)(CreateOrderField));
