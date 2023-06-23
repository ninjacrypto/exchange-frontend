import React from 'react';
import { Field, ErrorMessage } from 'formik';
import { CheckBox } from 'grommet';

import { Box, Text } from 'components/Wrapped';

const WrappedCheckBox = ({ name, label }) => (
  <Box pad="small">
    <Field name={name}>
      {({ field: { value, onChange, onBlur }, form }) => (
        <React.Fragment>
          <CheckBox
            name={name}
            label={label}
            checked={value}
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

export default WrappedCheckBox;
