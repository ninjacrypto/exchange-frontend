import { Formik } from 'formik';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'components/Wrapped';
import { Form } from './Form';
import { Captcha } from 'components/Captcha';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';

class FormForgotPassword extends Component {
state = {
  captchaComplete: false,
  captchaData: ''
}

handleCaptcha = data => {
  if (data) {
    this.setState({captchaComplete: true, captchaData: data,});
  } else {
    this.setState({captchaComplete: false});
  }
};

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
      reCaptchaKey
    } = this.props;

    return (
      <Formik
        initialValues={values}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }, cb) => {
          setSubmitting(false);
          if (_.startsWith(reCaptchaKey, '6L')) {
            values.captcha_code = this.state.captchaData;
          }
          handleSubmit({ ...values, ...additionalValues }, cb);
        }}
      >
        {({ isSubmitting }) => (
          <Form className={formStyles}>
            {children}
            <Captcha onChange={this.handleCaptcha} />
            {hasButton && (
              <Button
                fill={true}
                color="primary"
                type="submit"
                disabled={!this.state.captchaComplete || hasButton.disabled || loadingState}
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

FormForgotPassword.propTypes = {
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

FormForgotPassword.defaultProps = {
  additionalValues: {},
};

const mapStateToProps = ({ exchangeSettings: {
  settings: { seo: { reCaptchaKey } },
  currencySettings,
}
}) => ({
  currencySettings: currencySettings,
  reCaptchaKey
});

export default withNamespaces()(connect(mapStateToProps)(FormForgotPassword));
