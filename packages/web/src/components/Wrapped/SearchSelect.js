import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Select, ThemeContext } from 'grommet';
import matchSorter from 'match-sorter';
import Box from './Box';
import { Text } from 'components/Wrapped';
import { ValueLabel } from './Select';

const SearchSelect = ({
  options: defaultOptions,
  defaultValue,
  afterSelect,
  labelKey,
  borderRadius = '5px',
  background = 'background-1',
  margin = { bottom: 'small' },
  borderColor,
  ...rest
}) => {
  const [options, setOptions] = useState(defaultOptions);
  const [value, setValue] = useState(defaultValue);
  const searchOptions = {};
  if (labelKey) {
    searchOptions.keys = [labelKey];
  }

  const handleChange = ({ option }) => {
    setValue(option);
    if (afterSelect) {
      afterSelect(option);
    }
  };

  const handleSearch = text => {
    setOptions(matchSorter(defaultOptions, text, searchOptions));
  };

  const getLabel = () => {
    return labelKey ? _.get(value, labelKey) : value;
  };

  useEffect(() => {
    setOptions(defaultOptions);
  }, [defaultOptions]);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

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
          onChange={handleChange}
          onClose={() => setOptions(defaultOptions)}
          onSearch={handleSearch}
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
          labelKey={labelKey}
          valueLabel={<ValueLabel label={getLabel()} />}
          dropHeight="medium"
          {...rest}
        />
      </Box>
    </ThemeContext.Extend>
  );
};

export default SearchSelect;
