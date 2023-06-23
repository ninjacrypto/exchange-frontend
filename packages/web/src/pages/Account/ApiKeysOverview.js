import React, { Component, Fragment } from 'react';
import { Field, Formik, Form } from 'formik';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import * as Yup from 'yup';

import {
  Box,
  Button,
  Heading,
  Paragraph,
  Modal,
  Message,
} from 'components/Wrapped';
import { nestedTranslate } from 'utils/strings';
import { Requires2FA } from 'containers/Requires2FA';
import { triggerToast, triggerModalOpen } from 'redux/actions/ui';
import { ApiKeysTable } from 'containers/Tables';
import { TextField, SelectField, FormField } from 'components/Form';
import styles from './Account.module.scss';
import { authenticatedInstance } from 'api';
import { loadApiKeys } from 'redux/actions/apiKeys';

const ApiKeysSuccessMessageWrapper = ({ publicKey, privateKey, t }) => (
  <React.Fragment>
    <Paragraph>
      <strong>{t('account.apiKeys.success.public')}</strong> - {publicKey}
    </Paragraph>
    <Paragraph>
      <strong>{t('account.apiKeys.success.private')}</strong> - {privateKey}
    </Paragraph>
    <Paragraph>{t('account.apiKeys.success.message')}</Paragraph>
  </React.Fragment>
);

const ApiKeySuccessMessage = withNamespaces()(ApiKeysSuccessMessageWrapper);

class ApiKeysOverview extends Component {
  state = {
    show: false,
  };

  open = () => this.setState({ show: true });
  close = () => this.setState({ show: false });

  generateApiKeyValidationSchema = () => {
    return Yup.object().shape({
      twoFactorAuthKey: Yup.string()
        .min(6)
        .required(),
      keyType: Yup.string().required(),
      IpAddresses: Yup.string()
        .max(50)
        .required(),
    });
  };

  generateApiKey = async (values, cb) => {
    const { triggerToast, triggerModalOpen } = this.props;
    try {
      const { data } = await authenticatedInstance({
        url: '/api/GenerateApiKey',
        method: 'POST',
        data: values,
      });

      if (data.status === 'Success') {
        triggerModalOpen(
          null,
          null,
          <ApiKeySuccessMessage
            privateKey={data.data.privateKey}
            publicKey={data.data.publicKey}
          />,
        );
        triggerToast('apiKeyAdded', 'success', 2500);
        cb();
        this.props.loadApiKeys('ALL');
      } else {
        triggerToast(data.message);
      }
    } catch (e) {
      triggerToast('somethingWentWrong');
    }
  };

  render() {
    const { show } = this.state;
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'forms.createApiKey');

    return (
      <Fragment>
        <Modal show={show} toggleModal={this.close} width="large">
          <Formik
            initialValues={{
              twoFactorAuthKey: '',
              keyType: 'trade',
              IpAddresses: '',
            }}
            onSubmit={values => this.generateApiKey(values, this.close)}
            validationSchema={this.generateApiKeyValidationSchema()}
          >
            {props => (
              <Form className={styles.generateApiKeyForm}>
                <Heading level={3}>{t('title')}</Heading>
                <Field
                  name="keyType"
                  component={SelectField}
                  options={[
                    { value: 'trade', label: 'Trade' },
                    { value: 'readonly', label: 'Read Only' },
                  ]}
                  persistentPlaceholder={false}
                />

                <FormField name="IpAddresses">
                  <TextField
                    type="text"
                    name="IpAddresses"
                    placeholder={t('ip.placeholder')}
                    persistentPlaceholder={false}
                    addonEnd={{
                      content: t('ip.allowAll'),
                      background: 'primary',
                      onClick: () => {
                        props.setFieldValue('IpAddresses', '*');
                      },
                    }}
                  />
                </FormField>

                <p>{t('maxIpAddresses')}</p>

                <FormField name="twoFactorAuthKey">
                  <TextField
                    type="text"
                    name="twoFactorAuthKey"
                    placeholder={t('gAuth.placeholder')}
                    iconposition="left"
                    persistentPlaceholder={false}
                  />
                </FormField>
                <Button fill="horizontal" color="primary" type="submit">
                  {t('button')}
                </Button>
              </Form>
            )}
          </Formik>
        </Modal>

        <Message background="background-4" margin={{ bottom: 'small' }}>
          <Paragraph>{translate('account.apiKeys.message')}</Paragraph>
          <Paragraph>{translate('account.apiKeys.message2')}</Paragraph>
        </Message>

        <Requires2FA>
          <Box background="background-4">
            <Fragment>
              <Button
                color="primary"
                margin={{ bottom: 'small' }}
                onClick={this.open}
              >
                {translate('buttons.addKey')}
                <span
                  style={{
                    fontSize: '1em',
                    marginLeft: '10px',
                    cursor: 'pointer',
                  }}
                  className="fas fa-plus-square"
                />
              </Button>
              <ApiKeysTable />
            </Fragment>
          </Box>
        </Requires2FA>
      </Fragment>
    );
  }
}

export default withNamespaces()(
  connect(null, { triggerToast, triggerModalOpen, loadApiKeys })(
    ApiKeysOverview,
  ),
);
