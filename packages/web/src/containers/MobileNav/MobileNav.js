import React from 'react';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { AuthenticatedNav, PublicNav } from 'containers/TopBar';
import { NavbarItem } from 'components/Navbar';
import { OffCanvas } from 'components/OffCanvas';
import { Logo } from 'containers/Logo';
import { Menu, Text, Box, Button, Modal } from 'components/Wrapped';
import { MobileSubNav } from 'containers/MobileNav';
import { TradingRequirements } from 'containers/TradingRequirements';
import { nestedTranslate } from 'utils';
import _ from 'lodash';

class MobileNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      p2pEligible: true,
      isOpen: false,
    };
  }

  toggleModal = () => this.setState({ isOpen: !this.state.isOpen });

  tradingRequirements = () => {
    const {
      profile: { kycStatus, isMobileVerified },
    } = this.props;
    if (!_.isEqual(kycStatus.toLowerCase(), 'approved') || !isMobileVerified) {
      this.setState({ p2pEligible: false, isOpen: true });
    }
  };

  render() {
    const {
      enableInstaTrade,
      enableP2PTrading,
      enableSocialTrade,
      isAuthenticated,
      t,
      history,
      profile,
    } = this.props;
    const ts = nestedTranslate(t, 'tables.offers');

    return (
      <OffCanvas>
        <Box fill={true} pad="none" round={false}>
          <Box background="navbarBackground" fill={true} pad="large">
            <Logo />
            <NavbarItem to="/" exact>
              {t('navbar.links.home')}
            </NavbarItem>
            <NavbarItem to="/trade">{t('navbar.links.trade')}</NavbarItem>
            {enableInstaTrade && (
              <NavbarItem
                to="/insta-trade"
                // navIcon={require('assets/icons/bar-chart.svg')}
              >
                {t('navbar.links.instaTrade')}
              </NavbarItem>
            )}
            {enableP2PTrading && (
              <React.Fragment>
                {!isAuthenticated && (
                  <NavbarItem to="/p2p">
                    {t('navbar.links.p2pMenu.p2p')}
                  </NavbarItem>
                )}

                {isAuthenticated && (
                  <React.Fragment>
                    <MobileSubNav
                      subNavData={{
                        heading: t('navbar.links.p2pMenu.p2p'),
                        subs: [
                          {
                            heading: t('navbar.links.p2pMenu.offers'),
                            onClick: () => {
                              history.push(`/p2p/`);
                            },
                          },
                          {
                            heading: t('navbar.links.p2pMenu.paymentSettings'),
                            onClick: () => {
                              this.tradingRequirements();
                              history.push(`/p2p/payment-settings`);
                            },
                          },
                          {
                            heading: t('navbar.links.p2pMenu.postNewOffer'),
                            onClick: () => {
                              this.tradingRequirements();
                              history.push(`/p2p/post-offer`);
                            },
                          },
                          {
                            heading: t('navbar.links.p2pMenu.MyOffers'),
                            onClick: () => {
                              this.tradingRequirements();
                              history.push(`/p2p/my-offers`);
                            },
                          },
                          {
                            heading: t('navbar.links.p2pMenu.MyOrders'),
                            onClick: () => {
                              this.tradingRequirements();
                              history.push(`/p2p/my-orders`);
                            },
                          },
                          {
                            heading: t('navbar.links.p2pMenu.p2pWallet'),
                            onClick: () => {
                              this.tradingRequirements();
                              history.push(`/p2p/p2p-wallet`);
                            },
                          },
                        ],
                      }}
                    />
                  </React.Fragment>
                )}
              </React.Fragment>
            )}

            {enableSocialTrade && (
              <NavbarItem to="/social-trade">
                {t('navbar.links.socialTrade')}
              </NavbarItem>
            )}
            <NavbarItem to="/settings">{t('settings.title')}</NavbarItem>
            {isAuthenticated ? (
              <AuthenticatedNav topNav={true} sideNav={true} />
            ) : (
              <PublicNav sideNav={true} />
            )}
              <TradingRequirements
                show={this.state.isOpen}
                p2pEligible={this.state.p2pEligible}
                handleSuccess={this.toggleModal}
              />
          </Box>
        </Box>
      </OffCanvas>
    );
  }
}

const mapStateToProps = ({
  auth: { isAuthenticated },
  exchangeSettings: {
    settings: { enableInstaTrade, enableP2PTrading, enableSocialTrade },
  },
  user: { profile },
}) => ({
  isAuthenticated,
  enableInstaTrade,
  enableP2PTrading,
  enableSocialTrade,
  profile,
});

export default withRouter(
  withNamespaces()(withRouter(connect(mapStateToProps)(MobileNav))),
);
