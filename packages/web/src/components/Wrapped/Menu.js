import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'grommet';

const WrappedMenu = ({ label, items, ...rest }) => (
  <Menu label={label} items={items} {...rest} />
);

WrappedMenu.propTypes = {
  items: PropTypes.array.isRequired,
};

WrappedMenu.defaultProps = {
  label: 'Menu',
};

export default WrappedMenu;
