import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Field as FormikField, ErrorMessage } from 'formik';
import { Form } from 'react-bulma-components';
import { CustomLabel } from 'components/Form/BulmaInput';

const { Field, Select: BulmaSelect, Control, Help } = Form;

const HorizontalSelect = ({ children, label, name, formik, onChange }) => {
  return (
    <Field horizontal={false}>
      <CustomLabel label={label} horizontal={false} />
      <Field.Body>
        <Field className="is-expanded">
          <Field>
            <Control>
              <FormikField name={name}>
                {({ field, form: { touched, errors } }) => {
                  const hasErrors = _.get(touched, name) && _.get(errors, name);

                  let onChangeFn = null;

                  if (onChange) {
                    onChangeFn = e => {
                      field.onChange(e);
                      onChange(e);
                    };
                  }

                  return (
                    <BulmaSelect
                      {...field}
                      onChange={onChange ? onChangeFn : field.onChange}
                      color={hasErrors && 'danger'}
                    >
                      {children}
                    </BulmaSelect>
                  );
                }}
              </FormikField>
            </Control>
            <Help color="danger">
              <ErrorMessage name={name} />
            </Help>
          </Field>
        </Field>
      </Field.Body>
    </Field>
  );
};

HorizontalSelect.propTypes = {
  children: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default HorizontalSelect;
