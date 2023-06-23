import React, { useEffect } from 'react';
import { TextArea } from 'grommet';
import PropTypes from 'prop-types';

const WrappedTextArea = ({
  children,
  onChange,
  placeholder,
  ...rest
}) => {
  const [value, setValue] = React.useState('');

//   useEffect(() => {
//     setChecked(checkedValue);
//   }, [checkedValue]);

  return (
    <TextArea
      {...rest}
      placeholder={placeholder}
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

WrappedTextArea.propTypes = {
  children: PropTypes.node,
  label: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  onChange: PropTypes.func,
};

export default WrappedTextArea;