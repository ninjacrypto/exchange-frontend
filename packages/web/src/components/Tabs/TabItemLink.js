import React from 'react';
import { Route, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const TabItemLink = ({
  children,
  isActive,
  className,
  exact,
  to,
  ...props
}) => (
  <Route
    path={to}
    exact={exact}
    children={({ match }) => (
      <li className={classNames({ [isActive]: match }, className)}>
        <Link to={to} {...props}>
          {children}
        </Link>
      </li>
    )}
  />
);

TabItemLink.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  isActive: PropTypes.string.isRequired,
  exact: PropTypes.bool,
  to: PropTypes.string.isRequired,
};

TabItemLink.defaultProps = {
  exact: false,
};

export default TabItemLink;
