import React from 'react';
import { Text as GrommetText } from 'grommet';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { colorStyle } from 'grommet-styles';

const TEXT_ALIGN_MAP = {
  center: 'center',
  end: 'right',
  start: 'left',
  justify: 'justify',
};

const textAlignStyle = css`
  text-align: ${props => TEXT_ALIGN_MAP[props.align]};
`;

const StyledText = styled(GrommetText)`
  ${props =>
    props.hoverColor &&
    css`
      :hover {
        ${colorStyle('color', props.hoverColor, props.theme)}
      }
    `}
  ${props => props.align && textAlignStyle}
`;

export const Text = ({ children, textAlign, ...rest }) => {
  return (
    <StyledText align={textAlign} {...rest}>
      {children}
    </StyledText>
  );
};

Text.propTypes = {
  children: PropTypes.node,
  size: PropTypes.string,
};

Text.defaultProps = {
  size: 'small',
};

export default Text;
