import React from 'react';
import { Field } from 'formik';
import styled, { css } from 'styled-components';

import { Box, Text } from 'components/Wrapped';

// #TODO Handle showing errors. Currently showing errors is handled by the child components, this can be changed.
const WrappedFormField = ({
  children,
  name,
  placeholder,
  label,
  className,
  labelProps,
  help,
  ...rest
}) => {
  return (
    <div className={className}>
      <Field name={name}>
        {({ field, form: { touched, errors } }) => (
          <Box pad="none" round={false} gap="xsmall">
            {label && (
              <Text size="small" weight="bold" {...labelProps}>
                {label}
              </Text>
            )}
            {help && <Text size="xsmall">{help}</Text>}
            {React.Children.map(children, child =>
              React.cloneElement(child, {
                persistentPlaceholder: false,
                ...field,
                name,
              }),
            )}
          </Box>
        )}
      </Field>
    </div>
  );
};

const StyledWrappedFormField = styled(WrappedFormField)`
  ${props => {
    return (
      props.hidden &&
      css`
        display: none !important;
      `
    );
  }};
`;

export default StyledWrappedFormField;
