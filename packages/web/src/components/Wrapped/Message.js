import React from 'react';
import PropTypes from 'prop-types';

import { Box, Text } from 'components/Wrapped';

const Message = ({ background, children, ...rest }) => (
  <Box background={background} {...rest}>
    <Text>{children}</Text>
  </Box>
)

Message.propTypes = {
  background: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default Message;

