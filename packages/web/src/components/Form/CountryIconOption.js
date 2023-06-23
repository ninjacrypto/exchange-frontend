import React from 'react';
import 'flag-icon-css/css/flag-icon.min.css';
import { components } from 'react-select';

const { Option } = components;

const CountryIconOption = innerProps => (
  <Option {...innerProps}>
    <span
      className={`m-r-md flag-icon flag-icon-${innerProps.data.value.toLowerCase()}`}
    />
    {innerProps.data.label}
  </Option>
);

export default CountryIconOption;
