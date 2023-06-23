import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

const NavbarLink = ({ children }) => (
  <NavLink activeClassName="is-active" className="navbar-link">
    {children}
  </NavLink>
);

NavbarLink.propTypes = {
  children: PropTypes.node,
};

export default NavbarLink;
