import React, { Component, useEffect, useState } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import {
  Box,
  Text,
  Heading,
  Image,
  Button,
  Modal,
  RadioButtonGroup,
  Paragraph,
} from 'components/Wrapped';
import { PageWrap } from 'components/Containers';
import { Columns } from 'react-bulma-components';
import { moment } from 'i18n';
import instance, { authenticatedInstance } from 'api';
import {
  formatCrypto,
  formatNumberToPlaces,
  numberParser,
  formatFiat,
  formatNumber,
} from 'utils/numbers';
import {
  Send,
  Attachment,
  ChatOption,
  Phone,
  Contact,
  StatusGood,
} from 'grommet-icons';
import * as Yup from 'yup';
import styles from './P2P.module.scss';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import {
  TextField,
  FormField,
  SelectField,
  TextArea,
  PhoneInput,
  CheckBox,
} from 'components/Form';
import { withRouter, Redirect } from 'react-router-dom';
import { triggerToast, triggerModalOpen } from 'redux/actions/ui';
import { Tooltip } from 'components/Tooltip';
import { nestedTranslate } from 'utils';
import { S3ChatUpload, S3ChatDownload } from 'containers/S3ChatStorage';
import { S3Upload } from 'containers/S3Storage';

export const CancelOrderModal = withRouter(
  withNamespaces()(({ t: translate, handleSuccess, OrderGuid, history }) => {
    const t = nestedTranslate(translate, 'p2p.orderDetails');
    const [cancelReasons, setCancelReasons] = useState([]);
    const [selectedCancelReason, setSelectedCancelReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [isOtherReasons, setIsOtherReasons] = useState(false);

    useEffect(() => {
      setCancelReasons([
        t('cancelReason1'),
        t('cancelReason2'),
        t('cancelReason3'),
        t('cancelReason4'),
        t('cancelReason5'),
      ]);
      setSelectedCancelReason(t('cancelReason1'));
    }, []);

    const handleReasonChange = value => {
      setSelectedCancelReason(value);
      if (_.isEqual(value, t('cancelReason5'))) {
        setIsOtherReasons(true);
      } else {
        setIsOtherReasons(false);
      }
    };

    const handleOtherReason = value => {
      setOtherReason(value);
    };

    const handleCancelOrderSubmit = async values => {
      let orderObj = {};
      orderObj['OrderGuid'] = OrderGuid;
      if (_.isEqual(isOtherReasons, true)) {
        orderObj['UserCancelComments'] = values.cancelReasonWritten;
      } else {
        orderObj['UserCancelComments'] = selectedCancelReason;
      }

      try {
        const { data } = await authenticatedInstance({
          url: '/p2p/cancel-order',
          method: 'POST',
          data: orderObj,
        });

        if (data.Status === 'Success') {
          triggerToast(data.Message, 'success');
          if (handleSuccess) {
            handleSuccess();
          }
          history.push(`/p2p`);
        }
      } catch (e) {}
    };

    const cancelValidationSchema = () => {
      return Yup.object().shape({
        cancelReasonWritten: _.isEqual(selectedCancelReason, t('cancelReason5'))
          ? Yup.string().required()
          : Yup.string(),
      });
    };

    return (
      <React.Fragment>
        <Box
          pad="small"
          background="cookieConsentBackground"
          margin={{ bottom: 'medium' }}
        >
          <Text size="small" margin={{ bottom: 'xsmall' }}>
            {t('cancelOrderTips.title')}
          </Text>
          <Box pad={{ horizontal: 'medium' }}>
            <ol>
              <li>
                <Text size="xsmall">{t('cancelOrderTips.tip1')}</Text>
              </li>
              <li>
                <Text size="xsmall">{t('cancelOrderTips.tip2')}</Text>
              </li>
            </ol>
          </Box>
        </Box>

        <Formik
          initialValues={{
            cancelReasonWritten: '',
          }}
          validationSchema={cancelValidationSchema()}
          onSubmit={(values, actions) =>
            handleCancelOrderSubmit(values, actions)
          }
        >
          {({ setFieldValue }) => (
            <Form>
              <Box pad="none">
                <Box pad={{ vertical: 'small' }}>
                  <Box pad="none" margin={{ bottom: 'medium' }}>
                    <Text class="">{t('cancelReasonsHeading')}</Text>
                  </Box>
                  <RadioButtonGroup
                    name="cancelReason"
                    direction="column"
                    options={cancelReasons}
                    value={selectedCancelReason}
                    onChange={value => handleReasonChange(value)}
                  />
                </Box>

                {isOtherReasons && (
                  <Box pad="none" margin={{ top: 'small', bottom: 'small' }}>
                    <FormField name="cancelReasonWritten">
                      <TextArea placeholder={t('cancelReasonPlaceholder')} />
                    </FormField>
                  </Box>
                )}
                <Box pad="none">
                  <Columns
                    className={styles.customizedColumns}
                    breakpoint="mobile"
                  >
                    <Columns.Column
                      size={6}
                      className={styles.customizedColumn}
                    >
                      <Button
                        color="primary"
                        primary={false}
                        fill="horizontal"
                        onClick={() => handleSuccess()}
                      >
                        {t('cancel')}
                      </Button>
                    </Columns.Column>
                    <Columns.Column className={styles.customizedColumn}>
                      <Button color="primary" type="submit" fill="horizontal">
                        {t('confirm')}
                      </Button>
                    </Columns.Column>
                  </Columns>
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </React.Fragment>
    );
  }),
);

export const ConfirmTransferred = withRouter(
  withNamespaces()(
    ({
      t: translate,
      handleSuccess,
      OPMDetails,
      OPMSelected,
      OrderData,
      getMyOrder,
    }) => {
      const t = nestedTranslate(translate, 'p2p.orderDetails');

      const handleMakePayment = async () => {
        let orderObj = {};
        orderObj['OrderGuid'] = OrderData.OrderGuid;
        orderObj['MakerPaymentMethodId'] = OPMDetails.UserPaymentId;

        try {
          const { data } = await authenticatedInstance({
            url: '/p2p/order-make-payment',
            method: 'POST',
            data: orderObj,
          });

          if (data.Status === 'Success') {
            triggerToast(data.Message, 'success');
            if (handleSuccess) {
              handleSuccess();
            }
            if (OrderData.OrderGuid) {
              getMyOrder(OrderData.OrderGuid);
            }
          }
        } catch (e) {}
      };

      return (
        <React.Fragment>
          <Box pad="none" margin={{ bottom: 'medium' }}>
            <Text size="small">{t('buyInstruction3')}</Text>
          </Box>
          <Box
            pad={{ horizontal: 'small' }}
            margin={{ bottom: 'medium' }}
            round={false}
            border={{ color: 'brand', size: 'small', side: 'left' }}
          >
            <Text size="medium">{OPMSelected}</Text>
          </Box>
          <Box
            pad={{ horizontal: 'small', vertical: 'small' }}
            margin={{ bottom: 'small' }}
            background="background-1"
          >
            {Object.keys(JSON.parse(OPMDetails.PaymentJSON)).map(key => (
              <div key={key}>
                <Box pad="small">
                  <Box pad="none">
                    <Text size="small" weight="bold">
                      {key}
                    </Text>
                  </Box>
                  <Box pad="none">
                    <Text size="small">
                      {JSON.parse(OPMDetails.PaymentJSON)[key]}
                    </Text>
                  </Box>
                </Box>
              </div>
            ))}
          </Box>
          <Box pad={{ vertical: 'small' }} margin={{ bottom: 'medium' }}>
            <Text size="small">{t('buyWarning2')}</Text>
          </Box>
          <Box pad="none">
            <Columns className={styles.customizedColumns} breakpoint="mobile">
              <Columns.Column size={6} className={styles.customizedColumn}>
                <Button
                  color="primary"
                  primary={false}
                  fill="horizontal"
                  onClick={() => handleSuccess()}
                  margin={{ bottom: 'small' }}
                >
                  {t('cancel')}
                </Button>
              </Columns.Column>
              <Columns.Column size={6} className={styles.customizedColumn}>
                <Button
                  color="primary"
                  type="submit"
                  fill="horizontal"
                  onClick={() => handleMakePayment()}
                  margin={{ bottom: 'small' }}
                >
                  {t('confirm')}
                </Button>
              </Columns.Column>
            </Columns>
          </Box>
        </React.Fragment>
      );
    },
  ),
);

export const AppealModal = withRouter(
  withNamespaces()(({ t: translate, handleSuccess, OrderData, getMyOrder }) => {
    const t = nestedTranslate(translate, 'p2p.orderDetails');
    const [isAppealed, setIsAppealed] = useState(false);
    const [appealReasons, setAppealReasons] = useState([]);
    const [selectedAppealReason, setSelectedAppealReason] = useState('');
    const [selectedcountryCode, setSelectedCountryCode] = useState('');
    const [isOtherReasons, setIsOtherReasons] = useState(false);
    const [isAppealEnable, setIsAppealEnable] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);

    const isButtonDisabled = state => {
      setButtonDisabled(state);
    };

    useEffect(() => {
      setAppealReasons([
        {
          value: t('appealReasons.reason1'),
          label: t('appealReasons.reason1'),
        },
        {
          value: t('appealReasons.reason2'),
          label: t('appealReasons.reason2'),
        },
        {
          value: t('appealReasons.reason3'),
          label: t('appealReasons.reason3'),
        },
        {
          value: t('appealReasons.reason4'),
          label: t('appealReasons.reason4'),
        },
      ]);
    }, []);

    const handleAppealReasonChange = value => {
      setSelectedAppealReason(value);
      if (_.isEqual(value.value, t('appealReasons.reason4'))) {
        setIsOtherReasons(true);
      } else {
        setIsOtherReasons(false);
      }
    };

    const appealValidationSchema = () => {
      return Yup.object().shape({
        Primary_Reason: Yup.string().required(),
        MobileNo: Yup.string().required(),
        Attachment: Yup.string().required(),
        Primary_Reason_Written: _.isEqual(
          selectedAppealReason.value,
          t('appealReasons.reason4'),
        )
          ? Yup.string().required()
          : Yup.string(),
      });
    };

    const submitAppeal = async values => {
      let orderObj = {};
      orderObj['OrderGuid'] = OrderData.OrderGuid;
      if (_.isEqual(selectedAppealReason.value, t('appealReasons.reason4'))) {
        orderObj['Primary_Reason'] = values.Primary_Reason_Written;
      } else {
        orderObj['Primary_Reason'] = selectedAppealReason.value;
      }
      orderObj['Description'] = values.Description;
      orderObj['Attachment'] = values.Attachment;
      orderObj['AVProof'] = 'NA';
      orderObj['MobileNo'] = `${selectedcountryCode}`;

      try {
        const { data } = await authenticatedInstance({
          url: '/p2p/add-appeal',
          method: 'POST',
          data: orderObj,
        });

        if (data.Status === 'Success') {
          triggerToast(data.Message, 'success');
          if (handleSuccess) {
            handleSuccess();
          }
          if (OrderData.OrderGuid) {
            getMyOrder(OrderData.OrderGuid);
          }
        } else if (data.Status === 'Error') {
          triggerToast(data.Message, 'error');
        }
      } catch (e) {}
    };

    const handleAppeal = () => {
      setIsAppealed(true);
    };

    const countryCode = inputValue => {
      if (inputValue === undefined) {
        return;
      }
      setSelectedCountryCode(`+${inputValue}`);
    };

    const setAppealEnable = data => {
      setIsAppealEnable(data);
    };

    return (
      <React.Fragment>
        {!isAppealed && (
          <Box pad="none">
            <Text margin={{ bottom: 'small' }}>{t('beforeAppealing')}</Text>
            <Box
              pad="small"
              margin={{ bottom: 'small' }}
              background="background-1"
            >
              <Columns className={styles.customizedColumns}>
                <Columns.Column size={1} className={styles.customizedColumn}>
                  <Box pad="small">
                    <ChatOption size="medium" />
                  </Box>
                </Columns.Column>
                <Columns.Column size={11} className={styles.customizedColumn}>
                  <Box pad="small">
                    <Text>{t('beforeAppealInstruction1')}</Text>
                  </Box>
                </Columns.Column>
              </Columns>
            </Box>
            <Box
              pad="small"
              margin={{ bottom: 'small' }}
              background="background-1"
            >
              <Columns className={styles.customizedColumns}>
                <Columns.Column size={1} className={styles.customizedColumn}>
                  <Box pad="small">
                    <Phone size="medium" />
                  </Box>
                </Columns.Column>
                <Columns.Column size={11} className={styles.customizedColumn}>
                  <Box pad="small">
                    <Text>{t('beforeAppealInstruction2')}</Text>
                    <a href={`tel:${OrderData.User.MobileNo}`}>
                      <Box
                        pad="none"
                        direction="row"
                        align="center"
                        margin={{ top: 'medium' }}
                      >
                        <Box
                          pad={{ right: 'xsmall' }}
                          className={styles.shortName}
                        >
                          <Phone size="small" color="white" />
                        </Box>
                        <Box pad={{ left: 'xsmall' }}>
                          {OrderData.User.MobileNo}
                        </Box>
                      </Box>
                    </a>
                  </Box>
                </Columns.Column>
              </Columns>
            </Box>
            <Box
              pad="small"
              margin={{ bottom: 'small' }}
              background="background-1"
            >
              <Columns className={styles.customizedColumns}>
                <Columns.Column size={1} className={styles.customizedColumn}>
                  <Box pad="small">
                    <Contact size="medium" />
                  </Box>
                </Columns.Column>
                <Columns.Column size={11} className={styles.customizedColumn}>
                  <Box pad="small">
                    <Text margin={{ bottom: 'small' }}>
                      {t('beforeAppealInstruction3')}
                    </Text>
                    <Box pad="none" direction="row" justify="end">
                      <Box pad={{ right: 'xsmall' }}>
                        <Button
                          color="primary"
                          primary={false}
                          fill="horizontal"
                          onClick={() => handleSuccess()}
                        >
                          {t('cancel')}
                        </Button>
                      </Box>
                      <Box pad={{ left: 'xsmall' }}>
                        <Button
                          color="primary"
                          fill="horizontal"
                          onClick={() => handleAppeal()}
                        >
                          {t('appeal')}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Columns.Column>
              </Columns>
            </Box>
          </Box>
        )}
        {isAppealed && (
          <Box pad="none">
            <Box
              pad="small"
              background="cookieConsentBackground"
              margin={{ bottom: 'medium' }}
            >
              <Box pad={{ horizontal: 'medium' }}>
                <ol className={styles.listStyling}>
                  <li>{t('appealWarning1')}</li>
                  <li>{t('appealWarning2')}</li>
                </ol>
              </Box>
            </Box>
            <Formik
              initialValues={{
                OrderId: '',
                Primary_Reason: '',
                Description: '',
                AVProof: '',
                MobileNo: '',
                Attachment: '',
                Primary_Reason_Written: '',
              }}
              validationSchema={appealValidationSchema()}
              onSubmit={(values, actions) => submitAppeal(values, actions)}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <Box pad="none">
                    <Box pad="none">
                      <Box pad="none" margin={{ bottom: 'small' }}>
                        <FormField
                          name="Primary_Reason"
                          label={t('reasonForAppeal.label')}
                        >
                          <Field
                            name="Primary_Reason"
                            component={SelectField}
                            options={appealReasons}
                            hasIcon={false}
                            persistentPlaceholder={false}
                            afterChange={value => {
                              handleAppealReasonChange(value);
                            }}
                            margin="none"
                          />

                          <ErrorMessage
                            name="Primary_Reason"
                            component="div"
                            style={{
                              marginTop: '-6px',
                              padding: '0px 12px',
                              lineHeight: '18px',
                            }}
                            className={styles.errorMessage}
                          />
                        </FormField>
                      </Box>
                      {isOtherReasons && (
                        <Box pad="none">
                          <FormField name="Primary_Reason_Written">
                            <TextField
                              placeholder={t('reasonForAppeal.placeholder')}
                            />
                          </FormField>
                        </Box>
                      )}
                    </Box>
                    <Box pad="none">
                      <FormField
                        name="Description"
                        label={t('description.label')}
                      >
                        <TextArea placeholder={t('description.placeholder')} />
                      </FormField>
                    </Box>

                    <S3Upload
                      name="Attachment"
                      label={t('uploadProof.label')}
                      placeholder={t('uploadProof.placeholder')}
                      isButtonDisabled={() => isButtonDisabled()}
                    />

                    <FormField name="MobileNo" label={t('phoneNumber')}>
                      <PhoneInput
                        name="MobileNo"
                        countryFieldName="country"
                        countryCode={countryCode}
                      />
                    </FormField>
                    <Box pad="none">
                      <Columns
                        className={styles.customizedColumns}
                        breakpoint="mobile"
                      >
                        <Columns.Column
                          size={6}
                          className={styles.customizedColumn}
                        >
                          <Button
                            color="primary"
                            primary={false}
                            fill="horizontal"
                            onClick={() => handleSuccess()}
                            margin={{ bottom: 'small' }}
                          >
                            {t('cancel')}
                          </Button>
                        </Columns.Column>
                        <Columns.Column
                          size={6}
                          className={styles.customizedColumn}
                        >
                          <Button
                            color="primary"
                            type="submit"
                            fill="horizontal"
                            disabled={!isAppealEnable}
                            margin={{ bottom: 'small' }}
                          >
                            <Box pad="none" direction="row" justify="center">
                              <Box pad="none">{t('appeal')}</Box>
                              {!isAppealEnable && (
                                <Box pad="none" margin={{ left: 'xsmall' }}>
                                  <AppealCountdown
                                    OrderData={OrderData}
                                    setAppealEnable={setAppealEnable}
                                  />
                                </Box>
                              )}
                            </Box>
                          </Button>
                        </Columns.Column>
                      </Columns>
                    </Box>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
        )}
      </React.Fragment>
    );
  }),
);

export const ConfirmReleaseModal = withRouter(
  withNamespaces()(
    ({
      t: translate,
      handleSuccess,
      OPMDetails,
      OPMSelected,
      OrderData,
      getMyOrder,
      profile,
    }) => {
      const t = nestedTranslate(translate, 'p2p.orderDetails');
      const [token, setToken] = useState('');

      const handleConfirmRelease = async values => {
        let orderObj = {};
        orderObj['OrderGuid'] = OrderData.OrderGuid;
        orderObj['OTP'] = values.OTP;
        orderObj['Token'] = token;

        try {
          const { data } = await authenticatedInstance({
            url: '/p2p/order-accept-payment',
            method: 'POST',
            data: orderObj,
          });

          if (data.Status === 'Success') {
            triggerToast(data.Message, 'success');
            if (handleSuccess) {
              handleSuccess();
            }
            getMyOrder();
          }
        } catch (e) {}
      };

      const requestCode = async () => {
        try {
          const { data } = await authenticatedInstance({
            url: '/p2p/request-otp',
            method: 'GET',
          });

          if (data.Status === 'Success') {
            triggerToast(data.Message, 'success');
            setToken(data.Data.Token);
          } else {
            triggerToast(data.Message, 'error');
          }
        } catch (e) {}
      };

      const validationSchema = () => {
        return Yup.object().shape({
          OTP: Yup.string()
            .trim(translate('forms.noSpacesAllowed.'))
            .min(6)
            .max(6)
            .required(),
          Agree: Yup.bool().oneOf([true], t('pleaseConfirmPayment')),
        });
      };

      return (
        <React.Fragment>
          <Box
            pad="small"
            margin={{ bottom: 'medium' }}
            background="cookieConsentBackground"
          >
            <Text size="small">{t('confirmReleaseWarning')}</Text>
          </Box>

          <Formik
            initialValues={{
              OTP: '',
              Agree: false,
            }}
            onSubmit={values => handleConfirmRelease(values)}
            validationSchema={validationSchema}
          >
            {({ values, setFieldValue }) => (
              <Form>
                <React.Fragment>
                  <Box pad="none" margin={{ bottom: 'small' }}>
                    <FormField name="OTP" label={t('phoneVerificationCode')}>
                      <TextField
                        type="text"
                        placeholder={t('phoneVerificationCode')}
                        margin={{ bottom: '0px' }}
                        addonEnd={{
                          content: t('getCode'),
                          background: 'primary',
                          onClick: () => requestCode(),
                        }}
                      />
                    </FormField>
                    <Box pad="none" margin={{ top: 'small' }}>
                      <Text size="xsmall">
                        {t('phoneInfo', profile.mobileNumber)}
                      </Text>
                    </Box>
                  </Box>
                  <Box pad="none" margin={{ bottom: 'small' }}>
                    <CheckBox name="Agree" label={t('checkConfirmMsg')} />
                  </Box>

                  <Box pad="none">
                    <Columns className={styles.customizedColumns}>
                      <Columns.Column
                        size={6}
                        className={styles.customizedColumn}
                      >
                        <Button
                          color="primary"
                          primary={false}
                          fill="horizontal"
                          onClick={() => handleSuccess()}
                          margin={{ bottom: 'small' }}
                        >
                          {t('cancel')}
                        </Button>
                      </Columns.Column>
                      <Columns.Column
                        size={6}
                        className={styles.customizedColumn}
                      >
                        <Button
                          color="primary"
                          type="submit"
                          fill="horizontal"
                          margin={{ bottom: 'small' }}
                        >
                          {t('confirmRelease')}
                        </Button>
                      </Columns.Column>
                    </Columns>
                  </Box>
                </React.Fragment>
              </Form>
            )}
          </Formik>
        </React.Fragment>
      );
    },
  ),
);

const AppealCountdown = ({ OrderData, setAppealEnable }) => {
  // initialize timeLeft with the seconds prop
  const [timeLeft, setTimeLeft] = useState(0);
  let intervalId = null;

  useEffect(() => {
    // component re-renders
    if (!_.isEmpty(OrderData)) {
      let paymentDate =
        new Date(OrderData.PaymentDate).getTime() +
        OrderData.PaymentTimeLimit * 60 * 1000;
      let tempCurrentDate = new Date().getTime();
      if (paymentDate > tempCurrentDate) {
        intervalId = setInterval(() => {
          let currentDate = new Date().getTime();
          if (paymentDate > currentDate) {
            let seconds = (paymentDate - currentDate) / 1000;
            setTimeLeft(seconds);
          } else {
            if (timeLeft < 1) {
              setAppealEnable(true);
              clearInterval(intervalId);
              return;
            }
          }
        }, 1000);
      } else {
        if (timeLeft < 1) {
          setAppealEnable(true);
          clearInterval(intervalId);
          return;
        }
      }
    }

    // clear interval on re-render to avoid memory leaks
    return () => clearInterval(intervalId);
    // add timeLeft as a dependency to re-retrun the effect
    // when we update it
  }, [timeLeft]);

  const countDown = () => {
    return (
      ('0' + Math.floor(timeLeft / (60 * 60))).slice(-2) +
      ':' +
      ('0' + Math.floor((timeLeft / 60) % 60)).slice(-2) +
      ':' +
      ('0' + Math.floor(timeLeft % 60)).slice(-2)
    );
  };

  return <React.Fragment>{countDown()}</React.Fragment>;
};

export const CancelOrder = withNamespaces()(({ t: translate, OrderGuid }) => {
  const t = nestedTranslate(translate, 'p2p.orderDetails');
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => setIsOpen(!isOpen);

  return (
    <React.Fragment>
      <Button
        color="primary"
        primary={false}
        fill="horizontal"
        onClick={() => toggleModal()}
      >
        {t('cancelOrder')}
      </Button>
      <Modal
        show={isOpen}
        toggleModal={toggleModal}
        pad="medium"
        width="large"
        heading={t('cancelOrder')}
      >
        <CancelOrderModal handleSuccess={toggleModal} OrderGuid={OrderGuid} />
      </Modal>
    </React.Fragment>
  );
});

export const TransferredNext = withNamespaces()(
  ({ t: translate, OPMDetails, OPMSelected, OrderData, getMyOrder }) => {
    const t = nestedTranslate(translate, 'p2p.orderDetails');
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => setIsOpen(!isOpen);

    return (
      <React.Fragment>
        <Button
          color="primary"
          type="submit"
          fill="horizontal"
          onClick={() => toggleModal()}
        >
          {t('transferredNext')}
        </Button>

        <Modal
          show={isOpen}
          toggleModal={toggleModal}
          pad="medium"
          width="large"
          heading="Confirm Successful Payment"
        >
          <ConfirmTransferred
            handleSuccess={toggleModal}
            OPMDetails={OPMDetails}
            OPMSelected={OPMSelected}
            OrderData={OrderData}
            getMyOrder={getMyOrder}
          />
        </Modal>
      </React.Fragment>
    );
  },
);

export const AppealPanel = withNamespaces()(
  ({ t: translate, OrderData, getMyOrder }) => {
    const t = nestedTranslate(translate, 'p2p.orderDetails');
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => setIsOpen(!isOpen);

    return (
      <React.Fragment>
        <Button
          color="primary"
          type="submit"
          primary={false}
          fill="horizontal"
          onClick={() => toggleModal()}
          margin={{ bottom: 'small' }}
        >
          {t('appeal')}
        </Button>

        <Modal
          show={isOpen}
          toggleModal={toggleModal}
          pad="medium"
          width="large"
        >
          <AppealModal
            handleSuccess={toggleModal}
            OrderData={OrderData}
            getMyOrder={getMyOrder}
          />
        </Modal>
      </React.Fragment>
    );
  },
);

export const ConfirmRelease = withNamespaces()(
  ({ t: translate, OrderData, getMyOrder, profile }) => {
    const t = nestedTranslate(translate, 'p2p.orderDetails');
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => setIsOpen(!isOpen);

    return (
      <React.Fragment>
        <Button
          color="primary"
          type="submit"
          fill="horizontal"
          onClick={() => toggleModal()}
          margin={{ bottom: 'small' }}
        >
          {t('confirmRelease')}
        </Button>

        <Modal
          show={isOpen}
          toggleModal={toggleModal}
          pad="medium"
          width="large"
          heading={t('confirmRelease')}
        >
          <ConfirmReleaseModal
            handleSuccess={toggleModal}
            OrderData={OrderData}
            getMyOrder={getMyOrder}
            profile={profile}
          />
        </Modal>
      </React.Fragment>
    );
  },
);

class OrderDetails extends Component {
  constructor() {
    super();
    this.handleTokenCountdown = null;
    this.state = {
      OrderData: {},
      messageData: [],
      OrderPaymentMethodName: [],
      OrderPaymentMethodDetails: {},
      OrderPaymentMehtodSelected: '',
      countDown: 0,
      paymentMethod: {},
      timeOutIn: 30000,
      messageIntervalStarted: false,
      guid: '',
      isChatIntervalStarted: false,
      getMyOrdersInterval: null,
      estimateOfferPrice: {},
      buttonDisabled: false,
      imagePreview: [],
      file: null,
      fileType: null,
      filePreview: null,
      isCountDownStarted: false,
    };
  }

  componentDidMount() {
    const { match } = this.props;
    if (match.params.id) {
      this.setState({ guid: match.params.id }, () => {
        this.getMyOrder();
        let intervalId = setInterval(() => {
          this.getMyOrder();
        }, 30000);

        this.setState({
          getMyOrdersInterval: intervalId,
        });
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.getMyOrdersInterval);
    clearInterval(this.handleTokenCountdown);
  }

  getMyOrder = async () => {
    const { guid } = this.state;
    try {
      const { data } = await authenticatedInstance({
        url: `/p2p/my-orders`,
        method: 'POST',
        data: {
          OrderGuid: guid,
        },
      });

      if (data.Status === 'Success') {
        if (_.size(data.Data) > 0) {
          if (
            _.isEqual(data.Data[0].CancelDate, null) &&
            _.isEqual(data.Data[0].PaymentDate, null)
          ) {
            if (data.Data[0].UserPaymentMethod) {
              let tempMethodName = [];
              let tempMethodDetails = [];
              data.Data[0].UserPaymentMethod.forEach(element => {
                if (element.MethodName) {
                  tempMethodName.push(element.MethodName);
                  tempMethodDetails.push(element);
                }
              });

              this.setState({
                OrderPaymentMethodDetails: tempMethodDetails[0],
                OrderPaymentMehtodSelected: tempMethodName[0],
                OrderPaymentMethodName: tempMethodName,
              });
            }
            this.setState({ OrderData: data.Data[0] }, () => {
              this.getMessage();
              if (!this.state.isCountDownStarted) {
                this.countDownFun();
              }
            });
          } else {
            if (!_.isEqual(data.Data[0].PaymentDate, null)) {
              data.Data[0].UserPaymentMethod.forEach(evl => {
                if (data.Data[0].MakerPaymentMethodId === evl.UserPaymentId) {
                  this.setState({ paymentMethod: evl });
                }
              });
            }

            this.setState({ OrderData: data.Data[0] }, () => {
              clearInterval(this.handleTokenCountdown);
            });
          }
          if (
            (!_.isEqual(data.Data[0].TakerCid, 0) &&
              _.isEqual(data.Data[0].TakerSide, 'SELL')) ||
            (!_.isEqual(data.Data[0].MakerCid, 0) &&
              _.isEqual(data.Data[0].MakerSide, 'SELL'))
          ) {
            this.getOfferPrice(data.Data[0]);
          }
        } else {
          this.props.history.push(`/p2p/my-orders`);
        }
      }
    } catch (e) {}
  };

  cancelAppeal = async OrderGuid => {
    try {
      const { data } = await authenticatedInstance({
        url: `/p2p/cancel-appeal`,
        method: 'POST',
        data: {
          OrderGuid: OrderGuid,
        },
      });

      if (data.Status === 'Success') {
        triggerToast(data.Message, 'success');
        this.getMyOrder();
      } else {
        triggerToast(data.Message, 'error');
      }
    } catch (e) {}
  };

  getOfferPrice = async data => {
    const initialData = {
      Side: 'SELL',
      Base: data.BaseCurrency,
      Quote: data.QuoteCurrency,
    };

    try {
      const { data } = await authenticatedInstance({
        url: '/p2p/estimate-offer-price',
        method: 'POST',
        data: initialData,
      });

      if (data.Status === 'Success') {
        this.setState({ estimateOfferPrice: data.Data });
      }
    } catch (e) {}
  };

  countDownFun = () => {
    const { OrderData } = this.state;
    if (_.isNull(OrderData.CancelDate) && _.isEqual(this.state.countDown, 0)) {
      this.handleTokenCountdown = setInterval(() => {
        let startDate = new Date();
        let endDate = new Date(OrderData.ExpiryDate);
        let seconds = (endDate.getTime() - startDate.getTime()) / 1000;
        this.setState({ countDown: seconds, isCountDownStarted: true }, () => {
          if (this.state.countDown < 1) {
            this.setState({ countDown: 0 });
            clearInterval(this.handleTokenCountdown);
            this.getMyOrder();
            return;
          }
        });
      }, 1000);
    }
  };

  async submitMessage(values, actions) {
    values['OrderId'] = this.state.OrderData.OrderId;
    try {
      const { data } = await authenticatedInstance({
        url: `/p2p/add-message`,
        method: 'POST',
        data: values,
      });

      if (data.Status === 'Success') {
        actions.resetForm();
        this.getMessage();
      }
    } catch (e) {}
  }

  getMessage = async () => {
    try {
      const { data } = await authenticatedInstance({
        url: `/p2p/messages/${this.state.OrderData.OrderId}`,
        method: 'GET',
      });

      if (data.Status === 'Success') {
        this.setState({ messageData: data.Data });
      }
    } catch (e) {}
  };

  chatValidationSchema() {
    return Yup.object().shape({
      Message: Yup.string().trim('No spaces allowed.'),
    });
  }

  handleMethodChange = value => {
    const { OrderData } = this.state;

    OrderData.UserPaymentMethod.forEach(element => {
      if (_.isEqual(value, element.MethodName)) {
        this.setState({
          OrderPaymentMehtodSelected: element.MethodName,
          OrderPaymentMethodDetails: element,
        });
      }
    });
  };

  countDownTimer() {
    const { countDown } = this.state;

    return (
      ('0' + Math.floor(countDown / (60 * 60))).slice(-2) +
      ':' +
      ('0' + Math.floor((countDown / 60) % 60)).slice(-2) +
      ':' +
      ('0' + Math.floor(countDown % 60)).slice(-2)
    );
  }

  isButtonDisabled = state => {
    this.setState({
      buttonDisabled: state,
    });
  };

  getFilePreview = (file, fileType, filePreview) => {
    this.setState({
      file: file,
      fileType: fileType,
      filePreview: filePreview,
    });
  };

  renderFilePreview = () => {
    const { file, fileType, filePreview } = this.state;
    const { t } = this.props;

    const imagePreview = !_.isEmpty(filePreview) && (
      <Box
        height="small"
        width="small"
        pad="small"
        background="background-3"
        margin={{ bottom: 'small' }}
      >
        <Image fit="contain" src={filePreview} />
      </Box>
    );
    const pdfPreview = !_.isEmpty(filePreview) && (
      <Box
        height="small"
        width="small"
        pad="small"
        background="background-3"
        margin={{ bottom: 'small' }}
      >
        <a href={filePreview} download={_.get(file, 'name')} target="blank">
          {t('forms.common.download')} {_.get(file, 'name')}
        </a>
      </Box>
    );

    return fileType === 'document' ? pdfPreview : imagePreview;
  };

  render() {
    const {
      OrderData,
      messageData,
      OrderPaymentMethodName,
      OrderPaymentMehtodSelected,
      OrderPaymentMethodDetails,
      paymentMethod,
      estimateOfferPrice,
      buttonDisabled,
    } = this.state;
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'p2p.orderDetails');

    return (
      <PageWrap>
        {!_.isEmpty(OrderData) && (
          <Box pad="medium" background="background-3">
            <Columns className={styles.customizedColumns}>
              <Columns.Column size={8} className={styles.customizedColumn}>
                {/* --------------- buyers view started --------------- */}
                {((!_.isEqual(OrderData.MakerCid, 0) &&
                  _.isEqual(OrderData.MakerSide, 'BUY')) ||
                  (!_.isEqual(OrderData.TakerCid, 0) &&
                    _.isEqual(OrderData.TakerSide, 'BUY'))) && (
                  <Box pad="none">
                    <Box pad="none" margin={{ bottom: 'small' }}>
                      <Columns className={styles.customizedColumns}>
                        <Columns.Column
                          size={4}
                          className={styles.customizedColumn}
                        >
                          <Box pad="small">
                            <Text size="large">
                              {t('buyer', OrderData.BaseCurrency)}
                            </Text>
                          </Box>
                        </Columns.Column>
                        <Columns.Column
                          size={8}
                          className={styles.customizedColumn}
                        >
                          <Box pad="none" direction="row" justify="end">
                            <Box
                              pad="small"
                              background="background-1"
                              align="start"
                            >
                              <Box
                                pad="none"
                                direction="row"
                                margin={{ bottom: 'xsmall' }}
                              >
                                <Box
                                  pad={{
                                    vertical: 'xxsmall',
                                    horizontal: 'xsmall',
                                  }}
                                  background="background-3"
                                >
                                  <Text size="xsmall">
                                    {`${t('createdTime')} : ${moment(
                                      OrderData.StartDate,
                                    ).format('YYYY-MM-DD HH:mm:ss Z')}`}
                                  </Text>
                                </Box>
                              </Box>
                              <Box pad="none" direction="row">
                                <Box
                                  pad={{
                                    vertical: 'xxsmall',
                                    horizontal: 'xsmall',
                                  }}
                                  background="background-3"
                                >
                                  <Text size="xsmall">{`${t('orderNumber')} : ${
                                    OrderData.OrderGuid
                                  }`}</Text>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </Columns.Column>
                      </Columns>
                    </Box>
                    <Box
                      pad="small"
                      margin={{ bottom: 'small' }}
                      background="background-1"
                    >
                      <Columns className={styles.customizedColumns}>
                        <Columns.Column className={styles.customizedColumn}>
                          <Box pad="small" width={{ min: '150px' }}>
                            <Box pad="none">
                              <Text size="medium">{t('amount')}</Text>
                            </Box>
                            <Box pad="none">
                              <Text size="large">{`${formatFiat(
                                OrderData.Price * OrderData.Size,
                                true,
                              )} ${OrderData.QuoteCurrency}`}</Text>
                            </Box>
                          </Box>
                        </Columns.Column>
                        <Columns.Column className={styles.customizedColumn}>
                          <Box pad="small" width={{ min: '150px' }}>
                            <Box pad="none">
                              <Text size="medium">{t('price')}</Text>
                            </Box>
                            <Box pad="none">
                              <Text size="large">{`${formatFiat(
                                OrderData.Price,
                                true,
                              )} ${OrderData.QuoteCurrency}`}</Text>
                            </Box>
                          </Box>
                        </Columns.Column>
                        <Columns.Column className={styles.customizedColumn}>
                          <Box pad="small" width={{ min: '150px' }}>
                            <Box pad="none">
                              <Text size="medium">{t('quantity')}</Text>
                            </Box>
                            <Box pad="none">
                              <Text size="large">{`${OrderData.Size} ${OrderData.BaseCurrency}`}</Text>
                            </Box>
                          </Box>
                        </Columns.Column>
                      </Columns>
                    </Box>
                    <Box pad="none" margin={{ bottom: 'small' }}>
                      <Columns
                        className={styles.customizedColumns}
                        breakpoint="mobile"
                      >
                        <Columns.Column className={styles.customizedColumn}>
                          <Box
                            pad="small"
                            background="background-1"
                            margin={{ bottom: 'small' }}
                            width={{ min: '150px' }}
                          >
                            <Box pad="none">
                              <Text
                                size="small"
                                textAlign="center"
                                margin={{ bottom: 'small' }}
                              >
                                {t('youPaid')}
                              </Text>
                              <Box
                                pad="none"
                                height="24px"
                                align="center"
                                justify="center"
                              >
                                {!_.isEqual(OrderData.PaymentDate, null) && (
                                  <StatusGood size="medium" color="green" />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Columns.Column>
                        <Columns.Column className={styles.customizedColumn}>
                          <Box
                            pad="small"
                            background="background-1"
                            margin={{ bottom: 'small' }}
                            width={{ min: '150px' }}
                          >
                            <Box pad="none">
                              <Text
                                size="small"
                                textAlign="center"
                                margin={{ bottom: 'small' }}
                              >
                                {t('youReceived')}
                              </Text>
                              <Box
                                pad="none"
                                height="24px"
                                align="center"
                                justify="center"
                              >
                                {!_.isEqual(OrderData.ConfirmDate, null) && (
                                  <StatusGood size="medium" color="green" />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Columns.Column>
                        <Columns.Column className={styles.customizedColumn}>
                          <Box
                            pad="small"
                            background="background-1"
                            margin={{ bottom: 'small' }}
                            width={{ min: '150px' }}
                          >
                            <Box pad="none">
                              <Text
                                size="small"
                                textAlign="center"
                                margin={{ bottom: 'small' }}
                              >
                                {t('orderCancelled')}
                              </Text>
                              <Box
                                pad="none"
                                height="24px"
                                align="center"
                                justify="center"
                              >
                                {!_.isEqual(OrderData.CancelDate, null) && (
                                  <StatusGood size="medium" color="red" />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Columns.Column>
                        <Columns.Column className={styles.customizedColumn}>
                          <Box
                            pad="small"
                            background="background-1"
                            margin={{ bottom: 'small' }}
                            width={{ min: '150px' }}
                          >
                            <Box pad="none">
                              <Text
                                size="small"
                                textAlign="center"
                                margin={{ bottom: 'small' }}
                              >
                                {t('youAppealed')}
                              </Text>
                              <Box
                                pad="none"
                                height="24px"
                                align="center"
                                justify="center"
                              >
                                {!_.isEqual(OrderData.Appeal, null) && (
                                  <StatusGood size="medium" color="green" />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Columns.Column>
                        <Columns.Column className={styles.customizedColumn}>
                          <Box
                            pad="small"
                            background="background-1"
                            margin={{ bottom: 'small' }}
                            width={{ min: '150px' }}
                          >
                            <Box pad="none">
                              <Text
                                size="small"
                                textAlign="center"
                                margin={{ bottom: 'small' }}
                              >
                                {t('appealStatus')}
                              </Text>
                              <Box
                                pad="none"
                                height="24px"
                                align="center"
                                justify="center"
                              >
                                {!_.isEqual(OrderData.Appeal, null) && (
                                  <Box pad="none">
                                    {_.isEqual(
                                      OrderData.Appeal.Status,
                                      false,
                                    ) && (
                                      <Text size="medium" textAlign="center">
                                        {t('open')}
                                      </Text>
                                    )}
                                    {_.isEqual(OrderData.Appeal.Status, true) &&
                                      _.isEqual(
                                        OrderData.Appeal.UserCancelTimestamp,
                                        null,
                                      ) && (
                                        <Text size="medium" textAlign="center">
                                          {t('closed')}
                                        </Text>
                                      )}
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Columns.Column>
                      </Columns>
                    </Box>
                    <Box
                      pad="medium"
                      margin={{ bottom: 'small' }}
                      background="background-1"
                    >
                      {_.isEqual(OrderData.PaymentDate, null) &&
                        _.isEqual(OrderData.ConfirmDate, null) &&
                        _.isEqual(OrderData.CancelDate, null) && (
                          <Box pad="none">
                            <Box pad="none" margin={{ bottom: 'small' }}>
                              <Text>{t('buyInstruction1')}</Text>
                            </Box>
                            <Box
                              pad="small"
                              background="cookieConsentBackground"
                              margin={{ bottom: 'medium' }}
                            >
                              <Paragraph>{t('buyWarning1')}</Paragraph>
                            </Box>
                            <Columns className={styles.customizedColumns}>
                              <Columns.Column
                                size={4}
                                className={styles.customizedColumn}
                              >
                                <Box
                                  pad="small"
                                  background="background-3"
                                  margin={{ bottom: 'medium' }}
                                >
                                  <RadioButtonGroup
                                    name="IsActive"
                                    direction="column"
                                    options={OrderPaymentMethodName}
                                    value={OrderPaymentMehtodSelected}
                                    onChange={this.handleMethodChange}
                                  />
                                </Box>
                              </Columns.Column>
                              <Columns.Column
                                size={8}
                                className={styles.customizedColumn}
                              >
                                <Box
                                  pad="small"
                                  background="background-3"
                                  margin={{ bottom: 'medium' }}
                                >
                                  {OrderPaymentMethodDetails.PaymentJSON && (
                                    <React.Fragment>
                                      {Object.keys(
                                        JSON.parse(
                                          OrderPaymentMethodDetails.PaymentJSON,
                                        ),
                                      ).map(key => (
                                        <div key={key}>
                                          <Text size="xsmall" weight="bold">
                                            {key}
                                          </Text>
                                          :{' '}
                                          <Text>
                                            {
                                              JSON.parse(
                                                OrderPaymentMethodDetails.PaymentJSON,
                                              )[key]
                                            }
                                          </Text>
                                        </div>
                                      ))}
                                    </React.Fragment>
                                  )}
                                </Box>
                              </Columns.Column>
                            </Columns>

                            <Box pad="none" margin={{ bottom: 'small' }}>
                              <Text size="medium" color="orange">
                                {t('paymentToBeMade')} {this.countDownTimer()}
                              </Text>
                            </Box>
                            <Box pad="none" margin={{ bottom: 'small' }}>
                              <Text size="small">
                                {t(
                                  'buyInstruction2',
                                  OrderData.PaymentTimeLimit.toString(),
                                )}
                              </Text>
                            </Box>
                            <Box
                              pad="none"
                              margin={{ top: 'medium', bottom: 'medium' }}
                            >
                              <Columns className={styles.customizedColumns}>
                                <Columns.Column
                                  size={6}
                                  className={styles.customizedColumn}
                                >
                                  <Box pad="none" margin={{ bottom: 'small' }}>
                                    <TransferredNext
                                      OPMDetails={OrderPaymentMethodDetails}
                                      OPMSelected={OrderPaymentMehtodSelected}
                                      OrderData={OrderData}
                                      getMyOrder={this.getMyOrder}
                                    />
                                  </Box>
                                </Columns.Column>
                                <Columns.Column
                                  size={6}
                                  className={styles.customizedColumn}
                                >
                                  <Box pad="none" margin={{ bottom: 'small' }}>
                                    <CancelOrder
                                      OrderGuid={OrderData.OrderGuid}
                                      getMyOrder={this.getMyOrder}
                                    />
                                  </Box>
                                </Columns.Column>
                              </Columns>
                            </Box>
                          </Box>
                        )}

                      {!_.isEqual(OrderData.PaymentDate, null) &&
                        _.isEqual(OrderData.ConfirmDate, null) &&
                        _.isEqual(OrderData.CancelDate, null) && (
                          <Box pad="none">
                            {!_.isEqual(OrderData.Appeal, null) && (
                              <React.Fragment>
                                {_.isEqual(OrderData.Appeal.Status, true) && (
                                  <Box
                                    pad="medium"
                                    margin={{ bottom: 'medium' }}
                                    background="background-3"
                                  >
                                    {_.isEqual(
                                      OrderData.Appeal.UserCancelTimestamp,
                                      null,
                                    ) && (
                                      <React.Fragment>
                                        <Box
                                          pad="none"
                                          margin={{ bottom: 'small' }}
                                        >
                                          {!_.isEqual(
                                            OrderData.Appeal.ResolvedComments,
                                            null,
                                          ) && (
                                            <Text
                                              size="large"
                                              textAlign="center"
                                            >
                                              {OrderData.Appeal.ResolvedComments.toUpperCase()}
                                            </Text>
                                          )}
                                        </Box>
                                        <Box pad="none">
                                          <Text size="small" textAlign="center">
                                            {`${t('appealResolvedOn')} ${moment(
                                              OrderData.Appeal.ResolutionDate,
                                            ).format('YYYY-MM-DD HH:mm:ss Z')}`}
                                          </Text>
                                          {!_.isEqual(
                                            OrderData.Appeal.ResolutionFavoring,
                                            null,
                                          ) && (
                                            <Text
                                              size="small"
                                              textAlign="center"
                                            >
                                              {t(
                                                'appealResolvedOnFavour',
                                                OrderData.Appeal
                                                  .ResolutionFavoring,
                                              )}
                                            </Text>
                                          )}
                                        </Box>
                                      </React.Fragment>
                                    )}
                                    {!_.isEqual(
                                      OrderData.Appeal.UserCancelTimestamp,
                                      null,
                                    ) && (
                                      <React.Fragment>
                                        <Box pad="none">
                                          <Text
                                            size="large"
                                            textAlign="center"
                                            margin={{ bottom: 'small' }}
                                          >
                                            {t('appealcancelled')}
                                          </Text>
                                          <Text size="small" textAlign="center">
                                            {`${t(
                                              'appealCancelledOn',
                                            )} ${moment(
                                              OrderData.Appeal
                                                .UserCancelTimestamp,
                                            ).format('YYYY-MM-DD HH:mm:ss Z')}`}
                                          </Text>
                                        </Box>
                                      </React.Fragment>
                                    )}
                                  </Box>
                                )}
                                {_.isEqual(OrderData.Appeal.Status, false) && (
                                  <Box pad="none" margin={{ bottom: 'small' }}>
                                    <Button
                                      color="primary"
                                      type="submit"
                                      primary={false}
                                      fill="horizontal"
                                      onClick={() =>
                                        this.cancelAppeal(OrderData.OrderGuid)
                                      }
                                      margin={{ bottom: 'small' }}
                                    >
                                      {t('cancelAppeal')}
                                    </Button>
                                  </Box>
                                )}
                              </React.Fragment>
                            )}
                            <Box
                              pad="medium"
                              background="background-3"
                              margin={{ bottom: 'medium' }}
                            >
                              <Box pad="none" margin={{ bottom: 'small' }}>
                                <Text size="medium">
                                  {t('paidToAccountBelow')}:
                                </Text>
                              </Box>
                              <Box
                                pad="medium"
                                margin={{ bottom: 'small' }}
                                background="background-1"
                                direction="row"
                                gap="medium"
                              >
                                <Box pad="none">
                                  <Box
                                    pad={{ horizontal: 'small' }}
                                    margin={{ bottom: 'small' }}
                                    round={false}
                                    border={{
                                      color: 'brand',
                                      size: 'small',
                                      side: 'left',
                                    }}
                                  >
                                    <Text size="medium">
                                      {paymentMethod.MethodName}
                                    </Text>
                                  </Box>
                                </Box>
                                <Box pad="none">
                                  {Object.keys(
                                    JSON.parse(paymentMethod.PaymentJSON),
                                  ).map(key => (
                                    <div key={key}>
                                      <Box
                                        pad="none"
                                        margin={{ bottom: 'small' }}
                                      >
                                        <Box pad="none">
                                          <Text size="small" weight="bold">
                                            {key}
                                          </Text>
                                        </Box>
                                        <Box pad="none">
                                          <Text size="small">
                                            {
                                              JSON.parse(
                                                paymentMethod.PaymentJSON,
                                              )[key]
                                            }
                                          </Text>
                                        </Box>
                                      </Box>
                                    </div>
                                  ))}
                                </Box>
                              </Box>
                            </Box>
                            {_.isEqual(OrderData.Appeal, null) && (
                              <Box pad="none" margin={{ bottom: 'medium' }}>
                                <Columns
                                  style={{
                                    marginTop: '0px',
                                    marginBottom: '0px',
                                  }}
                                >
                                  <Columns.Column
                                    size={6}
                                    className={styles.colsPad}
                                  >
                                    <AppealPanel
                                      OrderData={OrderData}
                                      getMyOrder={this.getMyOrder}
                                    />
                                  </Columns.Column>
                                  <Columns.Column
                                    size={6}
                                    className={styles.colsPad}
                                  >
                                    <Box
                                      pad="none"
                                      margin={{ bottom: 'small' }}
                                    >
                                      <CancelOrder
                                        OrderGuid={OrderData.OrderGuid}
                                        getMyOrder={this.getMyOrder}
                                      />
                                    </Box>
                                  </Columns.Column>
                                </Columns>
                              </Box>
                            )}
                          </Box>
                        )}

                      {!_.isEqual(OrderData.CancelDate, null) && (
                        <Box pad="none">
                          <Box
                            pad="medium"
                            background="background-3"
                            margin={{ bottom: 'medium' }}
                          >
                            <Box
                              pad="none"
                              margin={{ bottom: 'small' }}
                              align="center"
                              justify="center"
                            >
                              <Text size="large" textAlign="center" color="red">
                                {t('orderCancelReason')}
                              </Text>
                            </Box>
                            <Box
                              pad="none"
                              margin={{ bottom: 'small' }}
                              align="center"
                              justify="center"
                            >
                              <Text size="medium" textAlign="center">
                                {OrderData.CancelComments}
                              </Text>
                            </Box>
                          </Box>
                        </Box>
                      )}

                      {!_.isEqual(OrderData.ConfirmDate, null) &&
                        _.isEqual(OrderData.CancelDate, null) && (
                          <Box pad="none">
                            <Box
                              pad="medium"
                              background="background-3"
                              margin={{ bottom: 'medium' }}
                            >
                              <Box
                                pad="none"
                                margin={{ bottom: 'small' }}
                                align="center"
                                justify="center"
                              >
                                <StatusGood size="large" color="green" />
                              </Box>
                              <Box
                                pad="none"
                                margin={{ bottom: 'small' }}
                                align="center"
                                justify="center"
                              >
                                <Text size="large" textAlign="center">
                                  {t('orderCompleted')}
                                </Text>
                              </Box>
                            </Box>
                          </Box>
                        )}
                    </Box>
                  </Box>
                )}
                {/* --------------- buyers view finished --------------- */}

                {/* --------------- sellers view started --------------- */}
                {((!_.isEqual(OrderData.TakerCid, 0) &&
                  _.isEqual(OrderData.TakerSide, 'SELL')) ||
                  (!_.isEqual(OrderData.MakerCid, 0) &&
                    _.isEqual(OrderData.MakerSide, 'SELL'))) && (
                  <Box pad="none">
                    <Box pad="none" margin={{ bottom: 'small' }}>
                      <Columns className={styles.customizedColumns}>
                        <Columns.Column
                          size={4}
                          className={styles.customizedColumn}
                        >
                          <Box pad="small">
                            <Text size="large">
                              {t('seller', OrderData.BaseCurrency)}
                            </Text>
                          </Box>
                        </Columns.Column>
                        <Columns.Column
                          size={8}
                          className={styles.customizedColumn}
                        >
                          <Box pad="none" direction="row" justify="end">
                            <Box
                              pad="small"
                              background="background-1"
                              align="start"
                            >
                              <Box
                                pad="none"
                                direction="row"
                                margin={{ bottom: 'xsmall' }}
                              >
                                <Box
                                  pad={{
                                    vertical: 'xxsmall',
                                    horizontal: 'xsmall',
                                  }}
                                  background="background-3"
                                >
                                  <Text size="xsmall">
                                    {`${t('createdTime')} : ${moment(
                                      OrderData.StartDate,
                                    ).format('YYYY-MM-DD HH:mm:ss Z')}`}
                                  </Text>
                                </Box>
                              </Box>
                              <Box pad="none" direction="row">
                                <Box
                                  pad={{
                                    vertical: 'xxsmall',
                                    horizontal: 'xsmall',
                                  }}
                                  background="background-3"
                                >
                                  <Text size="xsmall">{`${t('orderNumber')} : ${
                                    OrderData.OrderGuid
                                  }`}</Text>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </Columns.Column>
                      </Columns>
                    </Box>
                    <Box
                      pad="small"
                      margin={{ bottom: 'small' }}
                      background="background-1"
                    >
                      <Columns className={styles.customizedColumns}>
                        <Columns.Column className={styles.customizedColumn}>
                          <Box pad="small" width={{ min: '150px' }}>
                            <Box pad="none">
                              <Text size="medium">{t('amount')}</Text>
                            </Box>
                            <Box pad="none">
                              <Text size="large">{`${formatFiat(
                                OrderData.Price * OrderData.Size,
                                true,
                              )} ${OrderData.QuoteCurrency}`}</Text>
                            </Box>
                          </Box>
                        </Columns.Column>
                        <Columns.Column className={styles.customizedColumn}>
                          <Box pad="small" width={{ min: '150px' }}>
                            <Box pad="none">
                              <Text size="medium">{t('price')}</Text>
                            </Box>
                            <Box pad="none">
                              <Text size="large">{`${formatFiat(
                                OrderData.Price,
                                true,
                              )} ${OrderData.QuoteCurrency}`}</Text>
                            </Box>
                          </Box>
                        </Columns.Column>
                        <Columns.Column className={styles.customizedColumn}>
                          <Box pad="small" width={{ min: '150px' }}>
                            <Box pad="none">
                              <Text size="medium">{t('quantity')}</Text>
                            </Box>
                            <Box pad="none">
                              <Text size="large">{`${OrderData.Size} ${OrderData.BaseCurrency}`}</Text>
                            </Box>
                          </Box>
                        </Columns.Column>
                        <Columns.Column className={styles.customizedColumn}>
                          <Box pad="small" width={{ min: '150px' }}>
                            <Box pad="none">
                              <Text size="medium">{t('fee')}</Text>
                            </Box>
                            <Box pad="none">
                              <Text size="large">{`${estimateOfferPrice.MakerFee} ${OrderData.BaseCurrency}`}</Text>
                            </Box>
                          </Box>
                        </Columns.Column>
                      </Columns>
                    </Box>
                    <Box pad="none" margin={{ bottom: 'small' }}>
                      <Columns
                        className={styles.customizedColumns}
                        breakpoint="mobile"
                      >
                        <Columns.Column className={styles.customizedColumn}>
                          <Box
                            pad="small"
                            background="background-1"
                            margin={{ bottom: 'small' }}
                            width={{ min: '150px' }}
                          >
                            <Box pad="none">
                              <Text
                                size="small"
                                textAlign="center"
                                margin={{ bottom: 'small' }}
                              >
                                {t('youReceived')}
                              </Text>
                              <Box
                                pad="none"
                                height="24px"
                                align="center"
                                justify="center"
                              >
                                {!_.isEqual(OrderData.PaymentDate, null) && (
                                  <StatusGood size="medium" color="green" />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Columns.Column>
                        <Columns.Column className={styles.customizedColumn}>
                          <Box
                            pad="small"
                            background="background-1"
                            margin={{ bottom: 'small' }}
                            width={{ min: '150px' }}
                          >
                            <Box pad="none">
                              <Text
                                size="small"
                                textAlign="center"
                                margin={{ bottom: 'small' }}
                              >
                                {t('youPaid')}
                              </Text>
                              <Box
                                pad="none"
                                height="24px"
                                align="center"
                                justify="center"
                              >
                                {!_.isEqual(OrderData.ConfirmDate, null) && (
                                  <StatusGood size="medium" color="green" />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Columns.Column>
                        <Columns.Column className={styles.customizedColumn}>
                          <Box
                            pad="small"
                            background="background-1"
                            margin={{ bottom: 'small' }}
                            width={{ min: '150px' }}
                          >
                            <Box pad="none">
                              <Text
                                size="small"
                                textAlign="center"
                                margin={{ bottom: 'small' }}
                              >
                                {t('orderCancelled')}
                              </Text>
                              <Box
                                pad="none"
                                height="24px"
                                align="center"
                                justify="center"
                              >
                                {!_.isEqual(OrderData.CancelDate, null) && (
                                  <StatusGood size="medium" color="red" />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Columns.Column>
                        <Columns.Column className={styles.customizedColumn}>
                          <Box
                            pad="small"
                            background="background-1"
                            margin={{ bottom: 'small' }}
                            width={{ min: '150px' }}
                          >
                            <Box pad="none">
                              <Text
                                size="small"
                                textAlign="center"
                                margin={{ bottom: 'small' }}
                              >
                                {t('youAppealed')}
                              </Text>
                              <Box
                                pad="none"
                                height="24px"
                                align="center"
                                justify="center"
                              >
                                {!_.isEqual(OrderData.Appeal, null) && (
                                  <StatusGood size="medium" color="green" />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Columns.Column>
                        <Columns.Column className={styles.customizedColumn}>
                          <Box
                            pad="small"
                            background="background-1"
                            margin={{ bottom: 'small' }}
                            width={{ min: '150px' }}
                          >
                            <Box pad="none">
                              <Text
                                size="small"
                                textAlign="center"
                                margin={{ bottom: 'small' }}
                              >
                                {t('appealStatus')}
                              </Text>
                              <Box
                                pad="none"
                                height="24px"
                                align="center"
                                justify="center"
                              >
                                {!_.isEqual(OrderData.Appeal, null) && (
                                  <Box pad="none">
                                    {_.isEqual(
                                      OrderData.Appeal.Status,
                                      false,
                                    ) && (
                                      <Text size="medium" textAlign="center">
                                        {t('open')}
                                      </Text>
                                    )}
                                    {_.isEqual(OrderData.Appeal.Status, true) &&
                                      _.isEqual(
                                        OrderData.Appeal.UserCancelTimestamp,
                                        null,
                                      ) && (
                                        <Text size="medium" textAlign="center">
                                          {t('closed')}
                                        </Text>
                                      )}
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Columns.Column>
                      </Columns>
                    </Box>
                    <Box
                      pad="medium"
                      margin={{ bottom: 'small' }}
                      background="background-1"
                    >
                      {_.isEqual(OrderData.PaymentDate, null) &&
                        _.isEqual(OrderData.ConfirmDate, null) &&
                        _.isEqual(OrderData.CancelDate, null) && (
                          <Box pad="none">
                            <Box pad="none" margin={{ bottom: 'small' }}>
                              <Text size="medium">{t('myPaymentMethod')}</Text>
                            </Box>
                            <Columns className={styles.customizedColumns}>
                              <Columns.Column
                                size={4}
                                className={styles.customizedColumn}
                              >
                                <Box
                                  pad="small"
                                  background="background-3"
                                  margin={{ bottom: 'medium' }}
                                >
                                  <RadioButtonGroup
                                    name="IsActive"
                                    direction="column"
                                    options={OrderPaymentMethodName}
                                    value={OrderPaymentMehtodSelected}
                                    onChange={this.handleMethodChange}
                                  />
                                </Box>
                              </Columns.Column>
                              <Columns.Column
                                size={8}
                                className={styles.customizedColumn}
                              >
                                <Box
                                  pad="small"
                                  background="background-3"
                                  margin={{ bottom: 'medium' }}
                                >
                                  {OrderPaymentMethodDetails.PaymentJSON && (
                                    <React.Fragment>
                                      {Object.keys(
                                        JSON.parse(
                                          OrderPaymentMethodDetails.PaymentJSON,
                                        ),
                                      ).map(key => (
                                        <div key={key}>
                                          <Text size="xsmall" weight="bold">
                                            {key}
                                          </Text>
                                          :{' '}
                                          <Text>
                                            {
                                              JSON.parse(
                                                OrderPaymentMethodDetails.PaymentJSON,
                                              )[key]
                                            }
                                          </Text>
                                        </div>
                                      ))}
                                    </React.Fragment>
                                  )}
                                </Box>
                              </Columns.Column>
                            </Columns>

                            <Box pad="none" margin={{ bottom: 'medium' }}>
                              <Box pad="none" margin={{ bottom: 'small' }}>
                                <Text size="medium" color="orange">
                                  {`${t(
                                    'paymentToBeMadeByBuyer',
                                  )} ${this.countDownTimer()}`}
                                </Text>
                              </Box>
                              <Box pad="none" margin={{ bottom: 'small' }}>
                                <Text size="small">
                                  {t('sellInstruction1')}
                                </Text>
                              </Box>
                            </Box>
                          </Box>
                        )}

                      {!_.isEqual(OrderData.PaymentDate, null) &&
                        _.isEqual(OrderData.ConfirmDate, null) &&
                        _.isEqual(OrderData.CancelDate, null) && (
                          <Box pad="none">
                            {!_.isEqual(OrderData.Appeal, null) && (
                              <React.Fragment>
                                {_.isEqual(OrderData.Appeal.Status, true) && (
                                  <Box
                                    pad="medium"
                                    margin={{ bottom: 'medium' }}
                                    background="background-3"
                                  >
                                    {_.isEqual(
                                      OrderData.Appeal.UserCancelTimestamp,
                                      null,
                                    ) && (
                                      <React.Fragment>
                                        <Box
                                          pad="none"
                                          margin={{ bottom: 'small' }}
                                        >
                                          {!_.isEqual(
                                            OrderData.Appeal.ResolvedComments,
                                            null,
                                          ) && (
                                            <Text
                                              size="large"
                                              textAlign="center"
                                            >
                                              {OrderData.Appeal.ResolvedComments.toUpperCase()}
                                            </Text>
                                          )}
                                        </Box>
                                        <Box pad="none">
                                          <Text size="small" textAlign="center">
                                            {`${t('appealResolvedOn')} ${moment(
                                              OrderData.Appeal.ResolutionDate,
                                            ).format('YYYY-MM-DD HH:mm:ss Z')}`}
                                          </Text>
                                          {!_.isEqual(
                                            OrderData.Appeal.ResolutionFavoring,
                                            null,
                                          ) && (
                                            <Text
                                              size="small"
                                              textAlign="center"
                                            >
                                              {t(
                                                'appealResolvedOnFavour',
                                                OrderData.Appeal
                                                  .ResolutionFavoring,
                                              )}
                                            </Text>
                                          )}
                                        </Box>
                                      </React.Fragment>
                                    )}
                                    {!_.isEqual(
                                      OrderData.Appeal.UserCancelTimestamp,
                                      null,
                                    ) && (
                                      <React.Fragment>
                                        <Box pad="none">
                                          <Text
                                            size="large"
                                            textAlign="center"
                                            margin={{ bottom: 'small' }}
                                          >
                                            {t('appealcancelled')}
                                          </Text>
                                          <Text size="small" textAlign="center">
                                            {`${t(
                                              'appealCancelledOn',
                                            )} ${moment(
                                              OrderData.Appeal
                                                .UserCancelTimestamp,
                                            ).format('YYYY-MM-DD HH:mm:ss Z')}`}
                                          </Text>
                                        </Box>
                                      </React.Fragment>
                                    )}
                                  </Box>
                                )}
                                {_.isEqual(OrderData.Appeal.Status, false) && (
                                  <Box pad="none" margin={{ bottom: 'small' }}>
                                    <Button
                                      color="primary"
                                      type="submit"
                                      primary={false}
                                      fill="horizontal"
                                      onClick={() =>
                                        this.cancelAppeal(OrderData.OrderGuid)
                                      }
                                      margin={{ bottom: 'small' }}
                                    >
                                      {t('cancelAppeal')}
                                    </Button>
                                  </Box>
                                )}
                              </React.Fragment>
                            )}
                            <Box
                              pad="medium"
                              background="background-3"
                              margin={{ bottom: 'medium' }}
                            >
                              <Box pad="none" margin={{ bottom: 'small' }}>
                                <Text size="medium">
                                  {t('paymentConfirmHeading')}
                                </Text>
                              </Box>
                              <Box
                                pad="medium"
                                margin={{ bottom: 'small' }}
                                background="background-1"
                                direction="row"
                                gap="medium"
                              >
                                <Box pad="none">
                                  <Box
                                    pad={{ horizontal: 'small' }}
                                    margin={{ bottom: 'small' }}
                                    round={false}
                                    border={{
                                      color: 'brand',
                                      size: 'small',
                                      side: 'left',
                                    }}
                                  >
                                    <Text size="medium">
                                      {paymentMethod.MethodName}
                                    </Text>
                                  </Box>
                                </Box>
                                <Box pad="none">
                                  {Object.keys(
                                    JSON.parse(paymentMethod.PaymentJSON),
                                  ).map(key => (
                                    <div key={key}>
                                      <Box
                                        pad="none"
                                        margin={{ bottom: 'small' }}
                                      >
                                        <Box pad="none">
                                          <Text size="small" weight="bold">
                                            {key}
                                          </Text>
                                        </Box>
                                        <Box pad="none">
                                          <Text size="small">
                                            {
                                              JSON.parse(
                                                paymentMethod.PaymentJSON,
                                              )[key]
                                            }
                                          </Text>
                                        </Box>
                                      </Box>
                                    </div>
                                  ))}
                                </Box>
                              </Box>
                            </Box>
                            {_.isEqual(OrderData.Appeal, null) && (
                              <Box pad="none" margin={{ bottom: 'medium' }}>
                                <Box pad="none" margin={{ bottom: 'small' }}>
                                  <Text size="medium" color="orange">
                                    {t('toBeReleased')}
                                  </Text>
                                </Box>
                                <Box pad="none" margin={{ bottom: 'small' }}>
                                  <Text size="small">
                                    {t(
                                      'sellInstruction2',
                                      OrderData.PaymentTimeLimit.toString(),
                                    )}
                                  </Text>
                                </Box>
                                <Box
                                  pad="none"
                                  margin={{ top: 'medium', bottom: 'medium' }}
                                >
                                  <Columns className={styles.customizedColumns}>
                                    <Columns.Column
                                      size={6}
                                      className={styles.customizedColumn}
                                    >
                                      <ConfirmRelease
                                        OPMDetails={OrderPaymentMethodDetails}
                                        OPMSelected={OrderPaymentMehtodSelected}
                                        OrderData={OrderData}
                                        getMyOrder={this.getMyOrder}
                                        profile={this.props.profile}
                                      />
                                    </Columns.Column>
                                    <Columns.Column
                                      size={6}
                                      className={styles.customizedColumn}
                                    >
                                      <AppealPanel
                                        OrderData={OrderData}
                                        getMyOrder={this.getMyOrder}
                                      />
                                    </Columns.Column>
                                  </Columns>
                                </Box>
                              </Box>
                            )}
                          </Box>
                        )}

                      {!_.isEqual(OrderData.CancelDate, null) && (
                        <Box pad="none">
                          <Box
                            pad="medium"
                            background="background-3"
                            margin={{ bottom: 'medium' }}
                          >
                            <Box
                              pad="none"
                              margin={{ bottom: 'small' }}
                              align="center"
                              justify="center"
                            >
                              <Text size="large" textAlign="center" color="red">
                                {t('orderCancelReason')}
                              </Text>
                            </Box>
                            <Box
                              pad="none"
                              margin={{ bottom: 'small' }}
                              align="center"
                              justify="center"
                            >
                              <Text size="medium" textAlign="center">
                                {OrderData.CancelComments}
                              </Text>
                            </Box>
                          </Box>
                        </Box>
                      )}

                      {!_.isEqual(OrderData.ConfirmDate, null) &&
                        _.isEqual(OrderData.CancelDate, null) && (
                          <Box pad="none">
                            <Box
                              pad="medium"
                              background="background-3"
                              margin={{ bottom: 'medium' }}
                            >
                              <Box
                                pad="none"
                                margin={{ bottom: 'small' }}
                                align="center"
                                justify="center"
                              >
                                <StatusGood size="large" color="green" />
                              </Box>
                              <Box
                                pad="none"
                                margin={{ bottom: 'small' }}
                                align="center"
                                justify="center"
                              >
                                <Text size="large" textAlign="center">
                                  {t('orderCompleted')}
                                </Text>
                              </Box>
                            </Box>
                          </Box>
                        )}
                    </Box>
                  </Box>
                )}
                {/* --------------- sellers view finished --------------- */}

                <Box
                  pad="medium"
                  background="background-1"
                  margin={{ bottom: 'small' }}
                >
                  <Text size="small">{t('tips.title')}</Text>
                  <Box pad="small">
                    <ol>
                      <li>{t('tips.tip1')}</li>
                      <li>{t('tips.tip2')}</li>
                      <li>{t('tips.tip3')}</li>
                      <li>{t('tips.tip4')}</li>
                      <li>{t('tips.tip5')}</li>
                    </ol>
                  </Box>
                </Box>
              </Columns.Column>
              <Columns.Column size={4} className={styles.customizedColumn}>
                <Box
                  pad="small"
                  background="background-1"
                  margin={{ bottom: 'small' }}
                >
                  <Box
                    pad="none"
                    align="center"
                    direction="row"
                    justify="between"
                  >
                    <Box pad="none" align="center" direction="row">
                      <Box className={styles.shortName}>
                        <Text color="white">
                          {OrderData.User.DisplayName.charAt(0).toUpperCase()}
                        </Text>
                      </Box>
                      <Text>{OrderData.User.DisplayName}</Text>
                    </Box>
                    <Box
                      pad="none"
                      direction="row"
                      justify="center"
                      align="center"
                    >
                      <Tooltip
                        description={
                          <Box pad="none">
                            <Text>{t('callTheNumber')}</Text>
                            <Text color="brand">{OrderData.User.MobileNo}</Text>
                          </Box>
                        }
                        position="bottom"
                      >
                        <a
                          href={`tel:${OrderData.User.MobileNo}`}
                          style={{ display: 'flex' }}
                        >
                          <Phone size="medium" color="white" />
                        </a>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
                <Box pad="small" background="background-1">
                  <Box
                    pad="small"
                    margin={{ bottom: 'small' }}
                    background="cookieConsentBackground"
                  >
                    <Text size="small">{t('warningOnChatBox')}</Text>
                  </Box>
                  <Box pad="none" margin={{ top: 'small' }}>
                    <div className={styles.chatBoxScroll}>
                      <div className={styles.chatMessages}>
                        {messageData.map((evl, index) => (
                          <React.Fragment key={index}>
                            {_.isEqual(evl.From, 'You') &&
                              _.isEqual(evl.AdminMessage, false) && (
                                <div className={styles.chatMessagesPanelRight}>
                                  <div className={styles.chatMessagesRight}>
                                    <Box pad="none">
                                      <Text
                                        size="medium"
                                        color="brand"
                                        margin={{ bottom: 'xsmall' }}
                                      >
                                        {evl.From}
                                      </Text>
                                      <Box
                                        pad="none"
                                        margin={{ bottom: 'small' }}
                                      >
                                        <Text size="small">{evl.Message}</Text>
                                      </Box>
                                      {evl.Attachment && (
                                        <S3ChatDownload
                                          keyName={evl.Attachment}
                                        />
                                      )}
                                    </Box>
                                  </div>
                                  <div className={styles.datePanel}>
                                    {moment(evl.Timestamp).format(
                                      'YYYY-MM-DD HH:mm',
                                    )}
                                  </div>
                                </div>
                              )}
                            {!_.isEqual(evl.From, 'You') &&
                              _.isEqual(evl.AdminMessage, false) && (
                                <div className={styles.chatMessagesPanelLeft}>
                                  <div className={styles.chatMessagesLeft}>
                                    <Box pad="none">
                                      <Text
                                        size="medium"
                                        color="brand"
                                        margin={{ bottom: 'xsmall' }}
                                      >
                                        {evl.From}
                                      </Text>
                                      <Box
                                        pad="none"
                                        margin={{ bottom: 'small' }}
                                      >
                                        <Text size="small">{evl.Message}</Text>
                                      </Box>
                                      {evl.Attachment && (
                                        <S3ChatDownload
                                          keyName={evl.Attachment}
                                        />
                                      )}
                                    </Box>
                                  </div>
                                  <div className={styles.datePanel}>
                                    {moment(evl.Timestamp).format(
                                      'YYYY-MM-DD HH:mm',
                                    )}
                                  </div>
                                </div>
                              )}
                            {_.isEqual(evl.AdminMessage, true) && (
                              <Box
                                pad="small"
                                background="red"
                                style={{ borderRadius: '15px' }}
                              >
                                <Text
                                  textAlign="center"
                                  margin={{ bottom: 'small' }}
                                >
                                  {evl.Message}
                                </Text>
                                <Text textAlign="center">
                                  {' '}
                                  {moment(evl.Timestamp).format(
                                    'YYYY-MM-DD HH:mm:ss Z',
                                  )}
                                </Text>
                              </Box>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    <Box pad={{ top: 'small' }}>
                      {/* {this.renderFilePreview()} */}
                      <Formik
                        initialValues={{
                          Message: '',
                          Attachment: '',
                        }}
                        validationSchema={this.chatValidationSchema()}
                        onSubmit={(values, actions) => {
                          if (
                            !_.isEmpty(this.state.filePreview) ||
                            !_.isEmpty(values.Message)
                          ) {
                            this.submitMessage(values, actions);
                          }
                        }}
                      >
                        {({ setFieldValue }) => (
                          <Form>
                            {_.isEqual(OrderData.OrderStatus, false) && (
                              <Box pad="none" direction="row">
                                <Box pad="none" flex="grow">
                                  <FormField name="Message">
                                    <TextField
                                      placeholder={t('messingBoxPlaceholder')}
                                      margin={{ bottom: 'none' }}
                                      borderRight="none"
                                      addonEnd={{
                                        background: 'background-1',
                                        border: [
                                          {
                                            size: 'xsmall',
                                            style: 'solid',
                                            side: 'top',
                                          },
                                          {
                                            size: 'xsmall',
                                            style: 'solid',
                                            side: 'bottom',
                                          },
                                          {
                                            size: 'xsmall',
                                            style: 'solid',
                                            side: 'right',
                                          },
                                        ],
                                        content: (
                                          <React.Fragment>
                                            {!_.isEmpty(
                                              this.state.filePreview,
                                            ) && <Attachment size="16px" />}
                                          </React.Fragment>
                                        ),
                                      }}
                                    ></TextField>
                                  </FormField>
                                </Box>
                                <Box pad={{ left: 'xsmall' }}>
                                  <S3ChatUpload
                                    name="Attachment"
                                    isButtonDisabled={this.isButtonDisabled}
                                    getFilePreview={this.getFilePreview}
                                  />
                                </Box>
                                <Box pad={{ left: 'xsmall' }}>
                                  <Button
                                    color="primary"
                                    type="submit"
                                    direction="row"
                                    align="center"
                                    disabled={buttonDisabled}
                                    loading={buttonDisabled}
                                  >
                                    <Box pad="3px" justify="center" fill={true}>
                                      <Send color="white" />
                                    </Box>
                                  </Button>
                                </Box>
                              </Box>
                            )}
                          </Form>
                        )}
                      </Formik>
                    </Box>
                  </Box>
                </Box>
              </Columns.Column>
            </Columns>
          </Box>
        )}
      </PageWrap>
    );
  }
}

const mapStateToProps = ({
  p2p: { p2pCurrencies, p2pPaymentMethods },
  user: { profile },
}) => ({
  profile,
  p2pCurrencies: p2pCurrencies,
  p2pPaymentMethods: p2pPaymentMethods,
});

export default withRouter(
  withNamespaces()(
    connect(mapStateToProps, { triggerModalOpen, triggerToast })(OrderDetails),
  ),
);
