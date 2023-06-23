import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Field, ErrorMessage } from 'formik';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

import { Box, Text, MaskedInput, Paragraph } from 'components/Wrapped';
// import { StlyedAddon } from 'components/Form/TextField';
import { numberParser, formatNumberToPlaces } from 'utils';
import { colorStyle } from 'grommet-styles';

const TextField = styled(MaskedInput)`
${props =>
  props.background &&
  colorStyle('background-color', props.background, props.theme)}
${props =>
  props.background && colorStyle('border-color', props.background, props.theme)}
${props =>
  props.hasFocus &&
  css`
    box-shadow: none;
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
      props.hasAddonMiddle &&
      css`
        border-radius: 0;
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
    // background={background}
    border={{ color: 'border-1', size: 'xsmall', side: 'horizontal' }}
    round={false}
    justify="center"
    flex="grow"
    {...rest}
  >
    {typeof content === 'string' ? <Paragraph>{content}</Paragraph> : content}
  </Box>
);

const Addond = ({
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

export const StlyedAddon = styled(Addond)`
  ${props =>
    props.onClick &&
    css`
      cursor: pointer;
    `};
`;

// const Addond = ({
//   background = 'background-5',
//   content = '',
//   isEnd = false,
//   ...rest
// }) => (
//   <Box
//     tabIndex="-1"
//     round={{ corner: isEnd ? 'right' : 'left', size: 'xxsmall' }}
//     pad={{ horizontal: 'small' }}
//     justify="center"
//     flex="grow"
//     style={{backgroundColor: '#ffffff', border: '1px solid #e6e8ea', color: '#f0b90b'}}
//     {...rest}
//   >
//     {typeof content === 'string' ? <Paragraph>{content}</Paragraph> : content}
//   </Box>
// );

//     export const StlyedAddon = styled(Addond)`
//     ${props =>
//       props.onClick &&
//       css`
//         cursor: pointer;
//       `};
//   `;

export const StlyedAddonText = styled(Addon)`
  ${props =>
    props.onClick &&
    css`
      cursor: pointer;
    `};
`;

const WrappedNumberInput = ({
  name,
  showErrors = true,
  margin = { bottom: '20px' },
  ...rest
}) => {
  return (
    <Box pad="none" margin={margin} round={false}>
      <Field name={name}>
        {props => <NumberInputArea {...props} {...rest} />}
      </Field>
      {showErrors && (
        <Text color="status-error" size="xsmall">
          <ErrorMessage name={name} />
        </Text>
      )}
    </Box>
  );
};

const NumberInputArea = ({
  field,
  form: { handleBlur, handleChange, touched, errors, setFieldValue },
  placeholder,
  type,
  persistentPlaceholder,
  addonStart,
  addonEnd,
  addonText,
  precision,
  inputOnChange,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [fieldValue, setFieldDisplayValue] = useState('');
  const { name, value } = field;
  const handleKeyDown = ({ key }) => {
    if (!field.value && _.includes(['.', numberParser.decimalSeparator], key)) {
      setFieldDisplayValue(`0${numberParser.decimalSeparator}`);
      setFieldValue(name, `0.`);
    }
  };

  useEffect(() => {
    const convertValue = value => {
      return numberParser.decimalSeparator === ','
        ? String(value).replace('.', ',')
        : String(value).replace(',', '.');
    };
    if (_.isNumber(value)) {
      isNaN(value)
        ? setFieldDisplayValue('')
        : setFieldDisplayValue(
            convertValue(
              formatNumberToPlaces(value, precision, {
                trim: false,
                thousandSeparated: false,
              }),
            ),
          );
    } else {
      setFieldDisplayValue(convertValue(value));
    }
  }, [precision, value]);

  const mask = [
    {
      regexp: /^[\s\d]*$/,
      placeholder: '0',
    },
    ...(precision > 0
      ? [
          { fixed: numberParser.decimalSeparator },
          {
            regexp: /^\d+$/,
            placeholder: '0'.repeat(precision),
            length: precision,
          },
        ]
      : []),
  ];

  return (
    <Box direction="row" pad="none" round={false}>
      {addonStart && <StlyedAddon {...addonStart} />}
      <Box round={false} pad="none" fill={true}>
        <TextField
          {...field}
          {...rest}
          min="0"
          type="text"
          step={precision > 0 ? `0.${'0'.repeat(precision - 1)}1` : 1}
          onFocus={() => setIsFocused(true)}
          onBlur={e => {
            handleBlur(e);
            setIsFocused(false || !_.isEmpty(field.value));
          }}
          hasErrors={_.get(touched, field.name) && _.get(errors, field.name)}
          onChange={e => {
            e.target.name = name;
            e.target.value = e.target.value.toString();
            setFieldDisplayValue(e.target.value);

            inputOnChange ? inputOnChange(e) : handleChange(e);
            setFieldValue(name, numberParser.parse(e.target.value));
            // handleChange(e);
            // inputOnChange(e)
          }}
          hasFocus={isFocused}
          focusIndicator={false}
          hasAddonStart={!_.isEmpty(addonStart)}
          hasAddonEnd={!_.isEmpty(addonEnd)}
          hasAddonMiddle={!_.isEmpty(addonText)}
          placeholder={!persistentPlaceholder && placeholder}
          value={fieldValue}
          onKeyDown={handleKeyDown}
          mask={mask}
        />
      </Box>
      {addonText && <StlyedAddonText {...addonText} isEnd={true} />}
      {addonEnd && <StlyedAddon {...addonEnd} isEnd={true} />}
    </Box>
  );
};

WrappedNumberInput.propTypes = {
  name: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string.isRequired,
  precision: PropTypes.number.isRequired,
};

WrappedNumberInput.defaultProps = {
  type: 'text',
  precision: 8,
};

export default WrappedNumberInput;
