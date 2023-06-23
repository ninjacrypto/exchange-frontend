import React from 'react';
import { Form as FormikForm } from 'formik';
import { Box } from 'components/Wrapped';

export const Form = ({ children, autoComplete, ...rest }) => {
  return (
    <FormikForm autoComplete={autoComplete}>
      <Box pad="none" fill={true} {...rest}>
        {children}
      </Box>
    </FormikForm>
  );
};
