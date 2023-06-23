import React, { useEffect, useState } from 'react';
import { withNamespaces } from 'react-i18next';
import { withRouter, Route } from 'react-router-dom';
import _ from 'lodash';
import { Box } from 'components/Wrapped';
import { nestedTranslate } from 'utils';
import { Form, FormField, TextField } from 'components/Form';
import * as Yup from 'yup';
import { Button, Modal, Menu, Text } from 'components/Wrapped';
import { Columns } from 'react-bulma-components';
import styles from './TradingReq.module.scss';
import { Formik, Field } from 'formik';
import instance, { authenticatedInstance } from 'api';
import { triggerToast } from 'redux/actions/ui';
import { connect } from 'react-redux';
import { loadProfile } from 'redux/actions/profile';

export const UpdateProfileForm = withNamespaces()(
  ({ t: translate, currency, handleSuccess, loadProfile }) => {
    const t = nestedTranslate(translate, 'p2p.offers');

    const submitMethod = async values => {
      try {
        const { data } = await authenticatedInstance({
          url: '/p2p/update-profile',
          method: 'POST',
          data: values,
        });

        if (data.Status === 'Success') {
          triggerToast(data.Message, 'success');
          if (handleSuccess) {
            handleSuccess();
          }
          loadProfile();
        } else {
          triggerToast(data.Message, 'error');
        }
      } catch (e) {
        triggerToast(e.Message, 'error');
      }
    };

    const validationSchema = () => {
      return Yup.object().shape({
        DisplayName: Yup.string().required(),
      });
    };

    return (
      <React.Fragment>
        <Formik
          initialValues={{
            DisplayName: '',
          }}
          validationSchema={validationSchema()}
          onSubmit={values => submitMethod(values)}
        >
          {({ setFieldValue }) => (
            <Form>
              <FormField name="DisplayName" label={t('name')}>
                <TextField />
              </FormField>
              <Button color="primary" type="submit">
                {translate('buttons.submit')}
              </Button>
            </Form>
          )}
        </Formik>
      </React.Fragment>
    );
  },
);

export const UpdateProfile = withNamespaces()(({ t: translate, currency, loadProfile }) => {
  const t = nestedTranslate(translate, 'tables.offers');
  const [isOpen2, setIsOpen2] = useState(false);

  const toggleModal2 = () => setIsOpen2(!isOpen2);

  return (
    <React.Fragment>
      <Button
        color="primary"
        primary={false}
        fill="horizontal"
        onClick={() => toggleModal2()}
        margin={{ bottom: 'small' }}
      >
        {t('tradingRequirements.add')}
      </Button>
      <Modal
        show={isOpen2}
        toggleModal={toggleModal2}
        heading={translate('p2p.offers.updateProfileHeading')}
      >
        <UpdateProfileForm handleSuccess={toggleModal2} currency={currency} loadProfile={loadProfile} />
      </Modal>
    </React.Fragment>
  );
});

export const TradingRequirementsModal = withRouter(
  withNamespaces()(
    ({
      t: translate,
      isMobileVerified,
      kycStatus,
      history,
      loginName,
      handleSuccess,
      loadProfile,
    }) => {
      const t = nestedTranslate(translate, 'tables.offers');
      return (
        <React.Fragment>
          <React.Fragment>
            <Box pad="none" margin={{ bottom: 'medium' }}>
              <Text>{t('tradingRequirements.info')}</Text>
            </Box>
            {_.isEqual(loginName, '') && (
              <Box pad="none">
                <Columns
                  className={styles.customizedColumns}
                  breakpoint="mobile"
                >
                  <Columns.Column size={6} className={styles.customizedColumn}>
                    <Text margin={{ bottom: 'small' }}>
                      {t('tradingRequirements.profileName')}
                    </Text>
                  </Columns.Column>
                  <Columns.Column size={6} className={styles.customizedColumn}>
                    <UpdateProfile loadProfile={loadProfile} />
                  </Columns.Column>
                </Columns>
              </Box>
            )}

            {!isMobileVerified && (
              <Box pad="none">
                <Columns
                  className={styles.customizedColumns}
                  breakpoint="mobile"
                >
                  <Columns.Column size={6} className={styles.customizedColumn}>
                    <Text margin={{ bottom: 'small' }}>
                      {t('tradingRequirements.completePhoneVerification')}
                    </Text>
                  </Columns.Column>
                  <Columns.Column size={6} className={styles.customizedColumn}>
                    <Button
                      color="primary"
                      primary={false}
                      fill="horizontal"
                      onClick={() => {
                        history.push(`/account/phone-verification`);
                        handleSuccess();
                      }}
                      margin={{ bottom: 'small' }}
                    >
                      {t('tradingRequirements.enable')}
                    </Button>
                  </Columns.Column>
                </Columns>
              </Box>
            )}
            {!_.isEqual(kycStatus.toLowerCase(), 'approved') && (
              <Box pad="none">
                <Columns
                  className={styles.customizedColumns}
                  breakpoint="mobile"
                >
                  <Columns.Column size={6} className={styles.customizedColumn}>
                    <Text margin={{ bottom: 'small' }}>
                      {t('tradingRequirements.completeKYCVerification')}
                    </Text>
                  </Columns.Column>
                  <Columns.Column size={6} className={styles.customizedColumn}>
                    <Button
                      color="primary"
                      primary={false}
                      fill="horizontal"
                      onClick={() => {
                        history.push(`/account/account-verification`);
                        handleSuccess();
                      }}
                      margin={{ bottom: 'small' }}
                    >
                      {t('tradingRequirements.enable')}
                    </Button>
                  </Columns.Column>
                </Columns>
              </Box>
            )}
          </React.Fragment>
        </React.Fragment>
      );
    },
  ),
);

class TradingRequirements extends React.Component {
  render() {
    const { t: translate, profile, show, p2pEligible, handleSuccess, loadProfile } = this.props;
    const t = nestedTranslate(translate, 'tables.offers');

    return (
      <React.Fragment>
        <Modal
          show={show}
          toggleModal={handleSuccess}
          width="large"
          pad="medium"
          heading={t('tradingRequirements.title')}
        >
          <TradingRequirementsModal
            isMobileVerified={profile.isMobileVerified}
            kycStatus={profile.kycStatus}
            loginName={profile.loginName}
            p2pEligible={p2pEligible}
            handleSuccess={handleSuccess}
            loadProfile={loadProfile}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ auth, exchangeSettings: { settings }, user }) => ({
  isAuthenticated: auth.isAuthenticated,
  logoUrl: settings.logoUrl,
  enableInstaTrade: settings.enableInstaTrade,
  enableP2PTrading: settings.enableP2PTrading,
  enableSocialTrade: settings.enableSocialTrade,
  enableDSSO: settings.enableDSSO,
  profile: user.profile,
});

export default withNamespaces()(
  connect(mapStateToProps, {loadProfile})(TradingRequirements),
);
