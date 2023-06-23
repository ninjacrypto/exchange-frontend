import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { withTheme } from 'styled-components';

const Logo = ({ logoUrl, exchangeName, className, navbar = false, navbarLogoUrl, theme }) => {
  const logoUrlOverride = _.get(theme, 'logoUrlOverride', logoUrl);
  const navbarLogoOverride = _.get(theme, 'navbarLogoOverride', navbarLogoUrl);

  return (
    <img src={navbar ? navbarLogoOverride : logoUrlOverride} alt={exchangeName} className={className} />
  )
};

const mapStateToProps = ({ exchangeSettings: { settings }, ui: { theme } }) => ({
  logoUrl: settings.logoUrl,
  navbarLogoUrl: settings.navbarLogoUrl,
  exchangeName: settings.exchangeName,
});

export default withTheme(connect(mapStateToProps)(Logo));
