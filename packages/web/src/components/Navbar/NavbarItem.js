import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import styles from './Navbar.module.scss';
import { Text } from 'components/Wrapped';

const NavbarItem = ({ children, exact, hasDropdown, to, navIcon }) => {
  const classes = classNames(
    'navbar-item',
    { 'has-dropdown': hasDropdown },
    { [`${styles.navbarLink}`]: !!to },
    styles.navItem,
  );

  return to ? (
    <NavLink
      to={to}
      activeClassName={styles.isActive}
      className={classes}
      exact={exact}
    >
      <Text size="medium">
        {navIcon && <img src={navIcon} className={styles.navIcon} alt="" />}
        {children}
      </Text>
    </NavLink>
  ) : (
    <div className={classes}>{children}</div>
  );
};

NavbarItem.propTypes = {
  children: PropTypes.node,
  hasDropdown: PropTypes.bool,
  to: PropTypes.string,
  navIcon: PropTypes.string,
};

NavbarItem.defaultProps = {
  exact: false,
  hasDropdown: false,
};

export default NavbarItem;
