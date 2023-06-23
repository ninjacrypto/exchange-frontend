import React from 'react';
import { Field } from 'formik';
import styled, { css } from 'styled-components';

import { Box, Text } from 'components/Wrapped';
import { Link } from 'react-router-dom';

const ExtendedWrappedFormField = ({
    children,
    name,
    placeholder,
    label,
    labelAddonText,
    labelAddonLink,
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
                        {label && labelAddonText && labelAddonLink && (
                            <div style={{ display: 'flex' }}>
                                <Text size="small" weight="bold" {...labelProps} style={{ flex: 1 }}>
                                    {label}
                                </Text>
                                <Link to={{ pathname: labelAddonLink }} target="_blank" style={{ color: 'white' }}>
                                    <Text size="small" weight="bold">{labelAddonText}</Text>
                                </Link>
                            </div>
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

const StyledExtendedWrappedFormField = styled(ExtendedWrappedFormField)`
  ${props => {
        return (
            props.hidden &&
            css`
        display: none !important;
      `
        );
    }};
`;

export default StyledExtendedWrappedFormField;