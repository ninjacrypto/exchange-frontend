import React from 'react';
import PropTypes from 'prop-types';
import { withTheme } from 'styled-components';

import { Box, Text } from 'components/Wrapped';

const ExchangeWidgetContainer = ({
  children,
  theme,
  hasHeading,
  title,
  gridArea,
}) => (
  <Box
    background="background-2"
    pad="none"
    className="has-full-height flex-column"
    elevation={theme.dark ? 'none' : 'xsmall'}
    gridArea={gridArea}
  >
    {hasHeading && (
      <Box
        pad={{ horizontal: 'small', top: 'small', bottom: 'xsmall' }}
        className="draggableHandle"
        background="background-4"
      >
        <Box
          pad="none"
          border={{ side: 'bottom', size: 'small', color: 'transparent' }}
        >
          <Text weight="bold">{title}</Text>
        </Box>
      </Box>
    )}
    <div
      style={{ flex: '1 1 auto', width: '100%', height: 1 }}
      className="is-flex flex-column react-virtualized-container-fix"
    >
      {children}
    </div>
  </Box>
);

ExchangeWidgetContainer.propTypes = {
  children: PropTypes.node,
  hasHeading: PropTypes.bool,
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
};

ExchangeWidgetContainer.defaultProps = {
  hasHeading: false,
};

export default withTheme(ExchangeWidgetContainer);
