import React, { Component } from 'react';
import { connect } from 'react-redux';
import Responsive from 'react-responsive';
import { triggerResize } from 'redux/actions/ui';

const BREAKPOINTS = {
  DESKTOP: 1024,
  TABLET_MIN: 768,
  TABLET_MAX: 1023,
  MOBILE: 767,
};

const Desktop = props => (
  <Responsive {...props} minWidth={BREAKPOINTS.DESKTOP} />
);

const Tablet = props => (
  <Responsive
    {...props}
    minWidth={BREAKPOINTS.TABLET_MIN}
    maxWidth={BREAKPOINTS.TABLET_MAX}
  />
);

const TabletDown = props => (
  <Responsive
    {...props}
    maxWidth={BREAKPOINTS.TABLET_MAX}
  />
);

const TabletUp = props => (
  <Responsive
    {...props}
    minWidth={BREAKPOINTS.TABLET_MIN}
  />
);

const Mobile = props => <Responsive {...props} maxWidth={BREAKPOINTS.MOBILE} />;
const Default = props => (
  <Responsive {...props} minWidth={BREAKPOINTS.TABLET_MIN} />
);

const isMobile = () => window.innerWidth <= BREAKPOINTS.MOBILE;
const isTablet = () =>
  BREAKPOINTS.TABLET_MIN <= window.innerWidth <= BREAKPOINTS.TABLET_MAX;
const isDesktop = () => window.innerWidth >= BREAKPOINTS.DESKTOP;

const withScreenResize = WrappedComponent => {
  class ScreenResize extends Component {
    constructor() {
      super();

      this.state = {
        breakpoints: {
          desktop: 1024,
          tablet_min: 768,
          tablet_max: 1023,
          mobile: 767,
        },
      };
    }

    componentDidMount() {
      window.addEventListener('resize', this.handleResize);
      this.handleResize();
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.handleResize);
    }

    handleResize = () => {
      const {
        desktop,
        tablet_min,
        tablet_max,
        mobile,
      } = this.state.breakpoints;

      this.props.triggerResize({
        isMobile: window.innerWidth <= mobile,
        isTablet: tablet_min <= window.innerWidth <= tablet_max,
        isDesktop: window.innerWidth >= desktop,
      });
    };

    render() {
      const { children } = this.props;
      return (
        <WrappedComponent breakpoints={this.state.breakpoints}>
          {children}
        </WrappedComponent>
      );
    }
  }

  return connect(
    mapStateToProps,
    { triggerResize },
  )(ScreenResize);
};

export { Desktop, Tablet, TabletDown, TabletUp, Mobile, Default, isMobile, isTablet, isDesktop };

const mapStateToProps = ({ ui }) => ({
  breakpoints: ui.breakpoints,
});

export default withScreenResize;
