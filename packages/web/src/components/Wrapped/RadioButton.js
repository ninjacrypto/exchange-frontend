import React, { useEffect } from 'react';
import { RadioButton } from 'grommet';
import PropTypes from 'prop-types';

const WrappedRadioButton = ({
  children,
  onChange,
  label,
  checked: checkedValue,
  ...rest
}) => {
  const [checked, setChecked] = React.useState(checkedValue);

  useEffect(() => {
    setChecked(checkedValue);
  }, [checkedValue]);

  return (
    <RadioButton
      {...rest}
      checked={checked}
      isChecked={checked}
      label={label}
      onChange={event => {
        setChecked(event.target.checked);
        if (onChange) {
          onChange(event.target.checked);
        }
      }}
    />
  );
};

WrappedRadioButton.propTypes = {
  children: PropTypes.node,
  label: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  onChange: PropTypes.func,
};

export default WrappedRadioButton;