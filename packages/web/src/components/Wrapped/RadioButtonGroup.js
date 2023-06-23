import React, { useEffect } from 'react';
import { RadioButtonGroup } from 'grommet';
import PropTypes from 'prop-types';

const WrappedRadioButtonGroup = ({
  children,
  onChange,
  label,
  value: selectedValue,
  options,
  direction,
  ...rest
}) => {
  const [value, setValue] = React.useState(selectedValue);

  useEffect(() => {
    setValue(selectedValue);
  }, [selectedValue]);

  return (
    <RadioButtonGroup
    {...rest}
      direction={direction ? direction : 'row'}
      gap="medium"
      label={label}
      options={options}
      value={value}
      onChange={event => {
        setValue(event.target.value);
        if (onChange) {
          onChange(event.target.value);
        }
        }}
    />
  );
};

WrappedRadioButtonGroup.propTypes = {
  children: PropTypes.node,
  label: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  onChange: PropTypes.func,
};

export default WrappedRadioButtonGroup;
