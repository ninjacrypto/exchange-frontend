import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Field as FormikField, ErrorMessage } from 'formik';
import { Form } from 'react-bulma-components';

const { Field, Label, Input, Control, Help } = Form;

export const CustomLabel = ({ horizontal, hideLabel = false, label }) => {
  if (horizontal) {
    return (
      <Field.Label hidden={hideLabel}>
        <Label>{label}</Label>
      </Field.Label>
    );
  }

  return <Label>{label}</Label>;
};

const BulmaInput = ({
  addon,
  label,
  name,
  placeholder,
  type,
  hidden,
  value,
  controlClassName,
  inputClassName,
  onChange,
  disabled,
  hideLabel,
  horizontal,
  help,
}) => (
    <Field horizontal={horizontal} hidden={hidden}>
      {label && (
        <CustomLabel
          label={label}
          horizontal={horizontal}
          hideLabel={hideLabel}
        />
      )}{
        !horizontal &&
        <Help>
          {help}
        </Help>
      }
      <Field.Body>
        <Field className="is-expanded">
          <Field {...(addon ? { kind: 'addons' } : {})}>
            <Control fullwidth={true}>
              {value ? (
                <p>{value}</p>
              ) : (
                  <FormikField name={name}>
                    {({ field, form: { touched, errors } }) => {
                      let onChangeFn = field.onChange;

                      if (onChange) {
                        onChangeFn = e => {
                          field.onChange(e);
                          onChange(e);
                        };
                      }

                      return (
                        <React.Fragment>
                          <Input
                            {...field}
                            disabled={hidden || disabled}
                            type={type}
                            color={
                              _.get(touched, field.name) &&
                              _.get(errors, field.name) &&
                              'danger'
                            }
                            className={inputClassName}
                            onChange={onChangeFn}
                            placeholder={placeholder}
                            value={field.value.toString()}
                          />
                        </React.Fragment>
                      );
                    }}
                  </FormikField>
                )}
            </Control>
            {addon && <Control className={controlClassName}>{addon}</Control>}
          </Field>
          {!value && (
            <Help color="danger">
              <ErrorMessage name={name} />
            </Help>
          )}
        </Field>
      </Field.Body>
    </Field>
  );

BulmaInput.propTypes = {
  label: PropTypes.string,
  hideLabel: PropTypes.bool,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string.isRequired,
  hidden: PropTypes.bool,
  addon: PropTypes.node,
  value: PropTypes.string,
  controlClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  horizontal: PropTypes.bool,
};

BulmaInput.defaultProps = {
  type: 'text',
  hidden: false,
  hideLabel: false,
  addon: false,
  value: null,
  name: null,
  disabled: false,
  horizontal: false,
};

export default BulmaInput;
