import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';

import { Select } from 'components/Wrapped';
import { setNumberFormat } from 'redux/actions/userSettings';

const NumberFormatToggler = ({ numberFormat, setNumberFormat, t }) => {
  const onChange = ({ value }) => {
    setNumberFormat(value);
  };

  const options = [
    { value: 'df', label: t('settings.numberFormatOptions.df') },
    { value: 'period', label: t('settings.numberFormatOptions.period') },
    { value: 'comma', label: t('settings.numberFormatOptions.comma') },
  ];

  const defaultValue = _.find(options, ['value', numberFormat]);

  return (
    <Select
      options={options}
      defaultValue={defaultValue}
      valueKey="value"
      labelKey="label"
      onChange={onChange}
    />
  );
};

const mapStateToProps = ({ userSettings: { numberFormat } }) => ({
  numberFormat,
});

export default withNamespaces()(
  connect(
    mapStateToProps,
    { setNumberFormat },
  )(NumberFormatToggler),
);
