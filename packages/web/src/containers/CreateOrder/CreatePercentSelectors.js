import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setAmount } from 'redux/actions/orders';
import { Box, Text } from 'components/Wrapped';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useFormikContext } from 'formik';

const ToolTipSlider = createSliderWithTooltip(Slider);

const CreatePercentSelectors = ({
  setAmount,
  side,
  marketOrder,
  tradingPair,
  portfolios,
  total,
  amount,
  lastPrice,
}) => {
  const { validateForm } = useFormikContext();
  const [selected, setSelected] = useState(0);
  const balance = _.get(
    portfolios,
    `${
      side === 'BUY' ? tradingPair.quoteCurrency : tradingPair.baseCurrency
    }.balance`,
    0,
  );
  const color = side === 'BUY' ? 'var(--bidColor)' : 'var(--askColor)';

  useEffect(() => {
    if (total && side === 'BUY') {
      setSelected((total / balance) * 100);
    }
  }, [total, side, balance]);

  useEffect(() => {
    if (amount && side === 'SELL') {
      setSelected((amount / balance) * 100);
    }
    if (amount && side === 'BUY' && marketOrder) {
      const total = lastPrice * amount;
      setSelected((total / balance) * 100);
    }
  }, [amount, lastPrice, balance, marketOrder, side]);

  const percentSelectorMark = value => {
    return (
      <Box
        key={value}
        background={value === selected ? 'background' : null}
        pad={{ horizontal: 'xsmall' }}
        onClick={() => {
          handleChange(value);
        }}
        round="medium"
        margin={{ vertical: 'xsmall', left: '4px' }}
        tabIndex={-1}
      >
        <Text
          size="10px"
          color={value === selected ? 'textStrong' : 'text'}
          fontFamily="alt"
        >
          {value}%
        </Text>
      </Box>
    );
  };

  const marks = {
    0: {
      label: percentSelectorMark(0),
    },
    25: {
      label: percentSelectorMark(25),
    },
    50: {
      label: percentSelectorMark(50),
    },
    75: {
      label: percentSelectorMark(75),
    },
    100: {
      label: percentSelectorMark(100),
    },
  };

  const percentFormatter = value => {
    return `${value}%`;
  };

  const handleChange = _.debounce(value => {
    setSelected(value);
    setAmount(side, value / 100, marketOrder);
    validateForm();
  }, 250);

  const handleDrag = value => {
    setSelected(value);
  };

  return (
    <Box
      pad={{ horizontal: 'small' }}
      gap="small"
      margin={{ top: 'small', bottom: '35px' }}
    >
      <ToolTipSlider
        min={0}
        max={100}
        marks={marks}
        value={selected}
        tipFormatter={percentFormatter}
        trackStyle={{ backgroundColor: color, height: 8 }}
        railStyle={{ backgroundColor: 'var(--background-1)', height: 8 }}
        dotStyle={{
          borderColor: color,
          backgroundColor: color,
          height: 12,
          width: 12,
          bottom: -6,
        }}
        handleStyle={{
          marginTop: -4,
          height: 16,
          width: 16,
          borderColor: 'var(--handleColor)',
          backgroundColor: 'var(--handleColor)',
        }}
        activeDotStyle={{
          backgroundColor: color,
          borderColor: 'var(--handleColor)',
        }}
        onChange={handleDrag}
        onAfterChange={handleChange}
        tabIndex={-1}
      />
    </Box>
  );
};

CreatePercentSelectors.propTypes = {
  setAmount: PropTypes.func.isRequired,
  side: PropTypes.string.isRequired,
  marketOrder: PropTypes.bool.isRequired,
};

CreatePercentSelectors.defaultProps = {
  marketOrder: false,
};

const mapStateToProps = ({
  portfolio,
  exchange: {
    tradingPair,
    tradingPairStats: { lastPrice },
  },
}) => ({
  tradingPair,
  portfolios: portfolio.portfolios,
  lastPrice,
});

export default connect(mapStateToProps, { setAmount })(CreatePercentSelectors);
