import React from 'react';
import _ from 'lodash';
import { Box } from 'grommet';
import PropTypes from 'prop-types';
import { withTheme } from 'styled-components';

import { normalizeColor } from 'utils/colors';

const WrappedBox = ({ children, background, theme, forwardRef, ...rest }) => {
  const gradient = _.get(background, 'gradient');
  if (gradient) {
    background.image = normalizeColor(gradient, theme);
  }

  return (
    <Box
      focusIndicator={false}
      {...rest}
      background={background}
      ref={forwardRef}
    >
      {children}
    </Box>
  );
};

WrappedBox.propTypes = {
  children: PropTypes.node,
  background: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  pad: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  round: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.object,
  ]),
  className: PropTypes.string,
};

WrappedBox.defaultProps = {
  round: 'xxsmall',
  pad: 'medium',
};

export default withTheme(WrappedBox);
