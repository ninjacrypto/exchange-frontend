import React, { useEffect } from 'react';
import { CheckBox } from 'grommet';
import PropTypes from 'prop-types';

const WrappedCheckBox = ({
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
    <CheckBox
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

WrappedCheckBox.propTypes = {
  children: PropTypes.node,
  label: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  onChange: PropTypes.func,
};

export default WrappedCheckBox;
