import React from 'react';
import { Field } from 'formik';

import { Select } from 'components/Wrapped';

const WrappedSelect = ({ name, options, valueKey, onSelect, ...rest }) => (
  <Field name={name}>
    {({ field, form }) => (
      <Select
        {...field}
        {...rest}
        options={options}
        defaultValue={
          options
            ? valueKey
              ? options.find(option => option[valueKey] === field.value)
              : field.value
            : ''
        }
        valueKey={valueKey}
        onChange={option => {
          if (onSelect) {
            onSelect(option);
          }
          form.setFieldValue(field.name, valueKey ? option[valueKey] : option);
        }}
        onBlur={field.onBlur}
      />
    )}
  </Field>
);

export default WrappedSelect;
