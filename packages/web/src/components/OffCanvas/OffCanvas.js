import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';
import PropTypes from 'prop-types';

import { toggleNavbarMenu } from 'redux/actions/ui';
import { TabletDown } from 'components/Responsive';

var styles = {
  bmBurgerButton: {
    display: 'none',
    position: 'fixed',
    width: '36px',
    height: '30px',
    left: '36px',
    top: '36px',
  },
  bmBurgerBars: {
    background: '#373a47',
  },
  bmCrossButton: {
    height: '24px',
    width: '24px',
  },
  bmCross: {
    background: '#bdc3c7',
  },
  bmMorphShape: {
    fill: '#373a47',
  },
  bmOverlay: {
    background: 'rgba(0, 0, 0, 0.3)',
  },
};

class OffCanvas extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
  };

  componentDidMount() {
    this.unlisten = this.props.history.listen(() => {
      this.props.toggleNavbarMenu(false);
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  // To keep in sync w/ ui reducer initiated from NavbarBrand
  isMenuOpen = (state) => {
    if (!state.isOpen) {
      this.props.toggleNavbarMenu(false);
    }
  };

  render() {
    const { isOpen, children } = this.props

    return (
      <TabletDown>
        <Menu styles={styles} isOpen={isOpen} onStateChange={this.isMenuOpen}>
          {children}
        </Menu>
      </TabletDown>
    );
  }
}

const mapStateToProps = ({ ui }) => ({
  isOpen: ui.isMobileMenuOpen,
});

export default withRouter(connect(
  mapStateToProps,
  { toggleNavbarMenu },
)(OffCanvas));
