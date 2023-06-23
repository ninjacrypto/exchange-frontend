import React from 'react';
import _ from 'lodash';
import { Grommet } from 'grommet';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createGlobalStyle } from 'styled-components';

import defaultThemes from 'assets/defaultThemes';

// This is how Grommet adds css variables to its root class
// https://github.com/grommet/grommet/blob/master/src/js/components/Grommet/StyledGrommet.js
// We want them globally (root scope), however. Some libraries place elements outside
// of the StyledGrommet scope and still need access to CSS Variables
const GlobalVariables = createGlobalStyle`
  :root {
    ${props =>
      Object.keys(props.theme.global.colors)
        .filter(k => typeof props.theme.global.colors[k] === 'string')
        .map(k => `--${k}: ${props.theme.global.colors[k]};`)
        .join('\n')}
  }
`;

class Theme extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  render() {
    const { theme, children } = this.props;
    const useTheme = _.isEmpty(theme) ? defaultThemes[0].theme : theme;

    return (
      <Grommet theme={useTheme}>
        <GlobalVariables />
        {children}
      </Grommet>
    );
  }
}

const mapStateToProps = ({ ui: { theme } }) => ({
  theme: theme.theme,
});

export default connect(mapStateToProps)(Theme);
