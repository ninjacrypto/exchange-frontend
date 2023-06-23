import React, { useEffect, useState } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { withRouter, Route } from 'react-router-dom';
import _ from 'lodash';
import {
  Navbar,
  NavbarBrand,
  NavbarContainer,
  NavbarItem,
  NavbarMenu,
} from 'components/Navbar';
import { Mobile } from 'components/Responsive';
import { Box } from 'components/Wrapped';
import { AuthenticatedNav, PublicNav, NavCoinPicker } from 'containers/TopBar';
import { nestedTranslate } from 'utils';
import { Form, FormField, TextField } from 'components/Form';
import * as Yup from 'yup';
import { Button, Modal, Menu, Text } from 'components/Wrapped';
import { Tooltip } from 'components/Tooltip';
import { Services } from 'grommet-icons';
import { Settings } from 'containers/Settings';
import { TradingRequirements } from 'containers/TradingRequirements';


export const SettingsModal = () => {
  return (
    <Modal
      position="center"
      trigger={
        <Button
          icon={
            <Tooltip position="bottom" translation="settings">
              <Services size="medium" />
            </Tooltip>
          }
          plain
        ></Button>
      }
    >
      <Settings />
    </Modal>
  );
};

class TopBar extends React.Component {
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
      profile: { kycStatus, isMobileVerified, loginName },
    } = this.props;
    if (
      !_.isEqual(kycStatus.toLowerCase(), 'approved') ||
      !isMobileVerified ||
      _.isEqual(loginName, '')
    ) {
      this.setState({ p2pEligible: false, isOpen: true });
    }
  };

  render() {
    const {
      isAuthenticated,
      t: translate,
      logoUrl,
      enableInstaTrade,
      enableP2PTrading,
      enableSocialTrade,
      enableDSSO,
      mgokx,
      history,
      profile,
    } = this.props;
    const t = nestedTranslate(translate, 'navbar.links');
    const ts = nestedTranslate(translate, 'tables.offers');
    return (
      <Navbar>
        <Box
          pad="none"
          round={false}
          direction="row"
          fill={true}
          background="navbarBackground"
        >
          <NavbarBrand logo={logoUrl} />
          <NavbarMenu>
            <NavbarContainer>
              <NavbarItem
                to="/"
                exact
                // navIcon={require('assets/icons/market.svg')}
              >
                {t('home')}
              </NavbarItem>
              <NavbarItem
                to="/trade"
                // navIcon={require('assets/icons/bar-chart.svg')}
              >
                {t('trade')}
              </NavbarItem>
              {enableInstaTrade && (
                <NavbarItem
                  to="/insta-trade"
                  // navIcon={require('assets/icons/bar-chart.svg')}
                >
                  {t('instaTrade')}
                </NavbarItem>
              )}
              {enableSocialTrade && (
                <NavbarItem to="/social-trade">{t('socialTrade')}</NavbarItem>
              )}
              {/* {(_.isEqual(profile.kycStatus, 'Approved') && enableP2PTrading) && ( */}
              {enableP2PTrading && (
                <React.Fragment>
                  {!isAuthenticated && (
                    <NavbarItem to="/p2p">{t('p2pMenu.p2p')}</NavbarItem>
                  )}
                  {isAuthenticated && (
                    <Menu
                      label={<Text size="medium">{t('p2pMenu.p2p')}</Text>}
                      items={[
                        {
                          label: t('p2pMenu.offers'),
                          onClick: () => {
                            history.push(`/p2p/`);
                          },
                        },
                        {
                          label: t('p2pMenu.paymentSettings'),
                          onClick: () => {
                            this.tradingRequirements();
                            history.push(`/p2p/payment-settings`);
                          },
                        },
                        {
                          label: t('p2pMenu.postNewOffer'),
                          onClick: () => {
                            this.tradingRequirements();
                            history.push(`/p2p/post-offer`);
                          },
                        },
                        {
                          label: t('p2pMenu.MyOffers'),
                          onClick: () => {
                            this.tradingRequirements();
                            history.push(`/p2p/my-offers`);
                          },
                        },
                        {
                          label: t('p2pMenu.MyOrders'),
                          onClick: () => {
                            this.tradingRequirements();
                            history.push(`/p2p/my-orders`);
                          },
                        },
                        {
                          label: t('p2pMenu.p2pWallet'),
                          onClick: () => {
                            this.tradingRequirements();
                            history.push(`/p2p/p2p-wallet`);
                          },
                        },
                      ]}
                      size="small"
                    />
                  )}
                </React.Fragment>
              )}
            </NavbarContainer>
            <NavbarContainer position="end">
              <Mobile>
                <Route
                  path="/"
                  render={({ location }) =>
                    location.pathname.includes('/trade') && <NavCoinPicker />
                  }
                />
              </Mobile>

              {isAuthenticated ? (
                <AuthenticatedNav topNav={true} enableDSSO={enableDSSO} mgokx={mgokx} />
              ) : (
                <PublicNav />
              )}
              <SettingsModal />

              <TradingRequirements
                show={this.state.isOpen}
                p2pEligible={this.state.p2pEligible}
                handleSuccess={this.toggleModal}
              />
            </NavbarContainer>
          </NavbarMenu>
        </Box>
      </Navbar>
    );
  }
}

const mapStateToProps = ({ auth, exchangeSettings: { settings }, user }) => ({
  isAuthenticated: auth.isAuthenticated,
  logoUrl: settings.logoUrl,
  enableInstaTrade: settings.enableInstaTrade,
  enableP2PTrading: settings.enableP2PTrading,
  enableSocialTrade: settings.enableSocialTrade,
  enableDSSO: settings.enableDSSO,
  mgokx: settings.mgokx,
  profile: user.profile,
});

export default withRouter(withNamespaces()(connect(mapStateToProps)(TopBar)));
