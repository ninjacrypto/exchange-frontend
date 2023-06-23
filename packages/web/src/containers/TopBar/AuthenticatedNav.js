import React from 'react';
import { NavbarItem } from 'components/Navbar';
import { Link } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { Button, Text } from 'components/Wrapped';
import { ExternalLink } from 'components/Helpers';
import styles from './TopBar.module.scss';

const AuthenticatedNav = ({ topNav, t: translate, sideNav = false, enableDSSO, mgokx }) => {
  const t = nestedTranslate(translate, 'navbar.links');
  const buttonProps = sideNav ? { fill: 'horizontal', margin: { vertical: 'xsmall' } } : {};

  return (
    <React.Fragment>
      <ExternalLink href="https://stake.bytedex.io/" className={styles.externalLink}>
        {t('stake')}
      </ExternalLink>
        <ExternalLink href="https://bytepad.bytedex.io/" className={styles.externalLink}>
        {t('bytepad')}
      </ExternalLink>
      {enableDSSO && (
        <NavbarItem
          to="/derivatives"
        // navIcon={require('assets/icons/person.svg')}
        >
          {t('derivatives')}
        </NavbarItem>
      )}
      <NavbarItem
        to="/account"
      // navIcon={require('assets/icons/person.svg')}
      >
        {t('account')}
      </NavbarItem>
      <NavbarItem
        to="/orders"
      // navIcon={require('assets/icons/search.svg')}
      >
        {t('orders')}
      </NavbarItem>
      {/* {mgokx?.wallet_page && ( */}
        <NavbarItem
          to="/wallet"
        // navIcon={require('assets/icons/wallet.svg')}
        >
          {t('wallet')}
        </NavbarItem>
      {/* )} */}
      {mgokx?.enabled && (
        <NavbarItem
          to="/NDWallet"
        // navIcon={require('assets/icons/person.svg')}
        >
          {t('NDWallet')}
        </NavbarItem>
      )}
      {!!topNav && (
        <Link to="/logout">
          <Button color="primary" primary={false} margin={{ horizontal: 'small' }} {...buttonProps}>
            {t('logout')}
          </Button>
        </Link>
      )}
    </React.Fragment>
  );
};

export default withNamespaces()(AuthenticatedNav);
