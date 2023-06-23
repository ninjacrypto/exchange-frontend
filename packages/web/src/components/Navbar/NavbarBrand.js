import React from 'react';
import PropTypes from 'prop-types';
import { Link, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { toggleNavbarMenu } from 'redux/actions/ui';
import { Logo } from 'containers/Logo';
import { TabletDown } from 'components/Responsive';
import { NavCoinPicker } from 'containers/TopBar';
import styles from './Navbar.module.scss';

const NavbarBrand = ({ to, onClick, location }) => (
  <div className={classNames('navbar-brand', styles.navbarBrand)}>
    <Link className={classNames('navbar-item', styles.navbarLink, styles.navItem)} to={to}>
      <Logo navbar={true} />
    </Link>
    <TabletDown>
      <Route
        path="/trade"
        render={({ props }) =>
          location.pathname.includes('/trade') && (
            <NavCoinPicker {...props} navbarBrand />
          )
        }
      />
    </TabletDown>

    <div className={classNames('navbar-burger')} onClick={onClick}>
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </div>
  </div>
);

NavbarBrand.propTypes = {
  to: PropTypes.string,
  onClick: PropTypes.func,
};

NavbarBrand.defaultProps = {
  to: '/',
};

const mapDispatchToProps = {
  onClick: toggleNavbarMenu,
};

export default withRouter(
  connect(
    null,
    mapDispatchToProps,
  )(NavbarBrand),
);
