import React, { useState, useEffect } from 'react';
import PhoneInput2 from 'react-phone-input-2';
import 'react-phone-input-2/lib/plain.css';
import { useField, useFormikContext, ErrorMessage } from 'formik';
import styled from 'styled-components';
import { edgeStyle } from 'grommet/utils';
import { colorStyle } from 'grommet-styles';
import { Box, Text } from 'components/Wrapped';

const StyledPhoneInputContainer = styled.div`
  ${props => colorStyle('color', 'text', props.theme)};

  .react-tel-input {
    display: flex;

    .form-control,
    .flag-dropdown,
    .country-list {
      border-radius: 4px;
      border-width: 1px;
      border-style: solid;
      ${props => colorStyle('border-color', 'border', props.theme)};
    }

    .form-control,
    .flag-dropdown {
      ${props =>
        props.hasError && colorStyle('border-color', 'askColor', props.theme)}
    }

    .form-control {
      flex: 1 0 auto;
    }

    .flag-dropdown {
      &.open {
        background: transparent;
        .selected-flag {
          background: transparent;
        }
      }
      .selected-flag {
        &:hover,
        &:focus {
          background: transparent;
        }
      }
    }

    .country-list {
      ${props => colorStyle('background', 'background-1', props.theme)};
      .country {
        &:hover,
        &.highlight {
          ${props => colorStyle('background', 'background-2', props.theme)};
        }
      }
    }
  }
`;

export const PhoneInput = ({
  name,
  countryFieldName,
  margin = { bottom: '20px' },
  countryCode,
  value
}) => {
  const [inputValue, setInputValue] = useState('');
  const [, meta, helpers] = useField(name);
  const { setFieldValue } = useFormikContext();
  const { error } = meta;

  useEffect(() => {
    setInputValue(value)
  }, []);

  const handleChange = (value, data) => {
    if (countryFieldName && data.countryCode) {
      setFieldValue(countryFieldName, data.countryCode);
    }
    setInputValue(value)
    countryCode(value);
    helpers.setValue(value.slice(data.dialCode.length));
  };

  return (
    <Box pad="none" margin={margin} flex={false}>
      <StyledPhoneInputContainer margin={margin} hasError={!!error}>
        <PhoneInput2
          country={'us'}
          name={name}
          value={inputValue}
          onChange={handleChange}
          inputStyle={{
            background: 'transparent',
            color: 'var(--defaultTextColor)',
          }}
        />
        {error && (
          <Box pad={{ horizontal: 'small' }} align="start">
            <Text color="status-error" size="xsmall">
              <ErrorMessage name={name} />
            </Text>
          </Box>
        )}
      </StyledPhoneInputContainer>
    </Box>
  );
};
