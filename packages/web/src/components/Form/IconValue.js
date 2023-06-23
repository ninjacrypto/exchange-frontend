import React from 'react';
import { components } from 'react-select';

import { CryptoIcon } from 'components/CryptoIcon';
import { Box } from 'components/Wrapped';

const { SingleValue } = components;

const IconOption = ({ ...props }) => {
  const { value, label } = props.data;

  return (
    <SingleValue {...props}>
      <Box grow={true} pad="none" direction="row">
        {value && <CryptoIcon currency={value} />}
        {label}
      </Box>
    </SingleValue>
  );
};

export default IconOption;
