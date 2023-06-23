import React from 'react';
import { connect } from 'react-redux';

import { changeTheme } from 'redux/actions/ui';
import { Select } from 'components/Wrapped';

const ThemeToggler = ({ theme, changeTheme, themes }) => {
  const onChange = value => {
    changeTheme(value);
  };

  return (
    <Select
      options={themes}
      defaultValue={theme}
      valueKey="themeName"
      labelKey="themeName"
      onChange={onChange}
    />
  );
};

const mapStateToProps = ({ ui: { themeName, themes, theme } }) => ({
  themes,
  theme,
});

export default connect(
  mapStateToProps,
  { changeTheme },
)(ThemeToggler);
