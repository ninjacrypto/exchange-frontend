import React from 'react';
import { components } from 'react-select';
import { CryptoIcon } from 'components/CryptoIcon';

const { Option } = components;

const IconOption = (innerProps, iconType) => {
  const props = { ...innerProps, iconType };

  // Todo: Figure out conditional icons

  return (
    <Option {...props}>
      {innerProps.data.value && <CryptoIcon currency={innerProps.data.value} />}
      {/* {innerProps.iconType === 'CryptoIcon' && <CryptoIcon currency={innerProps.data.value} />}
      {innerProps.iconType === 'FlagIcon' && <span className={`flag-icon flag-icon-${innerProps.data.label.toLowerCase()}`} />} */}
      {innerProps.data.label}
    </Option>
  );
};

export default IconOption;
