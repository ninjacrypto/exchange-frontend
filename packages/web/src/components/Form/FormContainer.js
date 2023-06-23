import { Formik } from 'formik';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'components/Wrapped';
import { Form } from './Form';

class FormContainer extends Component {
  render() {
    const {
      values,
      handleSubmit,
      children,
      formStyles,
      hasButton,
      additionalValues,
      validationSchema,
      loadingState = false,
    } = this.props;

    return (
      <Formik
        initialValues={values}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }, cb) => {
          setSubmitting(false);
          handleSubmit({ ...values, ...additionalValues }, cb);
        }}
      >
        {({ isSubmitting }) => (
          <Form className={formStyles}>
            {children}
            {hasButton && (
              <Button
                fill={true}
                color="primary"
                type="submit"
                disabled={hasButton.disabled || loadingState}
                loading={loadingState}
              >
                {hasButton.text}
              </Button>
            )}
          </Form>
        )}
      </Formik>
    );
  }
}

FormContainer.propTypes = {
  values: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  formStyles: PropTypes.string,
  hasButton: PropTypes.shape({
    text: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
  }),
  validationSchema: PropTypes.func,
  additionalValues: PropTypes.object,
};

FormContainer.defaultProps = {
  additionalValues: {},
};

export default FormContainer;
