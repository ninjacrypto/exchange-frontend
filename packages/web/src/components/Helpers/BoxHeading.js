import React from 'react';
import PropTypes from 'prop-types';

import { Box, Heading } from 'components/Wrapped';

const BoxHeading = ({
  children,
  boxProps,
  headingProps,
  level,
  background,
}) => (
  <Box
    background={background}
    pad="none"
    round={{ size: 'xxsmall', corner: 'top' }}
    {...boxProps}
  >
    <Heading
      level={level}
      margin={{ vertical: 'small', left: 'medium' }}
      fontWeight={300}
      letterSpacing="1px"
      {...headingProps}
    >
      {children}
    </Heading>
  </Box>
);

BoxHeading.boxProps = {
  round: { corner: 'bottom', size: 'xxsmall' },
};

BoxHeading.propTypes = {
  children: PropTypes.node.isRequired,
  boxProps: PropTypes.object,
  headingProps: PropTypes.object,
  level: PropTypes.number,
  background: PropTypes.string,
};

BoxHeading.defaultProps = {
  level: 2,
  background: 'background-2',
};

export default BoxHeading;
