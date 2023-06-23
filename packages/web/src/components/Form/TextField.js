import React, { useState, useRef } from 'react';
import _ from 'lodash';
import { Field, ErrorMessage } from 'formik';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { colorStyle } from 'grommet-styles';

import { Box, Stack, Paragraph, Text, TextInput } from 'components/Wrapped';

export const PlaceHolder = styled(Box)`
  ${props =>
    props.hasFocus &&
    css`
      transform: scale(0.75) translateY(-90%);
      transform-origin: left;
    `} transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
`;

const TextField = styled(TextInput)`
  ${props =>
    props.hasFocus &&
    css`
      box-shadow: none;
      border-color: unset;
    `}

  ${props =>
    props.hasAddonStart &&
    css`
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    `}

    ${props =>
      props.hasAddonEnd &&
      css`
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      `}


  ${props =>
    props.hasErrors && colorStyle('border-color', 'askColor', props.theme)}
`;

const Addon = ({
  background = 'background-5',
  content = '',
  isEnd = false,
  ...rest
}) => (
  <Box
    tabIndex="-1"
    round={{ corner: isEnd ? 'right' : 'left', size: 'xxsmall' }}
    pad={{ horizontal: 'small' }}
    background={background}
    justify="center"
    flex="grow"
    {...rest}
  >
    {typeof content === 'string' ? <Paragraph>{content}</Paragraph> : content}
  </Box>
);

export const StlyedAddon = styled(Addon)`
  ${props =>
    props.onClick &&
    css`
      cursor: pointer;
    `};
`;

export const StyledTextInput = ({ addonStart, addonEnd, ...rest }) => {
  const [isFocused, setIsFocused] = useState(false);
  const searchInput = useRef(null);

function focus() {
  // Explicitly focus the text input using the raw DOM API
  // Note: we're accessing "current" to get the DOM node
  searchInput.current.focus();
}
  return (
    <Box direction="row" pad="none" round={false}>
      {addonStart && <StlyedAddon {...addonStart} />}
      <Box round={false} pad="none" fill={true}>
        <TextField
          ref={searchInput}
          focusIndicator={false}
          hasAddonStart={!_.isEmpty(addonStart)}
          hasAddonEnd={!_.isEmpty(addonEnd)}
          hasFocus={isFocused}
          onFocus={() => setIsFocused(true)}
          onBlur={e => {
            setIsFocused(false);
          }}
          {...rest}
        />
      </Box>
      {addonEnd && <StlyedAddon onClick={focus} {...addonEnd} isEnd={true} />}
    </Box>
  );
};

const WrappedTextInput = ({
  name,
  placeholder,
  type,
  persistentPlaceholder,
  addonStart,
  addonEnd,
  value,
  margin = { bottom: '20px' },
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Box pad="none" margin={margin} round={false}>
      <Field name={name}>
        {({ field, form: { handleBlur, touched, errors } }) => (
          <Box direction="row" pad="none" round={false}>
            {addonStart && <StlyedAddon {...addonStart} />}
            <Box round={false} pad="none" fill={true}>
              <Stack anchor="left" interactiveChild="first">
                <TextField
                  {...field}
                  {...rest}
                  type={type}
                  onFocus={() => setIsFocused(true)}
                  onBlur={e => {
                    handleBlur(e);
                    setIsFocused(false || !_.isEmpty(field.value));
                  }}
                  hasErrors={
                    _.get(touched, field.name) && _.get(errors, field.name)
                  }
                  hasFocus={isFocused}
                  focusIndicator={false}
                  hasAddonStart={!_.isEmpty(addonStart)}
                  hasAddonEnd={!_.isEmpty(addonEnd)}
                  placeholder={!persistentPlaceholder && placeholder}
                  value={value}
                />
                {persistentPlaceholder && (
                  <PlaceHolder
                    hasFocus={isFocused || field.value}
                    pad="xsmall"
                    margin={{ left: 'small' }}
                    round={false}
                    background="background-2"
                  >
                    <Text size="small">{placeholder}</Text>
                  </PlaceHolder>
                )}
              </Stack>
            </Box>
            {addonEnd && <StlyedAddon {...addonEnd} isEnd={true} />}
          </Box>
        )}
      </Field>
      <Box pad={{ horizontal: 'small' }} align="start">
        <Text color="status-error" size="xsmall">
          <ErrorMessage name={name} />
        </Text>
      </Box>
    </Box>
  );
};

WrappedTextInput.propTypes = {
  name: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string.isRequired,
  persistentPlaceholder: PropTypes.bool,
};

WrappedTextInput.defaultProps = {
  type: 'text',
  persistentPlaceholder: true,
};

export default WrappedTextInput;
