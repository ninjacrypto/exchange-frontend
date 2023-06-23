import React, { useState } from 'react';
import { Box, Button, Modal } from 'components/Wrapped';
import { useMutation, queryCache } from 'react-query';
import { exchangeApi } from 'api';
import { withNamespaces } from 'react-i18next';
import { Formik, Field } from 'formik';
import { triggerToast } from 'redux/actions/ui';
import * as Yup from 'yup';
import { nestedTranslate } from 'utils';
import {
  Form,
  FormField,
  TextField,
  SelectField
} from 'components/Form';

export const AddIPWhitelistForm = withNamespaces() ( ({ t: translate, handleSuccess }) => {
  const t = nestedTranslate(translate, 'account.ip-whitelisting');
  const [mutate] = useMutation(
    data => {
      const { ...restData } = data;
      return exchangeApi.addOnIPWhitelist({
        ...restData,
      });
    },
    {
      onSuccess: response => {
        if (response.status === 'Success') {
          queryCache.invalidateQueries('ip-whitelisting');
          if (handleSuccess) {
            handleSuccess();
            triggerToast(response.message, 'success', 2500);
            exchangeApi.getIPWhitelist();
          }
        }
      },
      onError: response => {
        // An error happened!
        setisWarningShown(false)
        triggerToast(response.message, 'error', 2500);
      },
    },
  );

  // const allTypes = [
  //   {value: 'Login', label: 'Login'}
  // ];

  const validationSchema = () => {
    return Yup.object().shape({
      cidr: Yup.string().required().matches(/((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/, t('inputIPvalidation')),
      type: Yup.string().required(),
    });
  };

  
  const closeModal = () => {
    handleSuccess();
  };

  const confirmAdd = () => {
    mutate(formData)
  };

  const [formData, setformData] = useState()

  const [isWarningShown, setisWarningShown] = useState(false)
  
  return (
    <React.Fragment>
      
    <Formik
      initialValues={{
        cidr: '',
        type: 'Login',
      }}
      validationSchema={validationSchema()}
      onSubmit={(values) => {
        setisWarningShown(true);
        setformData(values)
    }}
    >
    {!isWarningShown && 
        <Form>
          <FormField name="cidr" label={t('inputLabel')}>
            <TextField />
          </FormField>
          {/* <Field
                    name="type"
                    component={SelectField}
                    options={allTypes}
                    hasIcon={false}
                  /> */}
          <Button color="primary" type="submit">
          {t('submit')}
          </Button>
        </Form>
}
    </Formik>


    {isWarningShown && 
    <div>
    <h3>{t('warning')}</h3>
    <p>{t('warningMessage')}</p>
    <br/>
    <p>{t('warningMessageOptions')}</p>
    <br/>
    <div style={{display: "flex"}}>
      <div style={{width: "50%", paddingRight:"5px"}}>
      <Button color="primary" type="button" onClick={confirmAdd} style={{width: "100%"}}>
      {t('yes')}
        </Button>
      </div>
      <div style={{width: "50%", paddingLeft:"5px"}}>
        
        <Button color="primary" type="button" onClick={closeModal} style={{width: "100%"}}>
        {t('no')}
        </Button>
        </div>

    </div>
</div>
}

  </React.Fragment>
  );
},
);

export const AddIPWhitelistModal = withNamespaces()(
  ({ t: translate }) => {
    const t = nestedTranslate(translate, 'account.ip-whitelisting');
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => setIsOpen(!isOpen);

    return (
      <React.Fragment>
        <Button color="primary" onClick={toggleModal}>
        {t('addIPButton')}
        </Button>
        <Modal show={isOpen} toggleModal={toggleModal}>
          <AddIPWhitelistForm handleSuccess={toggleModal} />
        </Modal>
      </React.Fragment>
    );
  },
);

export const AddIPWhitelist = withNamespaces()(({ t }) => {
  return (
    <Box
      direction="row"
      justify="between"
      align="center"
      background="background-2"
    >
      <div>
        <AddIPWhitelistModal />
      </div>
    </Box>
  );
});
