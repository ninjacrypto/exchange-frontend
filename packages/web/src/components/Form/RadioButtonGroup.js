import React from 'react';
import { Field, ErrorMessage } from 'formik';
import { RadioButtonGroup } from 'grommet';

import { Box, Text } from 'components/Wrapped';

const WrappedRadioButtonGroup = ({ name, label, options }) => (
  <Box pad="none">
    <Field name={name}>
      {({ field: { value, onChange, onBlur }, form }) => (
        <React.Fragment>
          <RadioButtonGroup
            direction="row"
            gap="medium"
            name={name}
            label={label}
            options={options}
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

export default WrappedRadioButtonGroup;
