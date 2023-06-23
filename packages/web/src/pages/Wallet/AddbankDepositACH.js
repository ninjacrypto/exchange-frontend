import React, { useCallback, useState, useEffect, useMemo } from 'react';
import _ from 'lodash';
import { Formik, useField, ErrorMessage, useFormikContext, Field } from 'formik';
import { withNamespaces } from 'react-i18next';
import { connect, useSelector } from 'react-redux';
import { useMutation, queryCache } from 'react-query';
import * as Yup from 'yup';

import { exchangeApi } from 'api';
import { nestedTranslate } from 'utils';
import {
  Box,
  Button,
  Message,
  Text,
  Modal,
  Paragraph,
  Columns,
  Column,
} from 'components/Wrapped';
import {
  Form,
  IconOption,
  IconValue,
  FormField,
  TextField,
  SelectField
} from 'components/Form';
import { triggerToast } from 'redux/actions/ui';
import{FiatDepositACH} from 'pages/Wallet'



export const AddBanksForm = withNamespaces()(
  ({ t: translate, currency, handleSuccess, match, oncall }) => {

    const t = nestedTranslate(translate, 'wallet.banks');

    // useEffect(() => {
    //   // Update the document title using the browser API
    //   console.log(window.location.href.substring(window.location.href.lastIndexOf('/') + 1));
    // });
    const [isSubmitting, setIsSubmitting] = useState(false);
   
    const [mutate] = useMutation(
      data => {
        const {...restData } = data;
        return exchangeApi.addbankACH({
          
          ...restData,
        });
      },
      {
        onSuccess: response => {
          if (response.status === 'Success') {
            queryCache.invalidateQueries('banks');
            triggerToast(response.message, 'success', 2500)
            if (handleSuccess) {
              handleSuccess();
              oncall();
              setIsSubmitting(false);
            }
            
          } else {
            triggerToast(response.message, 'error', 2500)
            // setError(response.message);
              setIsSubmitting(false);
          }
        },
      },
    );

    const validationSchema = () => {
      return Yup.object().shape({
        BankName: Yup.string().required(),
        AccountType: Yup.string().required(),
        AccountNumber: Yup.string().required(),
        BankRoutingCode: Yup.string().required(),
      });
    };

    const defaultTypeOptions = () => {
      return [
        { value: "Savings", label: "Savings" },
        { value: "Checking", label: "Checking" },
      ];
    }

    return (
      <React.Fragment>
        <Formik
          initialValues={{
            BankName: '',
            AccountType: '',
            AccountNumber: '',
            BankRoutingCode: '',
            SwiftCode: 'NA'
          }}
          validationSchema={validationSchema()}
          onSubmit={(values) =>{ 
              mutate(values)
              setIsSubmitting(true);
            }}
        >
          {({ setFieldValue }) => (
            <Form>

                   
                   <Box pad="none" gap="xsmall" margin={{ bottom: 'small' }}>
                      <Text size="small" weight="bold">
                        {t('accountType')}
                      </Text>
                        <Field
                          name="AccountType"
                          component={SelectField}
                          options={defaultTypeOptions()}
                          margin="none"
                        />
                        <Box pad={{ horizontal: 'small' }} align="start">
                          <Text color="status-error" size="xsmall">
                            <ErrorMessage name="AccountType" />
                          </Text>
                        </Box>
                    </Box>
                    <FormField name="BankName" label={t('bankName')}>
                      <TextField />
                    </FormField>
                    <FormField name="AccountNumber" label={t('accountNumber')}>
                        <TextField />
                      </FormField>
                      <FormField name="BankRoutingCode" label={t('bankRoutingCode')}>
                        <TextField />
                      </FormField>
                 
                 
                      <Button color="primary" type="submit" disabled={isSubmitting}
                          loading={isSubmitting}>
                        {translate('buttons.submit')}
                      </Button>
            </Form>
          )}
        </Formik>
      </React.Fragment>
    );
  },
);

export const AddBanksModal = withNamespaces()(
  ({ t: translate, currency, oncall }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => setIsOpen(!isOpen);

    const t = nestedTranslate(translate, 'wallet.banks');

    const customizedCss = {
      overflow: "auto",
      maxHeight: "90vh"
    }

    return (
      <React.Fragment>
        <Button color="primary" onClick={toggleModal}>
          ADD ACCOUNT
        </Button>
        <Modal show={isOpen} toggleModal={toggleModal} width="large" pad="medium" customize={customizedCss}>
          <AddBanksForm handleSuccess={toggleModal} currency={currency} oncall={oncall}/>
        </Modal>
      </React.Fragment>
    );
  },
);

export const AddDepositBanks = withNamespaces()(({ t, oncall}) => {

  return (
    <AddBanksModal oncall={oncall}/>
  );
});
