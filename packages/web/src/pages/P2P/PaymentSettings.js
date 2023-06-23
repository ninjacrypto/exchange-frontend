import React, { Component, useState, useEffect } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { translate, withNamespaces } from 'react-i18next';
import { triggerModalOpen } from 'redux/actions/ui';
import styles from './P2P.module.scss';
import instance, { authenticatedInstance, apiInstance } from 'api';
import { Box, Button, Modal, Heading, Text } from 'components/Wrapped';
import { useMutation, queryCache } from 'react-query';
import { exchangeApi } from 'api';
import { Formik, Field } from 'formik';
import { triggerToast } from 'redux/actions/ui';
import * as Yup from 'yup';
import { nestedTranslate } from 'utils';
import { PageWrap } from 'components/Containers';
import { getPaymentMethods, getUserPaymentMethods } from 'redux/actions/p2p';
import { MyPaymentMethodsTable } from 'containers/Tables';
import { ReactSelect } from 'components/Form/SelectField';
import { Requires2FA } from 'containers/Requires2FA';
import {
  Form,
  FormField,
  TextField,
  SelectField,
  CheckBox,
  IconOption,
  IconValue,
  NumberInputAddon,
} from 'components/Form';
import { Columns } from 'react-bulma-components';

class PaymentSettings extends Component {
  constructor() {
    super();

    this.state = {
      QuoteCurrencies: [],
      PaymentMethods: [],
      selectedPaymentMethods: { value: '', label: 'Select' },
      selectedQuoteCurrency: { value: '', label: 'Select' },
      methodData: [],
      showForm: false,
      initialValues: {},
      validationSchema: null,
    };
  }

  componentDidMount() {
    this.getQuoteCurrencies();
  }

  componentDidUpdate() {
    if (_.isEmpty(this.state.QuoteCurrencies)) {
      this.getQuoteCurrencies();
    }
  }

  getQuoteCurrencies() {
    const { p2pCurrencies } = this.props;

    if (!_.isEmpty(p2pCurrencies)) {
      let quoteCurr = [];
      Object.entries(p2pCurrencies).map(([key, value]) => {
        if (key === 'Quote') {
          value.map(el => {
            let avi = {
              label: el.AssetName,
              value: el.AssetName,
            };
            quoteCurr.push(avi);
          });
        }
      });
      this.setState(
        {
          QuoteCurrencies: quoteCurr,
        },
        // () => this.getPaymentMethodslist(),
      );
    }
  }

  handleChangeQuote = data => {
    const { t: translate } = this.props;
    this.setState({ selectedQuoteCurrency: data });
    let tempMethods = [];
    this.props.p2pPaymentMethods.forEach(element => {
      if (data.value == element.Currency) {
        let methods = { value: element.Id, label: element.MethodName };
        tempMethods.unshift(methods);
      }
    });

    this.setState({ PaymentMethods: tempMethods, showForm: false });
    this.setState({
      selectedPaymentMethods: {
        value: '',
        label: translate('forms.common.select'),
      },
    });
  };

  handlePaymentMethods = data => {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'p2p.paymentSettings');
    let tempInitialValues = {};
    let validations = [];
    this.setState({
      selectedPaymentMethods: { value: data.value, label: data.label },
      showForm: false
    });
    if (this.props.p2pPaymentMethods.length !== 0) {
      this.props.p2pPaymentMethods.forEach(element => {
        if (_.isEqual(element.Id, data.value)) {
          this.setState({ methodData: element });
          element.FieldsJSON.forEach(element => {
            validations[element.Name] = Yup.mixed()
              .required()
              .test('regex', t('formErrorMsg'), val => {
                let regExp = new RegExp(element.Regex);
                return regExp.test(val);
              });
            tempInitialValues[element.Name] = '';
          });
        }
      });
      validations['Gauth_Code'] = Yup.string()
        .min(6)
        .max(6)
        .required();
      tempInitialValues['Gauth_Code'] = '';
      this.setState(
        {
          initialValues: tempInitialValues,
          validationSchema: Yup.object().shape(validations),
        },
        () => {
          this.setState({ showForm: true });
        },
      );
    }
  };

  async handleSubmit(values, actions) {
    const fieldData = {
      PaymentId: this.state.methodData.Id,
      PaymentJSON: {},
    };

    fieldData['Gauth_Code'] = values.Gauth_Code;
    delete values.Gauth_Code;

    if (!values.hasOwnProperty('Gauth_Code')) {
      fieldData.PaymentJSON = values;
    }

    try {
      const { data } = await authenticatedInstance({
        url: '/p2p/add-userpayment-method',
        method: 'POST',
        data: fieldData,
      });

      if (data.Status === 'Success') {
        triggerToast(data.Message, 'success');
        this.props.getUserPaymentMethods();
        actions.resetForm();
      } else {
        triggerToast(data.Message, 'error');
      }
    } catch (e) {
      triggerToast(e.Message, 'error');
    }
  }

  render() {
    const {
      QuoteCurrencies,
      PaymentMethods,
      selectedPaymentMethods,
      selectedQuoteCurrency,
      showForm,
      initialValues,
      validationSchema,
      methodData,
    } = this.state;
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'p2p.paymentSettings');

    return (
      <React.Fragment>
        <Requires2FA>
          <PageWrap>
            <Columns className={styles.customizedColumns} breakpoint="tablet">
              <Columns.Column size={5} className={styles.customizedColumn}>
                <Box
                  pad="medium"
                  margin={{ bottom: 'small' }}
                  background="background-3"
                >
                  <Heading level={3} margin={{ bottom: '1rem' }}>
                    {t('pageTitle')}
                  </Heading>
                  <div className={styles.paymentDivider}></div>
                  <Columns className={styles.customizedColumns}>
                    <Columns.Column
                      size={5}
                      className={styles.customizedColumn}
                    >
                      <Text className={styles.formLabel}>{t('fiat')}</Text>
                      <ReactSelect
                        name="quote"
                        options={QuoteCurrencies}
                        onChange={this.handleChangeQuote}
                        value={selectedQuoteCurrency}
                        margin={{ bottom: '20px' }}
                        components={{
                          Option: IconOption,
                          SingleValue: IconValue,
                        }}
                      />
                    </Columns.Column>
                    <Columns.Column
                      size={7}
                      className={styles.customizedColumn}
                    >
                      <Text className={styles.formLabel}>
                        {t('paymentMethod')}
                      </Text>
                      <ReactSelect
                        name="paymentMethods"
                        options={PaymentMethods}
                        onChange={this.handlePaymentMethods}
                        value={selectedPaymentMethods}
                        margin={{ bottom: '20px' }}
                      />
                    </Columns.Column>
                  </Columns>

                  {showForm && (
                    <Box pad="none">
                      <Formik
                        initialValues={initialValues}
                        onSubmit={(values, actions) =>
                          this.handleSubmit(values, actions)
                        }
                        validationSchema={validationSchema}
                      >
                        {({ values, resetForm }) => (
                          <Form>
                            {methodData?.FieldsJSON &&
                              methodData.FieldsJSON.map(item => (
                                <FormField
                                  key={item.Name}
                                  name={item.Name}
                                  label={t(`${item.Name}.label`)}
                                >
                                  <TextField
                                    type="text"
                                    placeholder={t(`${item.Name}.placeholder`)}
                                  />
                                </FormField>
                              ))}
                            <FormField
                              name="Gauth_Code"
                              label={t('gAuthCode.label')}
                            >
                              <TextField
                                type="text"
                                placeholder={translate(
                                  'forms.enableGoogleAuth.authCode.placeholder',
                                )}
                              />
                            </FormField>
                            <Button fill={true} color="primary" type="submit">
                              {t('submit')}
                            </Button>
                          </Form>
                        )}
                      </Formik>
                    </Box>
                  )}
                </Box>
              </Columns.Column>
              <Columns.Column size={7} className={styles.customizedColumn}>
                <Box
                  pad="medium"
                  margin={{ bottom: 'small' }}
                  background="background-3"
                >
                  <Heading level={3} margin={{ bottom: '1rem' }}>
                    {translate('tables.paymentSettings.pageTitle')}
                  </Heading>
                  <MyPaymentMethodsTable />
                </Box>
              </Columns.Column>
            </Columns>
          </PageWrap>
        </Requires2FA>
      </React.Fragment>
    );
  }
}
const mapStateToProps = ({ p2p: { p2pCurrencies, p2pPaymentMethods } }) => ({
  p2pCurrencies: p2pCurrencies,
  p2pPaymentMethods: p2pPaymentMethods,
});

export default withNamespaces()(
  connect(mapStateToProps, {
    triggerModalOpen,
    getPaymentMethods,
    getUserPaymentMethods,
  })(PaymentSettings),
);
