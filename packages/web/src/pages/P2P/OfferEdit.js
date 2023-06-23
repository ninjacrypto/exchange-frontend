import React, {
  Component,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import styles from './P2P.module.scss';
import { Field, Formik, ErrorMessage, useFormikContext } from 'formik';
import {
  Button,
  Box,
  Tab,
  Tabs,
  Text,
  CheckBox,
  RadioButtonGroup,
  Modal,
  Heading,
} from 'components/Wrapped';
import { ReactSelect } from 'components/Form/SelectField';
import { Columns } from 'react-bulma-components';
import { PageWrap } from 'components/Containers';
import {
  Form,
  FormField,
  IconOption,
  IconValue,
  NumberInput,
  TextArea,
  SelectField,
  TextFieldSmall,
} from 'components/Form';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import * as Yup from 'yup';
import { CircleInformation } from 'grommet-icons';
import { triggerToast, triggerModalOpen } from 'redux/actions/ui';
import instance, { authenticatedInstance, apiInstance } from 'api';
import { useHistory } from 'react-router-dom';
import { formatNumberToPlaces, formatFiat } from 'utils';
import { CurrencyConverter } from 'containers/CurrencyConverter';
import { nestedTranslate } from 'utils/strings';

export const OfferEditSubmitModal = withNamespaces()(
  ({
    t: translate,
    handleSuccess,
    values,
    profile,
    isMinBTCHolding,
    isRegisteredXDaysAgo,
    editableOffer,
  }) => {
    const history = useHistory();
    const t = nestedTranslate(translate, 'forms.postOffer');

    const handleAddOffer = async () => {
      let valuesObj = {};
      valuesObj['AutoReply'] = values.AutoReply;
      valuesObj['Fee'] = values.Fee;
      valuesObj['FloatingPremium'] = values.FloatingPremium;
      valuesObj['FloatingPrice'] = values.FloatingPrice;
      valuesObj['IsActive'] = values.IsActive;
      valuesObj['MinBTCHolding'] = values.MinBTCHolding;
      valuesObj['OfferId'] = values.OfferId;
      valuesObj['OrderLimit_LB'] = values.OrderLimit_LB;
      valuesObj['OrderLimit_UB'] = values.OrderLimit_UB;
      valuesObj['PaymentTimeLimit'] = values.PaymentTimeLimit;
      valuesObj['Price'] = values.Price;
      valuesObj['RegisteredXDaysAgo'] = values.RegisteredXDaysAgo;
      valuesObj['Remarks'] = values.Remarks;
      valuesObj['Size'] = values.Size;

      if (values.UserPaymentIds.length > 0) {
        let tempUserPaymentIds = [];
        values.UserPaymentIds.forEach(element => {
          tempUserPaymentIds.push(element.value);
        });
        valuesObj['UserPaymentIds'] = tempUserPaymentIds;
      }

      try {
        const data = await authenticatedInstance({
          method: 'POST',
          url: `/p2p/edit-offer`,
          data: values,
        });

        if (data.status === 200) {
          if (data.data.Status === 'Success') {
            triggerToast(data.data.Status, 'success', 2500);
            if (handleSuccess) {
              handleSuccess();
            }
            history.push(`/p2p/my-offers`);
          } else {
            triggerToast(data.data.Message, 'error', 2500);
          }
        } else {
          triggerToast(data.data.Message, 'error', 2500);
        }
      } catch (e) {}
    };

    return (
      <React.Fragment>
        <Box pad="none">
          <Box
            pad="small"
            background="cookieConsentBackground"
            direction="row"
            margin={{ bottom: 'small' }}
            gap="xsmall"
            align="center"
          >
            <CircleInformation size="medium" />{' '}
            <Text>{t('confirmToPostWarning', values.Side)}</Text>
          </Box>

          <Box pad="none" margin={{ bottom: '20px' }}>
            <Columns className={styles.customizedColumns} breakpoint="mobile">
              <Columns.Column size={4} className={styles.customizedColumn}>
                <div>
                  <Text size="xsmall">{t('type')}</Text>
                </div>
                <Text>{t(editableOffer.Side.toLowerCase())}</Text>
              </Columns.Column>
              <Columns.Column size={4} className={styles.customizedColumn}>
                <div>
                  <Text size="xsmall">{t('asset')}</Text>
                </div>
                <Text>{editableOffer.BaseCurrency}</Text>
              </Columns.Column>
              <Columns.Column size={4} className={styles.customizedColumn}>
                <div>
                  <Text size="xsmall">{t('currency')}</Text>
                </div>
                <Text>{editableOffer.QuoteCurrency}</Text>
              </Columns.Column>
            </Columns>
          </Box>
          <Box pad="none" margin={{ bottom: '20px' }}>
            <Columns className={styles.customizedColumns} breakpoint="mobile">
              <Columns.Column size={4} className={styles.customizedColumn}>
                <div>
                  <Text size="xsmall">{t('priceType')}</Text>
                </div>
                <Text>
                  {_.isEqual(values.FloatingPrice, false)
                    ? t('fixed')
                    : t('floating')}
                </Text>
              </Columns.Column>
              <Columns.Column
                size={4}
                offset={4}
                className={styles.customizedColumn}
              >
                <div>
                  <Text size="xsmall">
                    {_.isEqual(values.FloatingPrice, false)
                      ? t('fixed')
                      : t('floating')}
                  </Text>
                </div>
                <Text>
                  {_.isEqual(values.FloatingPrice, false)
                    ? `${formatNumberToPlaces(values.Price, 2)} ${
                        editableOffer.QuoteCurrency
                      }`
                    : `${values.FloatingPremium}%`}
                </Text>
              </Columns.Column>
            </Columns>
          </Box>
          <Box pad="none" margin={{ bottom: '20px' }}>
            <Columns className={styles.customizedColumns} breakpoint="mobile">
              <Columns.Column size={4} className={styles.customizedColumn}>
                <div>
                  <Text size="xsmall">{t('orderLimit')}</Text>
                </div>
                <Text>{`${values.OrderLimit_LB} ${editableOffer.QuoteCurrency} ~ ${values.OrderLimit_UB} ${editableOffer.QuoteCurrency}`}</Text>
              </Columns.Column>
              <Columns.Column size={4} className={styles.customizedColumn}>
                <div>
                  <Text size="xsmall">{t('totalTradingAmount')}</Text>
                </div>
                <Text>
                  {values.Size}&nbsp;{editableOffer.BaseCurrency}
                </Text>
              </Columns.Column>
              <Columns.Column size={4} className={styles.customizedColumn}>
                <div>
                  <Text size="xsmall">{t('reservedFee')}</Text>
                </div>
                <Text>
                  {editableOffer.Fee} {editableOffer.BaseCurrency}
                </Text>
              </Columns.Column>
            </Columns>
          </Box>
          <Box
            pad="none"
            margin={{ bottom: '20px' }}
            className={styles.partialBox}
          >
            <div>
              <Text size="xsmall">{t('counterpartyConditions')}</Text>
            </div>
            <Text>
              {_.isEqual(profile.kycStatus, 'Approved')
                ? t('completedKYC')
                : t('notCompletedKYC')}
            </Text>
            {isRegisteredXDaysAgo && (
              <Text>
                {t('registered')} {values.RegisteredXDaysAgo} {t('daysAgo')}
              </Text>
            )}
            {isMinBTCHolding && (
              <Text>
                {t('holdingMoreThan')} {values.MinBTCHolding}&nbsp;
                {editableOffer.BaseCurrency}
              </Text>
            )}
          </Box>
          <Box pad="none" margin={{ bottom: '20px' }}>
            <Columns className={styles.customizedColumns} breakpoint="mobile">
              <Columns.Column size={6} className={styles.customizedColumn}>
                <div>
                  <Text size="xsmall">{t('paymentMethod')}</Text>
                </div>
                <Text>
                  {values.UserPaymentIds.map(evl => (
                    <div key={evl.UserPaymentId}>{evl.label}</div>
                  ))}
                </Text>
              </Columns.Column>
              <Columns.Column size={6} className={styles.customizedColumn}>
                <div>
                  <Text size="xsmall">{t('paymentTimeLimit')}</Text>
                </div>
                <Text>{`${values.PaymentTimeLimit} min`}</Text>
              </Columns.Column>
            </Columns>
          </Box>
          <Columns className={styles.customizedColumns}>
            <Columns.Column size={6} className={styles.customizedColumn}>
              <Box pad="none" margin={{ bottom: '20px' }}>
                <Button
                  color="primary"
                  primary={false}
                  fill="horizontal"
                  onClick={() => handleSuccess()}
                >
                  {t('cancel')}
                </Button>
              </Box>
            </Columns.Column>
            <Columns.Column size={6} className={styles.customizedColumn}>
              <Box pad="none" margin={{ bottom: '20px' }}>
                <Button
                  color="primary"
                  fill="horizontal"
                  onClick={() => handleAddOffer()}
                >
                  {t('confirmToPost')}
                </Button>
              </Box>
            </Columns.Column>
          </Columns>
        </Box>
      </React.Fragment>
    );
  },
);

const PriceFields = withNamespaces()(
  ({ t: translate, state, editableOffer, estimateOfferPrice }) => {
    const t = nestedTranslate(translate, 'forms.postOffer');
    const { setFieldValue, values } = useFormikContext();

    useEffect(() => {
      setFieldValue('Price', editableOffer.Price);
      setFieldValue('FloatingPremium', editableOffer.FloatingPremium);
    }, [editableOffer.Price]);

    const floatingPremiumPrice = () => {
      let finalPrice = 0;
      if (values.FloatingPremium > 100) {
        finalPrice = formatNumberToPlaces(
          (editableOffer.Price * values.FloatingPremium) / 100,
          2,
        );
        return finalPrice;
      } else if (values.FloatingPremium < 100) {
        finalPrice = formatNumberToPlaces(
          (editableOffer.Price * values.FloatingPremium) / 100,
          2,
        );
        return finalPrice;
      } else if (values.FloatingPremium == 100) {
        finalPrice = formatNumberToPlaces(
          (editableOffer.Price * values.FloatingPremium) / 100,
          2,
        );
        return finalPrice;
      }
    };

    return (
      <Box pad="none" gap="small">
        {editableOffer.FloatingPrice == false && (
          <FormField name="Price" label={t('fixed')}>
            <NumberInput
              type="text"
              addonStart={{
                content: <Text size="large">-</Text>,
                background: 'primary',
                onClick: () => setFieldValue('Price', values.Price - 1),
              }}
              addonEnd={{
                content: <Text size="large">+</Text>,
                background: 'primary',
                onClick: () => setFieldValue('Price', values.Price + 1),
              }}
              precision={2}
            />
          </FormField>
        )}
        {editableOffer.FloatingPrice == true && (
          <Box pad="none" margin={{ bottom: '20px' }}>
            <FormField name="FloatingPremium" label={t('floatingPriceMargin')}>
              <NumberInput
                type="text"
                addonStart={{
                  content: <Text size="large">-</Text>,
                  background: 'primary',
                  onClick: () =>
                    setFieldValue(
                      'FloatingPremium',
                      values.FloatingPremium - 1,
                    ),
                }}
                addonEnd={{
                  content: <Text size="large">+</Text>,
                  background: 'primary',
                  onClick: () =>
                    setFieldValue(
                      'FloatingPremium',
                      values.FloatingPremium + 1,
                    ),
                }}
                precision={2}
                margin={{ bottom: '0px' }}
              />
              <Text>
                {t('pricingFormula')}&nbsp;
                {`${formatNumberToPlaces(estimateOfferPrice.Price, 2)}*${
                  values.FloatingPremium
                }% = ${floatingPremiumPrice()}`}
                &nbsp;{editableOffer.QuoteCurrency}
              </Text>
            </FormField>
          </Box>
        )}
      </Box>
    );
  },
);

class OfferEdit extends Component {
  constructor() {
    super();

    this.state = {
      showMenu: false,
      selectedQuoteCurrency: { value: '', label: 'Select' },
      selectedBaseCurrency: { value: '', label: 'Select' },
      QuoteCurrencies: [],
      BaseCurrencies: [],
      MyPaymentMethods: [],
      checked: 'Fixed',
      UserPaymentIds: [],
      paymentTimeLimits: [],
      onlineStatus: '',
      // Side: 'BUY',
      isOpen: false,
      isRegisteredXDaysAgo: false,
      isMinBTCHolding: false,
      floatingPriceValue: '',
      estimateOfferPrice: {},
      defaultPaymentMethods: [],
      editableOffer: {},
      counterPartyKYC: false,
      isp2pUPM: false,
      P2PBalance: {},
    };

    this.validationSchema = this.validationSchema.bind(this);
  }

  componentDidMount() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'forms.postOffer');

    const tempPaymentTimeLimits = [
      { value: '15', label: `15 ${t('min')}` },
      { value: '30', label: `30 ${t('min')}` },
      { value: '45', label: `45 ${t('min')}` },
    ];

    this.setState({ paymentTimeLimits: tempPaymentTimeLimits });
  }

  componentDidUpdate() {
    const { editableOffer, defaultPaymentMethods } = this.state;
    if (_.isEmpty(defaultPaymentMethods)) {
      this.getEditableOffer();
    }
  }

  getEditableOffer = () => {
    const { match, myOffers } = this.props;
    let initialOfferPrice = {};

    if (match.params.id && myOffers.length > 0) {
      myOffers.forEach(element => {
        if (_.isEqual(element.Id, parseInt(match.params.id))) {
          this.setState(
            {
              editableOffer: element,
              onlineStatus: _.isEqual(element.IsActive, true)
                ? 'Online right now'
                : 'Offline, manually later',
              counterPartyKYC: element.CounterPartyKYC,
            },
            () => {
              initialOfferPrice['Side'] = element.Side;
              initialOfferPrice['Quote'] = element.QuoteCurrency;
              initialOfferPrice['Base'] = element.BaseCurrency;
              this.sortMyPaymentMethods();
              this.getP2PBalance();
              this.getOfferPrice(initialOfferPrice);
            },
          );
        }
      });
    }
  };

  sortMyPaymentMethods = () => {
    const { p2pUserPaymentMethods } = this.props;
    const { editableOffer } = this.state;

    let tempMyPaymentMethods = [];

    if (!_.isEmpty(p2pUserPaymentMethods)) {
      p2pUserPaymentMethods.forEach(element => {
        if (_.isEqual(editableOffer.QuoteCurrency, element.Currency)) {
          let avi = {
            label: `${element.MethodName} (${element.Currency})`,
            value: element.Id,
          };
          tempMyPaymentMethods.push(avi);
        }
      });
      this.setState({ MyPaymentMethods: tempMyPaymentMethods });
    }

    let tempMethodObj = [];
    editableOffer.UserPaymentMethod.forEach(element => {
      tempMyPaymentMethods.forEach(el => {
        if (element.UserPaymentId === el.value) {
          tempMethodObj.push(el);
        }
      });
      this.setState({ defaultPaymentMethods: tempMethodObj });
    });
  };

  getOfferPrice = async initialOfferPrice => {
    const { selectedBaseCurrency, selectedQuoteCurrency, Side } = this.state;

    if (_.isEqual(initialOfferPrice, undefined)) {
      const initialData = {
        Side: Side,
        Base: selectedBaseCurrency.value,
        Quote: selectedQuoteCurrency.value,
      };
      initialOfferPrice = initialData;
    }

    try {
      const { data } = await authenticatedInstance({
        url: '/p2p/estimate-offer-price',
        method: 'POST',
        data: initialOfferPrice,
      });

      if (data.Status === 'Success') {
        this.setState({ estimateOfferPrice: data.Data });
      }
    } catch (e) {}
  };

  getP2PBalance = async () => {
    const { editableOffer } = this.state;
    try {
      const { data } = await authenticatedInstance({
        url: '/p2p/balance',
        method: 'POST',
        data: {
          Currency: editableOffer.BaseCurrency,
        },
      });

      if (data.Status === 'Success') {
        this.setState({ P2PBalance: data.Data[0] });
      }
    } catch (e) {}
  };

  handleRadioButton = value => {
    this.setState({ checked: value });
  };

  handleOnlineStatus = value => {
    this.setState({ onlineStatus: value });
  };

  handleRegisteredXDaysAgo = value => {
    this.setState({ isRegisteredXDaysAgo: value });
  };

  handleMinBTCHolding = value => {
    this.setState({ isMinBTCHolding: value });
  };

  floatingPremiumPrice = values => {
    let finalPrice = 0;
    if (values.FloatingPremium > 100) {
      finalPrice = formatNumberToPlaces(
        (this.state.estimateOfferPrice.Price * values.FloatingPremium) / 100,
        2,
      );
      return finalPrice;
    } else if (values.FloatingPremium < 100) {
      finalPrice = formatNumberToPlaces(
        (this.state.estimateOfferPrice.Price * values.FloatingPremium) / 100,
        2,
      );
      return finalPrice;
    } else if (values.FloatingPremium == 100) {
      finalPrice = formatNumberToPlaces(
        (this.state.estimateOfferPrice.Price * values.FloatingPremium) / 100,
        2,
      );
      return finalPrice;
    }
  };

  handleEditOffer(values) {
    const { isRegisteredXDaysAgo, isMinBTCHolding } = this.state;

    values.Price = values.Price.toString();
    values.Fee = values.Fee.toString();
    values.FloatingPremium = values.FloatingPremium.toString();
    values.OfferId = values.OfferId.toString();
    values.OrderLimit_LB = values.OrderLimit_LB.toString();
    values.OrderLimit_UB = values.OrderLimit_UB.toString();
    values.Size = values.Size.toString();
    values.IsActive = _.isEqual(values.IsActive, 'Online right now')
      ? true
      : false;
    if (isRegisteredXDaysAgo) {
      values.RegisteredXDaysAgo = values.RegisteredXDaysAgo.toString();
    } else {
      values.RegisteredXDaysAgo = '0';
    }
    if (isMinBTCHolding) {
      values.MinBTCHolding = values.MinBTCHolding.toString();
    } else {
      values.MinBTCHolding = '0.00';
    }

    this.toggleModal();
  }

  validationSchema() {
    const { P2PBalance, editableOffer } = this.state;
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'forms.validations');

    return Yup.object().shape({
      Size: _.isEqual(editableOffer.Side, 'BUY')
        ? Yup.number()
            .min(0.00000001)
            .required()
        : Yup.number()
            .min(0.00000001)
            .max(P2PBalance.Balance)
            .required(),
      Price: _.isEqual(this.state.checked, 'Fixed')
        ? Yup.number()
            .min(0.01)
            .required()
        : Yup.number(),
      FloatingPremium: _.isEqual(this.state.checked, 'Floating')
        ? Yup.number()
            .min(80)
            .max(200)
            .required()
        : Yup.number(),
        OrderLimit_LB: Yup.number()
        .min(0.01)
        .when(['OrderLimit_UB'], (OrderLimit_UB) => {
          if (OrderLimit_UB) {
            return Yup.number()
              .max(formatFiat(OrderLimit_UB, true), t(`orderLowerLimit`));
          }
        })
        .required(),
      OrderLimit_UB: Yup.number()
        .when(['Price', 'Size'], (Price, Size) => {
          if (Price && Size) {
            return Yup.number()
              .min(0.01)
              .max(formatFiat(Size * Price, true), t(`orderUpperLimit`));
          }
        })
        .required(),
      RegisteredXDaysAgo: this.state.isRegisteredXDaysAgo
        ? Yup.number()
            .min(1)
            .required()
        : Yup.number(),
      MinBTCHolding: this.state.isMinBTCHolding
        ? Yup.number()
            .min(0.01)
            .required()
        : Yup.number(),
      UserPaymentIds: _.isEqual(editableOffer.Side, 'SELL')
        ? Yup.array()
            .min(0, t('paymentMethodMin'))
            .nullable(true)
            .required()
        : Yup.array()
            .min(0, t('paymentMethodMin'))
            .max(1, t('paymentMethodMax'))
            .nullable(true)
            .required(),
    });
  }

  toggleModal = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    const {
      editableOffer,
      defaultPaymentMethods,
      P2PBalance,
      estimateOfferPrice,
    } = this.state;
    const { t: translate, profile } = this.props;
    const t = nestedTranslate(translate, 'forms.postOffer');
    const isMobile = window.matchMedia('(max-width: 767px)');

    return (
      <React.Fragment>
        <PageWrap>
          <Box pad="none" justify="center" align="center" gap="small">
            <Box
              pad="medium"
              background="background-3"
              width={isMobile.matches ? { min: '100%' } : '767px'}
            >
              {!_.isEmpty(defaultPaymentMethods) && (
                <Formik
                  initialValues={{
                    OfferId: editableOffer.Id,
                    Size: editableOffer.Size,
                    Price: editableOffer.Price,
                    FloatingPrice: editableOffer.FloatingPrice,
                    FloatingPremium: editableOffer.FloatingPremium,
                    OrderLimit_LB: editableOffer.OrderLimit_LB,
                    OrderLimit_UB: editableOffer.OrderLimit_UB,
                    Fee: editableOffer.Fee,
                    PaymentTimeLimit: editableOffer.PaymentTimeLimit.toString(),
                    Remarks: editableOffer.Remarks,
                    AutoReply: editableOffer.AutoReply,
                    // CounterPartyKYC: editableOffer.CounterPartyKYC,
                    RegisteredXDaysAgo: editableOffer.RegisteredXDaysAgo,
                    MinBTCHolding: editableOffer.MinBTCHolding,
                    IsActive: _.isEqual(editableOffer.IsActive, true)
                      ? 'Online right now'
                      : 'Offline, manually later',
                    UserPaymentIds: defaultPaymentMethods,
                  }}
                  onSubmit={values => {
                    this.handleEditOffer(values);
                  }}
                  validationSchema={this.validationSchema}
                >
                  {({ values, setFieldValue }) => (
                    <Form>
                      <Box
                        pad={{ vertical: 'small', horizontal: 'medium' }}
                        background="background-2"
                        margin={{ bottom: 'small' }}
                      >
                        <Columns className={styles.customizedColumns}>
                          <Columns.Column
                            size={4}
                            className={styles.customizedColumn}
                          >
                            <Box pad="none" margin={{ vertical: '20px' }}>
                              <Text size="small">
                                {t(editableOffer.Side.toLowerCase())}
                              </Text>

                              <Box pad="none">
                                <Text size="large">
                                  {editableOffer.BaseCurrency}/
                                  {editableOffer.QuoteCurrency}
                                </Text>
                              </Box>
                            </Box>
                          </Columns.Column>
                          <Columns.Column
                            size={4}
                            className={styles.customizedColumn}
                          >
                            <Box pad="none" margin={{ vertical: '20px' }}>
                              <Text size="small">
                                {_.isEqual(editableOffer.Side, 'BUY')
                                  ? t('highestOrderPrice')
                                  : t('lowestOrderPrice')}
                              </Text>

                              <Box pad="none">
                                <Text size="large">
                                  {formatNumberToPlaces(
                                    estimateOfferPrice.Price,
                                    2,
                                  )}{' '}
                                  {editableOffer.QuoteCurrency}
                                </Text>
                              </Box>
                            </Box>
                          </Columns.Column>
                          <Columns.Column
                            size={4}
                            className={styles.customizedColumn}
                          >
                            <Box pad="none" margin={{ vertical: '20px' }}>
                              <Text size="small">{t('yourPrice')}</Text>

                              <Box pad="none">
                                {_.isEqual(
                                  editableOffer.FloatingPrice,
                                  false,
                                ) && (
                                  <Text size="large" weight={500}>
                                    {formatNumberToPlaces(values.Price, 2)}{' '}
                                    {editableOffer.QuoteCurrency}
                                  </Text>
                                )}
                                {_.isEqual(
                                  editableOffer.FloatingPrice,
                                  true,
                                ) && (
                                  <Text size="large" weight={500}>
                                    {this.floatingPremiumPrice(values)}{' '}
                                    {editableOffer.QuoteCurrency}
                                  </Text>
                                )}
                              </Box>
                            </Box>
                          </Columns.Column>
                        </Columns>
                      </Box>

                      <PriceFields
                        state={this.state}
                        editableOffer={editableOffer}
                        estimateOfferPrice={estimateOfferPrice}
                      />
                      <Box pad="none" margin={{ bottom: '20px' }}>
                        <FormField name="Size" label={t('totalAmount')}>
                          <NumberInput
                            name="Size"
                            type="text"
                            addonEnd={{
                              content: (
                                <Text size="xsmall" textAlign="end">
                                  {editableOffer.BaseCurrency}
                                </Text>
                              ),
                              background: 'primary',
                              onClick: () => {},
                            }}
                            precision={2}
                            margin="none"
                          />
                        </FormField>
                        {_.isEqual(editableOffer.Side, 'SELL') && (
                          <Box
                            pad="none"
                            direction="row"
                            justify="between"
                            margin={{ top: 'xsmall' }}
                          >
                            <Box pad="none" direction="row" gap="xxsmall">
                              <Text size="xsmall">{t('available')}:</Text>
                              <Text size="xsmall">
                                {!_.isEmpty(P2PBalance) && (
                                  <React.Fragment>
                                    {`${formatNumberToPlaces(
                                      P2PBalance.Balance,
                                      8,
                                    )} ${P2PBalance.Currency}`}
                                  </React.Fragment>
                                )}
                              </Text>
                            </Box>
                            <Box pad="none" direction="row" gap="xxsmall">
                              <Text size="xsmall">
                                ~{' '}
                                <CurrencyConverter
                                  isFiat={true}
                                  from={editableOffer.BaseCurrency}
                                  to={editableOffer.QuoteCurrency}
                                  amount={P2PBalance.Balance}
                                />
                              </Text>
                              <Text size="xsmall">
                                {editableOffer.QuoteCurrency}
                              </Text>
                            </Box>
                          </Box>
                        )}
                      </Box>
                      <Box pad="none">
                        <Text className={styles.formLabel}>
                          {t('orderLimit')}
                        </Text>
                        <Columns className={styles.customizedColumns}>
                          <Columns.Column
                            size={6}
                            className={styles.customizedColumn}
                          >
                            <FormField name="OrderLimit_LB">
                              <NumberInput
                                name="OrderLimit_LB"
                                type="text"
                                addonEnd={{
                                  content: (
                                    <Text size="xsmall" textAlign="end">
                                      {editableOffer.QuoteCurrency}
                                    </Text>
                                  ),
                                  background: 'primary',
                                  onClick: () => {},
                                }}
                                precision={2}
                              />
                            </FormField>
                          </Columns.Column>
                          <Columns.Column
                            size={6}
                            className={styles.customizedColumn}
                          >
                            <FormField name="OrderLimit_UB">
                              <NumberInput
                                name="OrderLimit_UB"
                                type="text"
                                addonEnd={{
                                  content: (
                                    <Text size="xsmall" textAlign="end">
                                      {editableOffer.QuoteCurrency}
                                    </Text>
                                  ),
                                  background: 'primary',
                                  onClick: () => {},
                                }}
                                precision={2}
                              />
                            </FormField>
                          </Columns.Column>
                        </Columns>
                      </Box>

                      <Box pad="none" margin={{ bottom: '20px' }}>
                        <Text className={styles.formLabel}>
                          {t('paymentMethod')}
                        </Text>
                        <Columns className={styles.customizedColumns}>
                          <Columns.Column
                            size={8}
                            className={styles.customizedColumn}
                          >
                            <Box pad="none" margin={{ bottom: '20px' }}>
                              <Field
                                name="UserPaymentIds"
                                component={SelectField}
                                options={this.state.MyPaymentMethods}
                                persistentPlaceholder={false}
                                isMulti={'isMulti'}
                                closeMenuOnSelect={false}
                                margin={{ bottom: '0px' }}
                                defaultValue={defaultPaymentMethods}
                              />
                              <ErrorMessage
                                name="UserPaymentIds"
                                component="div"
                                style={{
                                  padding: '0px 12px',
                                }}
                                className={styles.errorMessage}
                              />
                            </Box>
                          </Columns.Column>
                          <Columns.Column
                            size={4}
                            className={styles.customizedColumn}
                          >
                            <Box pad="none" margin={{ bottom: '20px' }}>
                              <Link to="/p2p/payment-settings">
                                <Button
                                  color="primary"
                                  size="small"
                                  fill="horizontal"
                                >
                                  {t('addNewMethod')}
                                </Button>
                              </Link>
                            </Box>
                          </Columns.Column>
                        </Columns>
                      </Box>
                      <Box pad="none">
                        <Text className={styles.formLabel}>
                          {t('paymentTimeLimit')}
                        </Text>
                        <Field
                          name="PaymentTimeLimit"
                          component={SelectField}
                          options={this.state.paymentTimeLimits}
                          persistentPlaceholder={false}
                          margin={{ bottom: '20px' }}
                        />
                      </Box>
                      <FormField name="Remarks" label={t('remarks.label')}>
                        <TextArea placeholder={t('remarks.placeholder')} />
                      </FormField>

                      <FormField name="AutoReply" label={t('autoReply.label')}>
                        <TextArea placeholder={t('autoReply.placeholder')} />
                      </FormField>
                      <Box pad="none">
                        <Text
                          className={styles.formLabel}
                          margin={{ bottom: '20px' }}
                        >
                          {t('counterpartyConditions')}
                        </Text>
                        <Box pad="none" margin={{ bottom: '10px' }}>
                          <CheckBox
                            name="CounterPartyKYC"
                            label={t('completedKYC')}
                            checked={true}
                            disabled={true}
                          />
                        </Box>
                        <Box pad="none" margin={{ bottom: '10px' }}>
                          <CheckBox
                            label={
                              <div style={{ display: 'flex' }}>
                                {t('registered')}&nbsp;
                                <TextFieldSmall
                                  type="text"
                                  name="RegisteredXDaysAgo"
                                  className={styles.smallInput}
                                  value={values.RegisteredXDaysAgo}
                                />
                                &nbsp;{t('daysAgo')}
                              </div>
                            }
                            onChange={this.handleRegisteredXDaysAgo}
                          />
                        </Box>
                        <Box pad="none" margin={{ bottom: '30px' }}>
                          <CheckBox
                            label={
                              <div style={{ display: 'flex' }}>
                                {t('holdingMoreThan')}&nbsp;
                                <TextFieldSmall
                                  type="text"
                                  name="MinBTCHolding"
                                  className={styles.smallInput}
                                />
                                &nbsp;{editableOffer.BaseCurrency}
                              </div>
                            }
                            onChange={this.handleMinBTCHolding}
                          />
                        </Box>
                      </Box>

                      <Box pad="none" margin={{ bottom: '20px' }}>
                        <Text
                          className={styles.formLabel}
                          margin={{ bottom: '10px' }}
                        >
                          {t('status')}
                        </Text>

                        <RadioButtonGroup
                          name="IsActive"
                          options={[
                            'Online right now',
                            'Offline, manually later',
                          ]}
                          value={this.state.onlineStatus}
                          onChange={this.handleOnlineStatus}
                        />
                      </Box>
                      <Button fill={true} color="primary" type="submit">
                        {t('submit')}
                      </Button>
                      <Modal
                        show={this.state.isOpen}
                        toggleModal={this.toggleModal}
                        pad="medium"
                        heading={t('confirmToPost')}
                        width="large"
                      >
                        <OfferEditSubmitModal
                          handleSuccess={this.toggleModal}
                          values={values}
                          isRegisteredXDaysAgo={this.state.isRegisteredXDaysAgo}
                          isMinBTCHolding={this.state.isMinBTCHolding}
                          editableOffer={editableOffer}
                          profile={profile}
                        />
                      </Modal>
                    </Form>
                  )}
                </Formik>
              )}
            </Box>
          </Box>
        </PageWrap>
      </React.Fragment>
    );
  }
}
const mapStateToProps = ({
  p2p: { p2pCurrencies, p2pUserPaymentMethods, myOffers },
  user,
}) => ({
  p2pCurrencies: p2pCurrencies,
  profile: user.profile,
  p2pUserPaymentMethods: p2pUserPaymentMethods,
  myOffers: myOffers,
});

export default withNamespaces()(
  connect(mapStateToProps, {
    triggerToast,
    triggerModalOpen,
  })(OfferEdit),
);
