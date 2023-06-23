import React from 'react';
import { Paragraph } from 'grommet';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

const TEXT_ALIGN_MAP = {
  center: 'center',
  end: 'right',
  start: 'left',
  justify: 'justify',
};

const textAlignStyle = css`
  text-align: ${props => TEXT_ALIGN_MAP[props.align]};
`;

const StyledParagraph = styled(Paragraph)`
  ${props =>
    props.fill &&
    css`
      max-width: none;
    `}
  ${props => props.align && textAlignStyle}
`;

const WrappedParagraph = ({ children, textAlign, ...rest }) => (
  <StyledParagraph align={textAlign} {...rest}>
    {children}
  </StyledParagraph>
);

WrappedParagraph.propTypes = {
  children: PropTypes.node,
  size: PropTypes.string,
  fill: PropTypes.bool,
};

WrappedParagraph.defaultProps = {
  size: 'small',
  fill: true,
};

export default WrappedParagraph;
