import React, { useCallback, useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { CountryIconOption } from 'components/Form';
import cx from 'classnames';
import styled from 'styled-components';
import { colorStyle } from 'grommet-styles';
import { edgeStyle } from 'grommet/utils';
import { withNamespaces } from 'react-i18next';
import _ from 'lodash';

const StyledReactSelect = styled(Select)`
  ${props =>
    props.margin &&
    edgeStyle(
      'margin',
      props.margin,
      props.responsive,
      props.theme.box.responsiveBreakpoint,
      props.theme,
    )}
  .react-select {
    &__control {
      ${props =>
        props.background &&
        colorStyle('background', props.background, props.theme)}
      border-width: 1px;
      border-style: solid;
      ${props =>
        props.borderColor &&
        colorStyle('border-color', props.borderColor, props.theme)};
    }

    &__menu-list {
      ${props =>
        props.menuBackground &&
        colorStyle('background', props.menuBackground, props.theme)}
    }
  }
`;

export const ReactSelect = withNamespaces()(
  ({
    className,
    background = 'selectBackground',
    menuBackground = 'selectBackground',
    borderColor = 'border',
    margin = { bottom: '30px' },
    placeholder,
    t,
    isMulti,
    closeMenuOnSelect,
    ...rest
  }) => {
    const [selected, setSelected] = useState(false);

    const handleMenuOpen = () => {
      setSelected(true);
    };

    const handleMenuClose = () => {
      setSelected(false);
    };

    return (
      <StyledReactSelect
        {...rest}
        background={background}
        borderColor={borderColor}
        margin={margin}
        menuBackground={menuBackground}
        classNamePrefix={'react-select'}
        className={cx('react-select-container', className)}
        onMenuOpen={handleMenuOpen}
        onMenuClose={handleMenuClose}
        controlShouldRenderValue={_.isEqual(isMulti, 'isMulti') ? true : !selected}
        isSearchable={selected}
        placeholder={t('forms.common.select')}
        isMulti={isMulti}
        closeMenuOnSelect={closeMenuOnSelect}
      />
    );
  },
);

export const SelectField = ({
  options,
  field,
  form,
  hasIcon,
  afterChange,
  ...rest
}) => (
  <ReactSelect
    {...rest}
    options={options}
    components={hasIcon ? { Option: CountryIconOption } : ''}
    name={field.name}
    value={
      !Array.isArray(field.value)
        ? options
          ? options.find(option => option.value === field.value)
          : ''
        : field.value
    }
    onChange={option => {
      if (afterChange) {
        afterChange(option);
      }

      if (!_.isNull(option)) {
        if (!Array.isArray(option)) {
          form.setFieldValue(field.name, option.value);
        } else {
          form.setFieldValue(field.name, option);
        }
      } else {
        form.setFieldValue(field.name, []);
      }
    }}
    onBlur={field.onBlur}
  />
);

export default withNamespaces()(SelectField);
