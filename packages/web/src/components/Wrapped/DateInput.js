import React, { useEffect } from 'react';
import { DateInput } from 'grommet';
import PropTypes from 'prop-types';

const WrappedDateInput = ({ children, onChange, ...rest }) => {
    const [value, setValue] = React.useState();
    useEffect(() => {
        setValue((new Date()).toISOString());
      }, [onChange]);
  return (
    <DateInput
      {...rest}
      format="yyyy-mm-dd"
      value={value}
      onChange={event => {
        onChange(event.value);
        setValue(event.value);
      }}
    />
  );
};

WrappedDateInput.propTypes = {
  children: PropTypes.node,
  label: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  onChange: PropTypes.func,
};

export default WrappedDateInput;
