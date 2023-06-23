import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Box, Text } from 'components/Wrapped';

const TagWrapper = styled(Box)`
  border-radius: 4px;
  display: inline-flex;

  :not(:last-child) {
    margin-right: 0.5rem;
  }

  margin-bottom: 0.5rem;
`;

const Tag = ({ children, size, ...rest }) => (
  <TagWrapper {...rest} pad="xsmall" justify="center" align="center">
    <Text size={size}>{children}</Text>
  </TagWrapper>
);

Tag.Group = ({ children }) => (
  <Box direction="row" wrap={true} align="center" pad="xsmall">
    {children}
  </Box>
);

Tag.propTypes = {
  children: PropTypes.node.isRequired,
  background: PropTypes.string,
  size: PropTypes.string,
};

Tag.defaultProps = {
  background: 'background-3',
  size: '.75rem',
};

export default Tag;
