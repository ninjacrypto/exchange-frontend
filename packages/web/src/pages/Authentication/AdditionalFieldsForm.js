import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import * as Yup from 'yup';
import styled from 'styled-components';
import { Formik, Form } from 'formik';
import { withNamespaces } from 'react-i18next';

import { AuthenticationContainer } from 'pages/Authentication';
import { FormField, TextField, CheckBox, Select } from 'components/Form';
import { Box, Button, Heading, Paragraph } from 'components/Wrapped';
import { authenticatedInstance } from 'api';
import { getAdditionalFields } from 'redux/actions/profile';
import { triggerModalOpen } from 'redux/actions/ui';

const TEXT_BOX = 'TextBox';
const DROPDOWN = 'DropDownList';
const CHECKBOX = 'CheckBox';

const StyledContainer = styled(Box)`
  text-align: left;
`;
class AdditionalFieldsForm extends React.Component {
  state = {
    validationSchema: null,
    fields: [],
    initialValues: {},
  };

  validations = {};
  initialValues = {};

  componentDidMount() {
    this.generateForm();
  }

  generateForm() {
    const { additionalAccountFields } = this.props;

    const fields = additionalAccountFields.map(singleField => {
      return this.handleSingleField(singleField);
    });

    this.setState({
      fields,
      validationSchema: Yup.object().shape(this.validations),
    });
  }

  handleSingleField(field) {
    const {
      id,
      fieldLabel,
      placeholder,
      defaultValues,
      validationRegEx,
    } = field;
    const name = id.toString();

    this.initialValues[name] = defaultValues || '';
    this.validations[name] = Yup.string().required();

    if (validationRegEx) {
      // Need to split regex from regular form into regex and regex options
      const regexString = validationRegEx.substr(
        1,
        validationRegEx.lastIndexOf('/') - 1,
      );
      const splitRegex = validationRegEx.split('/');
      const regexOptions = splitRegex[splitRegex.length - 1];

      const regex = new RegExp(regexString, regexOptions);

      this.validations[name] = Yup.string()
        .required()
        .test('regex', this.props.t('forms.validations.general'), val => {
          // If this is not here JS regex will switch between true/false every other call if `g` is used
          // https://stackoverflow.com/a/2630538
          regex.lastIndex = 0;
          const result = regex.test(val);

          return result;
        });
      window.test = this.validations[name];
    }

    const { fieldType } = field;
    switch (fieldType) {
      case TEXT_BOX:
        return (
          <FormField label={fieldLabel} name={name} key={name}>
            <TextField placeholder={placeholder} />
          </FormField>
        );
      case DROPDOWN:
        const options = placeholder.split(',') || [];

        return (
          <FormField label={fieldLabel} name={name} key={name}>
            <Select name={name} options={options} value={defaultValues} />
          </FormField>
        );
      case CHECKBOX:
        this.initialValues[name] = false;
        this.validations[name] = Yup.bool().required();

        return <CheckBox label={fieldLabel} name={name} key={name} />;
      default:
        break;
    }
  }

  handleSubmit = async values => {
    const submission = Object.entries(values).map(([fieldID, fieldValue]) => ({
      fieldID,
      fieldValue,
    }));

    try {
      const { t, triggerModalOpen } = this.props;

      const { data } = await authenticatedInstance({
        url: '/api/Customer_AddtionalFields',
        method: 'POST',
        data: { data: submission },
      });

      if (data.status === 'Success') {
        triggerModalOpen(t('forms.additionalInformation.successMessage'));
        this.props.getAdditionalFields();
      } else {
        triggerModalOpen(t(data.message));
      }
    } catch (e) {}
  };

  render() {
    const { fields, validationSchema } = this.state;
    const { t } = this.props;

    return (
      <AuthenticationContainer>
        <Box pad="small">
          <Heading level={3}>
            {t('forms.additionalInformation.heading')}
          </Heading>
          <Paragraph>{t('forms.additionalInformation.description')}</Paragraph>
          {!_.isEmpty(fields) && (
            <Formik
              initialValues={this.initialValues}
              validationSchema={validationSchema}
              onSubmit={this.handleSubmit}
            >
              {() => (
                <Form>
                  <StyledContainer pad="none">
                    {fields}
                    <Button type="submit" color="primary">
                      {t('buttons.submit')}
                    </Button>
                  </StyledContainer>
                </Form>
              )}
            </Formik>
          )}
        </Box>
      </AuthenticationContainer>
    );
  }
}

const mapStateToProps = ({ user: { additionalAccountFields } }) => ({
  additionalAccountFields,
});

export default withNamespaces()(
  connect(
    mapStateToProps,
    { getAdditionalFields, triggerModalOpen },
  )(AdditionalFieldsForm),
);
