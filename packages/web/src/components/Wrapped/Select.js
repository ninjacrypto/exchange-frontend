import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Select, ThemeContext } from 'grommet';
import { Box, Text } from 'components/Wrapped';

export const ValueLabel = ({
  label,
  size = 'small',
  placeholder = '...',
  pad = { vertical: 'xsmall', horizontal: 'small' },
}) => {
  return (
    <Box pad={pad} fill={true}>
      <Text size={size}>{label ? label : placeholder}</Text>
    </Box>
  );
};

const WrappedSelect = ({
  options,
  defaultValue,
  onChange,
  labelKey,
  valuePad,
  valueSize,
  placeholder,
  borderRadius = '5px',
  background = 'background-1',
  borderColor,
  margin = { bottom: 'small' },
  valueLabel,
  ...rest
}) => {
  const [value, setValue] = React.useState(defaultValue);

  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const getLabel = () => {
    return labelKey ? _.get(value, labelKey) : value;
  };

  return (
    <ThemeContext.Extend
      value={{
        select: {
          control: {
            extend: `background-color: var(--${background}); border-radius: ${borderRadius}; border-color: var(--${
              borderColor ? borderColor : background
            });`,
          },
          options: {
            container: {
              background,
            },
          },
        },
      }}
    >
      <Box pad="none" margin={margin} round={false}>
        <Select
          options={options}
          value={value}
          onChange={({ option, ...rest }) => {
            setValue(option);
            onChange(option);
          }}
          children={(option, index, options, state) => (
            <Box
              pad="small"
              background={
                state.selected || state.active ? 'primary' : 'background-2'
              }
              round={false}
            >
              <Text weight={state.selected || state.active ? 'bold' : 'normal'}>
                {labelKey ? option[labelKey] : option}
              </Text>
            </Box>
          )}
          valueLabel={
            valueLabel ? (
              valueLabel
            ) : (
              <ValueLabel
                label={getLabel()}
                pad={valuePad}
                size={valueSize}
                placeholder={placeholder}
              />
            )
          }
          labelKey={labelKey}
          dropHeight="medium"
          {...rest}
        />
      </Box>
    </ThemeContext.Extend>
  );
};

WrappedSelect.propTypes = {
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func,
};

export default WrappedSelect;
