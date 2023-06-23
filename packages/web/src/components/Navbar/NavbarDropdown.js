import React from 'react';
import PropTypes from 'prop-types';

const NavbarDropdown = ({ children }) => (
  <div className="navbar-dropdown">{children}</div>
);

NavbarDropdown.propTypes = {
  children: PropTypes.node,
};

export default NavbarDropdown;
