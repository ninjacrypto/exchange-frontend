import React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'components/Wrapped';
import { formatNumberToPlaces } from 'utils';

const PrettyPercent = ({ value }) => {
  const isPositive = Math.sign(value) >= 0;
  // const upArrow = require('assets/icons/up-arrow.svg');
  // const downArrow = require('assets/icons/down-arrow.svg');

  return (
    <Text color={isPositive ? 'bidColor' : 'askColor'} size="inherit">
      {/* <img
        src={`${isPositive ? upArrow : downArrow}`}
        style={{ marginRight: 10 }}
        alt=""
      /> */}
      {`${isPositive ? '+' : ''}${formatNumberToPlaces(value, 2)}%`}
    </Text>
  );
};

PrettyPercent.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default PrettyPercent;
