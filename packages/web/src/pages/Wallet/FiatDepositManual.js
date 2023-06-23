import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import * as Yup from 'yup';

import instance, { authenticatedInstance } from 'api';
import { nestedTranslate } from 'utils/strings';
import { Formik, Form } from 'formik';
import { Select, FormField, TextField, NumberInput } from 'components/Form';
import { S3Upload } from 'containers/S3Storage';
import { withTheme } from 'styled-components';
import { triggerToast } from 'redux/actions/ui';
import {
  Box,
  Button,
  Columns,
  Column,
  Heading,
  Paragraph,
  Text,
} from 'components/Wrapped';
import {
  getDepositHistory,
} from 'redux/actions/portfolio';

class FiatDepositManual extends React.Component {
  state = {
    selectedOption: { value: '', label: '' },
    bankOptions: [],
    buttonDisabled: false,
    isComplete: false,
  };

  static propTypes = {
    currency: PropTypes.string.isRequired,
  };

  async getBankList() {
    const { currency } = this.props;

    try {
      const { data } = await instance({
        url: `/api/List_Fiat_BanksList/${currency}/`,
        method: 'GET',
      });

      const options = data.data.map(singleBank => ({
        value: singleBank.id,
        label: singleBank.bankName,
        ...singleBank,
      }));

      this.setState({
        bankOptions: options,
        selectedOption: options[0] || { value: '', label: '' },
      });
    } catch (e) {}
  }

  componentDidMount() {
    this.getBankList();
  }

  componentDidUpdate(prevProps) {
    if (this.props.currency !== prevProps.currency) {
      this.setState(
        {
          selectedOption: { value: '', label: '' },
          bankOptions: [],
        },
        () => this.getBankList(),
      );
    }
  }

  handleChange = selectedOption => {
    this.setState({ selectedOption });
  };

  isButtonDisabled = state => {
    this.setState({
      buttonDisabled: state,
    });
  };

  getBankOptions() {
    if (this.bankOptions.length) {
      this.bankOptions.map(singleBank => ({
        value: singleBank.bankName,
        label: singleBank.bankName,
        ...singleBank,
      }));
    }
  }

  renderBankDetails() {
    const { selectedOption } = this.state;
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'wallet.deposits');

    const displayDetails = name =>
      selectedOption[name] !== '-' ? (
        <React.Fragment>
          <Heading level={4}>{t(name)}</Heading>
          <Paragraph>{selectedOption[name]}</Paragraph>
        </React.Fragment>
      ) : null;

    const hasLocation =
      !_.isEqual(selectedOption.branchCity, '-') ||
      !_.isEqual(selectedOption.branchProvince, '-') ||
      !_.isEqual(selectedOption.branchCountry, '-');

    return (
      selectedOption.bankName && (
        <React.Fragment>
          <Heading level={3}>
            {translate('forms.fiatDeposit.notice.title')}
          </Heading>
          <hr />
          <Paragraph margin={{ vertical: 'small' }}>
            {translate('forms.fiatDeposit.notice.note')}
          </Paragraph>
          <Heading level={3}>{t('bankDetails')}</Heading>
          <hr />

          {displayDetails('bankName')}
          {displayDetails('beneficiaryName')}
          {displayDetails('bankRoutingCode')}
          {displayDetails('accountNumber')}
          {displayDetails('swiftCode')}

          {hasLocation ? (
            <React.Fragment>
              <Heading level={4}>{t('bankLocation')}</Heading>
              <Paragraph>
                {!_.isEqual(selectedOption.branchCity, '-') &&
                  `${selectedOption.branchCity}, `}
                {!_.isEqual(selectedOption.branchProvince, '-') &&
                  `${selectedOption.branchProvince}, `}
                {!_.isEqual(selectedOption.branchCountry, '-') &&
                  `${selectedOption.branchCountry}`}
              </Paragraph>
            </React.Fragment>
          ) : null}
        </React.Fragment>
      )
    );
  }

  async submitDepositRequest(values, actions) {
    if (values.document) {
      values.Comments = values.document;
    }

    try {
      const { triggerToast, t } = this.props;
      const { document, ...newValues } = values;

      const { data } = await authenticatedInstance({
        url: '/api/Add_Fiat_Manual_Deposit_Request',
        method: 'POST',
        data: {
          ...newValues,
        },
      });

      if (data.status === 'Success') {
        triggerToast(t(data.message), 'success');
        this.props.getDepositHistory(this.props.currency,this.props.currencyInfo.walletType);
        actions.resetForm();
        actions.setFieldValue('document', null);
        this.setState({ isComplete: false });
      } else {
        triggerToast(t(data.message), 'error');
      }
    } catch (e) {
      console.log(e);
    }
  }

  renderDepositForm() {
    const { selectedOption, buttonDisabled } = this.state;
    const { t, theme, decimalPrecision } = this.props;
    const formT = nestedTranslate(t, 'forms.fiatDeposit');

    return (
      selectedOption.bankName && (
        <React.Fragment>
          <Heading level={3}>{t('wallet.deposits.formTitle')}</Heading>
          <hr />
          <Paragraph margin={{ vertical: 'small' }}>
            {formT('formNotice')}
          </Paragraph>
          <Formik
            initialValues={{
              BankID: selectedOption.value,
              RequestAmount: '',
              TransactionID: '',
              document: '',
              Comments: '',
            }}
            onSubmit={(values, resetForm) =>
              this.submitDepositRequest(values, resetForm)
            }
            validationSchema={Yup.object().shape({
              BankID: Yup.string().required(),
              RequestAmount: Yup.string().required(),
              TransactionID: Yup.string().required(),
              Comments: Yup.string().max(250),
            })}
          >
            {() => (
              <Form>
                <FormField name="BankID" label={t('wallet.deposits.bankName')}>
                  {this.state.bankOptions.length > 1 ? (
                    <Select
                      name="BankID"
                      options={this.state.bankOptions}
                      onSelect={this.handleChange}
                      valueKey="id"
                      labelKey="bankName"
                    />
                  ) : (
                    <Text style={{marginBottom:"15px"}}>{selectedOption.bankName}</Text>
                  )}
                </FormField>

                <FormField
                  name="RequestAmount"
                  label={formT('requestAmount.label')}
                >
                  <NumberInput type="text" precision={decimalPrecision} />
                </FormField>

                <FormField
                  name="TransactionID"
                  label={formT('transactionId.label')}
                >
                  <TextField
                    type="text"
                    placeholder={formT('transactionId.label')}
                  />
                </FormField>

                <FormField name="Comments" label={formT('comments.label')}>
                  <TextField
                    type="text"
                    placeholder={formT('comments.label')}
                  />
                </FormField>

                <S3Upload
                  name="document"
                  label={formT('proof.label')}
                  placeholder={t('forms.common.document')}
                  isButtonDisabled={this.isButtonDisabled}
                />

                <Button
                  type="submit"
                  color={theme.formButtonColor}
                  disabled={buttonDisabled}
                  loading={buttonDisabled}
                >
                  {t('buttons.submit')}
                </Button>
              </Form>
            )}
          </Formik>
        </React.Fragment>
      )
    );
  }

  render() {
    const { isComplete } = this.state;
    const { t: translate } = this.props;

    const t = nestedTranslate(translate, 'forms.fiatDeposit.submitted');

    return (
      <Box background="background-4">
        {!isComplete ? (
          <Columns>
            <Column width={[1, 1, 1 / 2]}>{this.renderBankDetails()}</Column>
            <Column width={[1, 1, 1 / 2]}>{this.renderDepositForm()}</Column>
          </Columns>
        ) : (
          <Box justify="center" align="center">
            <Heading level={3}>{t('title')}</Heading>
            <Paragraph>{t('message')}</Paragraph>
            <Button
              onClick={() => this.setState({ isComplete: false })}
              color="primary"
              size="small"
              margin={{ vertical: 'small' }}
            >
              {t('return')}
            </Button>
          </Box>
        )}
      </Box>
    );
  }
}

export default withNamespaces()(
  connect(
    null,
    { triggerToast, getDepositHistory },
  )(withTheme(FiatDepositManual)),
);
