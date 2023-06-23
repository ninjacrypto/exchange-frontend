import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Tabs = ({
  boxed,
  children,
  className,
  fullwidth,
  position,
  size,
  toggle,
}) => (
  <div
    className={classNames(
      'tabs',
      {
        [`is-boxed`]: !!boxed,
        [`is-fullwidth`]: !!fullwidth,
        [`is-${size}`]: !!size,
        [`is-${position}`]: !!position,
        [`is-toggle`]: !!toggle,
      },
      className,
    )}
  >
    <ul>{children}</ul>
  </div>
);

Tabs.propTypes = {
  boxed: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
  fullwidth: PropTypes.bool,
  position: PropTypes.oneOf(['left', 'right', 'center']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  toggle: PropTypes.bool,
};

export default Tabs;
