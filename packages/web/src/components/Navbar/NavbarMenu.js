import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';

const NavbarMenu = ({ children, isNavbarMenuOpen }) => (
  <div className={classNames('navbar-menu', { 'is-active': isNavbarMenuOpen })}>
    {children}
  </div>
);

NavbarMenu.propTypes = {
  children: PropTypes.node,
};

const mapStateToProps = ({ ui }) => ({
  isNavbarMenuOpen: ui.isNavbarMenuOpen,
});

export default connect(mapStateToProps)(NavbarMenu);
