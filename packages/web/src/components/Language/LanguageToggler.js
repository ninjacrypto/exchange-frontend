import React from 'react';
import { connect } from 'react-redux';

import { changeLanguage } from 'redux/actions/exchangeSettings';
import { Select } from 'components/Wrapped';

const Language = ({ fullLanguage, changeLanguage, languageList }) => {
  const onChange = value => {
    changeLanguage(value);
  };

  return (
    <Select
      options={languageList}
      defaultValue={fullLanguage}
      valueKey="code"
      labelKey="language"
      onChange={onChange}
    />
  );
};

const mapStateToProps = ({
  exchangeSettings: { fullLanguage, languageList },
}) => ({
  fullLanguage,
  languageList,
});

export default connect(
  mapStateToProps,
  { changeLanguage },
)(Language);
