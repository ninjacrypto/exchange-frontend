import React from 'react';
import PropTypes from 'prop-types';

const NavbarContainer = ({ children, position }) => (
  <div className={`navbar-${position}`} style={{ alignItems: 'center' }}>
    {children}
  </div>
);

NavbarContainer.propTypes = {
  children: PropTypes.node,
  position: PropTypes.oneOf(['start', 'end']),
};

NavbarContainer.defaultProps = {
  position: 'start',
};

export default NavbarContainer;
