import React from 'react';
import PropTypes from 'prop-types';

import { Flex, Box } from 'reflexbox/styled-components';

export const Columns = ({ children, wrap = 'wrap' }) => {
  return <Flex flexWrap={wrap}>{children}</Flex>;
};

export const Column = ({ children, gap, width, ...rest }) => {
  return (
    <Box p={gap} width={width} {...rest}>
      {children}
    </Box>
  );
};

Column.propTypes = {
  gap: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.array,
};

Column.defaultProps = {
  gap: 2,
  width: [1, 1],
};
