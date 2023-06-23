import React from 'react';
import PropTypes from 'prop-types';
import { colors } from 'utils/bulmaHelpers';
import cx from 'classnames';

const Navbar = ({ children, color, className }) => (
  <nav className={cx(`navbar is-${color} ${className}`)}>{children}</nav>
);

Navbar.propTypes = {
  children: PropTypes.node,
  color: PropTypes.oneOf(colors),
  className: PropTypes.string,
};

export default Navbar;
