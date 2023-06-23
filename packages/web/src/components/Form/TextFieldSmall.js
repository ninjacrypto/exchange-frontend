import React from 'react';
import { Field, ErrorMessage } from 'formik';
import { TextArea } from 'grommet';
import { Box, Text } from 'components/Wrapped';

const WrappedTextFieldSmall = ({
  name,
  placeholder,
  margin = { bottom: '0px' },
  ...rest
}) => (
  <Box pad="none" margin={margin}>
    <Field name={name}>
      {({ field: { value, onChange, onBlur }, form }) => (
        <React.Fragment>
          <input
            {...rest}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
          />
          <Text color="status-error" size="xsmall">
            <ErrorMessage name={name} />
          </Text>
        </React.Fragment>
      )}
    </Field>
  </Box>
);

export default WrappedTextFieldSmall;
