import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Select } from 'components/Wrapped';

const MobileMenu = ({ menuItems, history }) => {
  const pathname = history.location.pathname;
  const defaultValue = _.find(menuItems, singleMenuItem => {
    if (singleMenuItem.to === pathname) {
      return singleMenuItem;
    } else if (
      !singleMenuItem.exact &&
      _.startsWith(pathname, singleMenuItem.to)
    ) {
      return singleMenuItem;
    }
  });

  return (
    <Select
      options={menuItems}
      defaultValue={defaultValue}
      valueKey="to"
      labelKey="children"
      onChange={({ to }) => history.push(to)}
      alignSelf="stretch"
    />
  );
};

MobileMenu.propTypes = {
  menuItems: PropTypes.array,
  history: PropTypes.object.isRequired,
};

export default withRouter(MobileMenu);
