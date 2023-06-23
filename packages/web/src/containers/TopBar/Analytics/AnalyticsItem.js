import React from 'react';
import { Box, Text } from 'components/Wrapped';

const AnalyticsItem = ({ data: { item = '---', name } }) => {
  return (
    <Box justify="center">
      <Text size="xsmall">{name}</Text>
      <Text textAlign="start">{item}</Text>
    </Box>
  );
};

export default AnalyticsItem;
