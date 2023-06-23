import React from 'react';
import { Heading } from 'grommet';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

const StyledHeading = styled(Heading)`
  max-width: none;

  ${props =>
    props.fontWeight &&
    css`
      font-weight: ${props.fontWeight};
    `}

  ${props =>
    props.letterSpacing &&
    css`
      letter-spacing: ${props.letterSpacing};
    `}

${props =>
  props.textTransform &&
  css`
    text-transform: ${props.textTransform};
  `}
`;

const WrappedHeading = ({ children, ...rest }) => (
  <StyledHeading {...rest}>{children}</StyledHeading>
);

WrappedHeading.propTypes = {
  children: PropTypes.node,
  size: PropTypes.string,
  level: PropTypes.number,
  color: PropTypes.string,
  fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  letterSpacing: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  textTransform: PropTypes.oneOf(['uppercase', 'lowercase', 'capitalize']),
};

WrappedHeading.defaultProps = {
  size: 'small',
  level: 2,
  fontWeight: 600,
};

export default WrappedHeading;
