import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Box } from 'components/Wrapped';
import styled from 'styled-components';
import { colorStyle } from 'grommet-styles';

const NavLinkWrapper = styled(NavLink)`
  color: unset;
  margin-bottom: 5px;
  padding: 0.5em 0.75em;
  font-weight: normal;
  /* background-color: var(--background-3); */
  border-radius: 5px;

  &:hover,
  &.is-active {
    ${props => colorStyle('background', 'background-4', props.theme)}
  }
  &.is-active {
    ${props => colorStyle('border-color', 'primary', props.theme)}
    ${props =>
      colorStyle(
        'background',
        'background-2',
        props.theme,
      )}
    border-left-width: 5px;
    border-left-style: solid;
  }
`;

const WrappedSideMenu = ({ menuItems }) => (
  <Box as="ul" pad="none">
    {menuItems.map(({ children, to, exact, activeEvent }) => (
      <Box as="li" pad="none" key={to}>
        <NavLinkWrapper
          to={to}
          exact={exact}
          activeClassName="is-active"
          isActive={activeEvent}
        >
          {children}
        </NavLinkWrapper>
      </Box>
    ))}
  </Box>
);

WrappedSideMenu.propTypes = {
  menuItems: PropTypes.array.isRequired,
  children: PropTypes.node,
};

export default WrappedSideMenu;
