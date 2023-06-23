import React from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom';
import MarkdownContent from './MarkdownContent';


const CompanyContentRoute = ({ path, name, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      React.createElement(MarkdownContent, { ...props, name })
    )}
    />
)

CompanyContentRoute.propTypes = {
  componentProps: PropTypes.object,
};

export default withRouter(CompanyContentRoute);
