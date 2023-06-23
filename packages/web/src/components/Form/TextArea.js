import React from 'react';
import { Field, ErrorMessage } from 'formik';
import { TextArea } from 'grommet';
import { Box, Text } from 'components/Wrapped';

const WrappedTextArea = ({ name, placeholder, margin = { bottom: '20px' } }) => (
  <Box pad="none" margin={margin}>
    <Field name={name}>
      {({ field: { value, onChange, onBlur }, form }) => (
        <React.Fragment>
          <TextArea
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

export default WrappedTextArea;
