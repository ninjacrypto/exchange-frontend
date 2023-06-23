import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { Text } from 'components/Wrapped';
import { formatNumberToPlaces, numberParser } from 'utils';

const StyledText = styled(Text)`
  font-size: inherit;
  line-height: inherit;
  font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
`;

export const LowContrast = styled(StyledText)`
  opacity: 0.6;
`;

const Wrapper = styled.span`
  ${props =>
    props.onClick &&
    css`
      :hover {
        font-weight: bold;
      }
    `};
`;

const numTrailingZeros = formattedNumber => {
  const zeros = formattedNumber.match(/[0]+$/g);

  return zeros ? zeros[0].length : 0;
};

const PrettyNumberTZ = ({
  number,
  color,
  precision,
  onClick,
  handleClickValues,
  addTrailing = false,
  ...rest
}) => {
  const props = {
    color,
    ...rest,
  };
  number = number.toString();

  if (precision) {
    number = formatNumberToPlaces(number, precision);
  }

  const wrapperProps = {};

  if (onClick) {
    wrapperProps.onClick = event =>
      onClick({ event, number, ...handleClickValues });
  }

  if (parseFloat(numberParser.parse(number)) === 0 || _.isUndefined(number)) {
    return <LowContrast {...props}>{number}</LowContrast>;
  }

  if (color === 'lowContrast') {
    return <LowContrast color={color}>{number}</LowContrast>;
  }

  const splitNumber = number.split('');
  let numTrailing = 0;
  let trailing;

  if (addTrailing) {
    numTrailing = numTrailingZeros(number);
    trailing = splitNumber.splice(splitNumber.length - numTrailing);
  }

  return (
    <Wrapper {...wrapperProps}>
      <StyledText {...props}>{splitNumber.join('')}</StyledText>
      <LowContrast {...props}>{trailing}</LowContrast>
    </Wrapper>
  );
};

PrettyNumberTZ.propTypes = {
  number: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.string,
  precision: PropTypes.number,
};

PrettyNumberTZ.defaultProps = {
  color: 'text',
};

export default PrettyNumberTZ;
