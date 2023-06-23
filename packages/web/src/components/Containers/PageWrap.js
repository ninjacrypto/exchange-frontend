import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Box } from 'components/Wrapped'


const PageWrap = ({ children, className, paddingless, ...rest }) => (
  <Box
    background="background"
    pad={paddingless ? 'none' : 'medium'}
    round={false}
    flex={true}
    className={cx('is-fluid', className)}
    {...rest}
  >
    {children}
  </Box>
);

PageWrap.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  paddingless: PropTypes.bool,
};

PageWrap.defaultProps = {
  paddingless: false,
};

export default PageWrap;
