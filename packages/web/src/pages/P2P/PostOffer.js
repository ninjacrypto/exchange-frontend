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
import { formatNumberToPlaces, numberParser, formatFiat } from 'utils';
import { CurrencyConverter } from 'containers/CurrencyConverter';
import { nestedTranslate } from 'utils/strings';

export const OfferSubmitModal = withNamespaces()(
  ({
    t: translate,
    handleSuccess,
    values,
    profile,
    isMinBTCHolding,
    isRegisteredXDaysAgo,
    estimateOfferPrice,
  }) => {
    const t = nestedTranslate(translate, 'forms.postOffer');
    const history = useHistory();
    const handleAddOffer = async () => {
      let valuesObj = {};
      valuesObj['AutoReply'] = values.AutoReply;
      valuesObj['Base'] = values.Base;
      valuesObj['FloatingPremium'] = values.FloatingPremium;
      valuesObj['FloatingPrice'] = values.FloatingPrice;
      valuesObj['IsActive'] = values.IsActive;
      valuesObj['MinBTCHolding'] = values.MinBTCHolding;
      valuesObj['OrderLimit_LB'] = values.OrderLimit_LB;
      valuesObj['OrderLimit_UB'] = values.OrderLimit_UB;
      valuesObj['PaymentTimeLimit'] = values.PaymentTimeLimit;
      valuesObj['Price'] = values.Price;
      valuesObj['Quote'] = values.Quote;
      valuesObj['RegisteredXDaysAgo'] = values.RegisteredXDaysAgo;
      valuesObj['Remarks'] = values.Remarks;
      valuesObj['Side'] = values.Side;
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
          url: `/p2p/post-offer`,
          data: valuesObj,
        });

        if (data.data.Status === 'Success') {
          triggerToast(data.data.Status, 'success', 2500);
          if (handleSuccess) {
            handleSuccess();
          }
          history.push(`/p2p/my-offers`);
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
                <Text>{t(values.Side.toLowerCase())}</Text>
              </Columns.Column>
              <Columns.Column size={4} className={styles.customizedColumn}>
                <div>
                  <Text size="xsmall">{t('asset')}</Text>
                </div>
                <Text>{values.Base}</Text>
              </Columns.Column>
              <Columns.Column size={4} className={styles.customizedColumn}>
                <div>
                  <Text size="xsmall">{t('currency')}</Text>
                </div>
                <Text>{values.Quote}</Text>
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
                    ? `${formatNumberToPlaces(values.Price, 2)} ${values.Quote}`
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
                <Text>{`${values.OrderLimit_LB} ${values.Quote} ~ ${values.OrderLimit_UB} ${values.Quote}`}</Text>
              </Columns.Column>
              <Columns.Column size={4} className={styles.customizedColumn}>
                <div>
                  <Text size="xsmall">{t('totalTradingAmount')}</Text>
                </div>
                <Text>
                  {values.Size}&nbsp;{values.Base}
                </Text>
              </Columns.Column>
              <Columns.Column size={4} className={styles.customizedColumn}>
                <div>
                  <Text size="xsmall">{t('reservedFee')}</Text>
                </div>
                <Text>
                  {estimateOfferPrice.MakerFee} {values.Base}
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
                {t('holdingMoreThan')} {values.MinBTCHolding}&nbsp;{values.Base}
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
                  {values.UserPaymentIds.map((evl, index) => (
                    <div key={index}>{evl.label}</div>
                  ))}
                </Text>
              </Columns.Column>
              <Columns.Column size={6} className={styles.customizedColumn}>
                <div>
                  <Text size="xsmall">{t('paymentTimeLimit')}</Text>
                </div>
                <Text>{`${values.PaymentTimeLimit} ${t('min')}`}</Text>
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
  ({ t: translate, state, estimateOfferPrice }) => {
    const t = nestedTranslate(translate, 'forms.postOffer');
    const { setFieldValue, values } = useFormikContext();

    useEffect(() => {
      setFieldValue('Price', estimateOfferPrice.Price);
      setFieldValue('FloatingPremium', 100);
    }, [estimateOfferPrice.Price, state.checked]);

    const floatingPremiumPrice = () => {
      let finalPrice = 0;
      if (values.FloatingPremium > 100) {
        finalPrice = formatNumberToPlaces(
          (estimateOfferPrice.Price * values.FloatingPremium) / 100,
          2,
        );
        return finalPrice;
      } else if (values.FloatingPremium < 100) {
        finalPrice = formatNumberToPlaces(
          (estimateOfferPrice.Price * values.FloatingPremium) / 100,
          2,
        );
        return finalPrice;
      } else if (values.FloatingPremium == 100) {
        finalPrice = formatNumberToPlaces(
          (estimateOfferPrice.Price * values.FloatingPremium) / 100,
          2,
        );
        return finalPrice;
      }
    };

    return (
      <Box pad="none" gap="small">
        {state.checked == 'Fixed' && (
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
        {state.checked == 'Floating' && (
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
                {t('pricingFormula')}:&nbsp;
                {`${formatNumberToPlaces(estimateOfferPrice.Price, 2)}*${
                  values.FloatingPremium
                }% = ${floatingPremiumPrice()}`}
                &nbsp;{state.selectedQuoteCurrency.value}
              </Text>
            </FormField>
          </Box>
        )}
      </Box>
    );
  },
);

class PostOffer extends Component {
  constructor() {
    super();

    this.state = {
      showMenu: false,
      selectedQuoteCurrency: { value: '', label: 'Select' },
      selectedBaseCurrency: { value: '', label: 'Select' },
      quoteCurrencies: [],
      baseCurrencies: [],
      MyPaymentMethods: [],
      checked: 'Fixed',
      UserPaymentIds: [],
      paymentTimeLimits: [],
      onlineStatus: 'Online right now',
      Side: 'SELL',
      isOpen: false,
      isRegisteredXDaysAgo: false,
      isMinBTCHolding: false,
      floatingPriceValue: '',
      estimateOfferPrice: {},
      isp2pCurrencies: false,
      isp2pUPM: false,
      P2PBalance: {},
    };

    this.validationSchema = this.validationSchema.bind(this);
  }

  initialOfferPrice = {
    Side: 'SELL',
    Quote: '',
    Base: '',
  };

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
    const { p2pUserPaymentMethods, p2pCurrencies } = this.props;
    const { isp2pCurrencies, isp2pUPM } = this.state;

    if (!isp2pCurrencies) {
      if (!_.isEmpty(p2pCurrencies)) {
        const tempQuoteCurrencies = [];
        const tempBaseCurrencies = [];
        Object.entries(p2pCurrencies).map(([key, value]) => {
          if (_.isEqual(key, 'Base')) {
            if (!_.isEmpty(value)) {
              value.map(el => {
                let avi = {
                  label: el.AssetName,
                  value: el.AssetName,
                };
                tempBaseCurrencies.push(avi);
              });
              this.setState(
                {
                  baseCurrencies: tempBaseCurrencies,
                  selectedBaseCurrency: tempBaseCurrencies[0],
                },
                () => {
                  value[0].Quotes.map(el => {
                    let tempObj = {
                      label: el,
                      value: el,
                    };
                    tempQuoteCurrencies.push(tempObj);
                  });
                  this.setState({
                    quoteCurrencies: tempQuoteCurrencies.sort((a, b) =>
                      a.value > b.value ? 1 : -1,
                    ),
                    selectedQuoteCurrency: tempQuoteCurrencies[0],
                  });
                  this.initialOfferPrice.Quote = tempQuoteCurrencies[0].value;
                  this.getP2PBalance();
                },
              );
              this.initialOfferPrice.Base = tempBaseCurrencies[0].value;
            }
          }
        });

        this.setState({ isp2pCurrencies: true });
        this.getOfferPrice(this.initialOfferPrice);
      }
    }
    if (!isp2pUPM) {
      if (p2pUserPaymentMethods) {
        if (
          p2pUserPaymentMethods.length > 0 &&
          this.state.selectedQuoteCurrency.value != ''
        ) {
          this.sortMyPaymentMethods();
          this.setState({ isp2pUPM: true });
        }
      }
    }
  }

  sortMyPaymentMethods = () => {
    const { p2pUserPaymentMethods } = this.props;
    const { selectedQuoteCurrency } = this.state;

    if (p2pUserPaymentMethods !== undefined) {
      const tempMyPaymentMethods = [];
      p2pUserPaymentMethods.forEach(element => {
        if (_.isEqual(selectedQuoteCurrency.value, element.Currency)) {
          let avi = {
            label: `${element.MethodName} (${element.Currency})`,
            value: element.Id,
          };
          tempMyPaymentMethods.push(avi);
        }
      });
      this.setState({ MyPaymentMethods: tempMyPaymentMethods });
    }
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
    const { selectedBaseCurrency } = this.state;

    try {
      const { data } = await authenticatedInstance({
        url: '/p2p/balance',
        method: 'POST',
        data: {
          Currency: selectedBaseCurrency.value,
        },
      });

      if (data.Status === 'Success') {
        this.setState({ P2PBalance: data.Data[0] });
      }
    } catch (e) {}
  };

  handleQuoteCurrencies = value => {
    this.setState({ selectedQuoteCurrency: value }, () => {
      this.sortMyPaymentMethods();
      this.getOfferPrice();
    });
  };

  handleBaseCurrencies = value => {
    const { p2pCurrencies } = this.props;
    this.setState({ selectedBaseCurrency: value }, () => {
      let tempQuoteCurrencies = [];
      Object.entries(p2pCurrencies).map(([key, value]) => {
        if (_.isEqual(key, 'Base')) {
          if (!_.isEmpty(value)) {
            value.map(el => {
              if (
                _.isEqual(el.AssetName, this.state.selectedBaseCurrency.value)
              ) {
                el.Quotes.map(el => {
                  let tempObj = {
                    label: el,
                    value: el,
                  };
                  tempQuoteCurrencies.push(tempObj);
                });

                this.setState(
                  {
                    quoteCurrencies: tempQuoteCurrencies.sort((a, b) =>
                      a.value > b.value ? 1 : -1,
                    ),
                    selectedQuoteCurrency: tempQuoteCurrencies[0],
                  },
                  () => {
                    this.getOfferPrice();
                    this.getP2PBalance();
                  },
                );
              }
            });
          }
        }
      });
    });
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

  handleOfferSubmit(values) {
    const {
      selectedBaseCurrency,
      selectedQuoteCurrency,
      checked,
      onlineStatus,
      Side,
      isRegisteredXDaysAgo,
      isMinBTCHolding,
    } = this.state;

    values.Base = selectedBaseCurrency.value;
    values.Quote = selectedQuoteCurrency.value;
    values.FloatingPrice = _.isEqual(checked, 'Fixed') ? false : true;
    values.FloatingPremium = _.isEqual(checked, 'Fixed')
      ? 0
      : values.FloatingPremium;
    values.Price = _.isEqual(checked, 'Floating')
      ? '0'
      : values.Price.toString();
    values.IsActive = _.isEqual(onlineStatus, 'Online right now')
      ? true
      : false;
    values.Side = Side;
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

  handleSide = value => {
    if (_.isEqual(value, 'BUY')) {
      this.setState({ Side: 'BUY' }, () => this.getOfferPrice());
    } else {
      this.setState({ Side: 'SELL' }, () => this.getOfferPrice());
    }
  };

  validationSchema() {
    const { P2PBalance } = this.state;
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'forms.validations');

    return Yup.object().shape({
      Size: _.isEqual(this.state.Side, 'BUY')
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
      UserPaymentIds: _.isEqual(this.state.Side, 'SELL')
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
    const { t: translate, profile } = this.props;
    const t = nestedTranslate(translate, 'forms.postOffer');
    const { estimateOfferPrice, P2PBalance } = this.state;
    const isMobile = window.matchMedia('(max-width: 767px)');

    return (
      <React.Fragment>
        <PageWrap>
          <Box pad="none" justify="center" align="center" gap="small">
            <Box
              pad="medium"
              background="background-3"
              width={isMobile.matches ? '100%' : '767px'}
            >
              <Formik
                initialValues={{
                  Side: '',
                  Size: '',
                  Price: 0,
                  Base: '',
                  Quote: '',
                  FloatingPrice: '',
                  FloatingPremium: 0,
                  OrderLimit_LB: '',
                  OrderLimit_UB: '',
                  UserPaymentIds: [],
                  PaymentTimeLimit: '15',
                  RegisteredXDaysAgo: 0,
                  MinBTCHolding: 0.0,
                  Remarks: '',
                  AutoReply: '',
                  IsActive: '',
                }}
                onSubmit={values => this.handleOfferSubmit(values)}
                validationSchema={this.validationSchema}
              >
                {({ values, setFieldValue, resetForm }) => (
                  <Form>
                    <div className={styles.tabBtnGroup}>
                      <div
                        className={cx(
                          styles.tabBtn,
                          _.isEqual(this.state.Side, 'SELL')
                            ? styles.tabBtnActive
                            : '',
                        )}
                        onClick={() => {
                          resetForm();
                          this.handleSide('SELL');
                        }}
                      >
                        {t('iWantToSell')}
                      </div>
                      <div
                        className={cx(
                          styles.tabBtn,
                          _.isEqual(this.state.Side, 'BUY')
                            ? styles.tabBtnActive
                            : '',
                        )}
                        onClick={() => {
                          resetForm();
                          this.handleSide('BUY');
                        }}
                      >
                        {t('iWantToBuy')}
                      </div>
                    </div>

                    <Box pad="none">
                      <Text className={styles.formLabel}>{t('asset')}</Text>
                      <ReactSelect
                        name="Base"
                        margin="none"
                        options={this.state.baseCurrencies}
                        onChange={value => {
                          setFieldValue('UserPaymentIds', []);
                          this.handleBaseCurrencies(value);
                        }}
                        value={this.state.selectedBaseCurrency}
                        components={{
                          Option: IconOption,
                          SingleValue: IconValue,
                        }}
                        margin={{ bottom: '20px' }}
                      />
                    </Box>
                    <Box pad="none">
                      <Text className={styles.formLabel}>{t('withCash')}</Text>
                      <ReactSelect
                        name="Quote"
                        options={this.state.quoteCurrencies}
                        onChange={value => {
                          setFieldValue('UserPaymentIds', []);
                          this.handleQuoteCurrencies(value);
                        }}
                        value={this.state.selectedQuoteCurrency}
                        components={{
                          Option: IconOption,
                          SingleValue: IconValue,
                        }}
                        margin={{ bottom: '20px' }}
                      />
                    </Box>
                    <Columns className={styles.customizedColumns}>
                      <Columns.Column
                        size={6}
                        className={styles.customizedColumn}
                      >
                        <Box pad="none" margin={{ bottom: '20px' }}>
                          <div>{t('yourPrice')}</div>
                          {_.isEqual(this.state.checked, 'Fixed') && (
                            <Text size="large" weight={500}>
                              {formatNumberToPlaces(values.Price, 2)}{' '}
                              {this.state.selectedQuoteCurrency.value}
                            </Text>
                          )}
                          {_.isEqual(this.state.checked, 'Floating') && (
                            <Text size="large" weight={500}>
                              {this.floatingPremiumPrice(values)}{' '}
                              {this.state.selectedQuoteCurrency.value}
                            </Text>
                          )}
                        </Box>
                      </Columns.Column>
                      <Columns.Column
                        size={6}
                        className={styles.customizedColumn}
                      >
                        <Box pad="none" margin={{ bottom: '20px' }}>
                          <div>
                            {_.isEqual(this.state.Side, 'BUY')
                              ? t('highestOrderPrice')
                              : t('lowestOrderPrice')}
                          </div>
                          <Text size="large" weight={500}>
                            {formatNumberToPlaces(estimateOfferPrice.Price, 2)}{' '}
                            {this.state.selectedQuoteCurrency.value}
                          </Text>
                        </Box>
                      </Columns.Column>
                    </Columns>

                    <Box pad="none" margin={{ bottom: '20px' }}>
                      <Text
                        className={styles.formLabel}
                        margin={{ bottom: '10px' }}
                      >
                        {t('priceType')}
                      </Text>

                      <RadioButtonGroup
                        name="FloatingPrice"
                        options={['Fixed', 'Floating']}
                        value={this.state.checked}
                        onChange={value => {
                          this.handleRadioButton(value);
                        }}
                      />
                    </Box>

                    <PriceFields
                      state={this.state}
                      estimateOfferPrice={estimateOfferPrice}
                    />

                    <Box pad="none" margin={{ bottom: '20px' }}>
                      <FormField name="Size" label={t('totalAmount')}>
                        <NumberInput
                          type="text"
                          addonEnd={{
                            content: (
                              <Text size="xsmall" textAlign="end">
                                {this.state.selectedBaseCurrency.value}
                              </Text>
                            ),
                            background: 'primary',
                            onClick: () => {},
                          }}
                          precision={8}
                          margin="none"
                        />
                      </FormField>
                      {_.isEqual(this.state.Side, 'SELL') && (
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
                                from={this.state.selectedBaseCurrency.value}
                                to={this.state.selectedQuoteCurrency.value}
                                amount={P2PBalance.Balance}
                              />
                            </Text>
                            <Text size="xsmall">
                              {this.state.selectedQuoteCurrency.value}
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
                          <Box pad="none" margin={{ bottom: '20px' }}>
                            <FormField name="OrderLimit_LB">
                              <NumberInput
                                type="text"
                                addonEnd={{
                                  content: (
                                    <Text size="xsmall" textAlign="end">
                                      {this.state.selectedQuoteCurrency.value}
                                    </Text>
                                  ),
                                  background: 'primary',
                                  onClick: () => {},
                                }}
                                precision={2}
                                margin={{ bottom: '0px' }}
                              />
                            </FormField>
                          </Box>
                        </Columns.Column>
                        <Columns.Column
                          size={6}
                          className={styles.customizedColumn}
                        >
                          <Box pad="none" margin={{ bottom: '20px' }}>
                            <FormField name="OrderLimit_UB">
                              <NumberInput
                                type="text"
                                addonEnd={{
                                  content: (
                                    <Text size="xsmall" textAlign="end">
                                      {this.state.selectedQuoteCurrency.value}
                                    </Text>
                                  ),
                                  background: 'primary',
                                  onClick: () => {},
                                }}
                                precision={2}
                                margin={{ bottom: '0px' }}
                                inputOnChange={e => {
                                  const {
                                    target: { name, value },
                                  } = e;
                                  const newValue = numberParser.parse(value);
                                  this.setState({ orderUL: newValue });
                                }}
                              />
                            </FormField>
                          </Box>
                        </Columns.Column>
                      </Columns>
                    </Box>

                    <Box pad="none">
                      <Text className={styles.formLabel}>
                        {t('paymentMethod')}
                      </Text>
                      <Columns className={styles.customizedColumns}>
                        <Columns.Column
                          size={6}
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
                              margin="none"
                              margin={{ bottom: '0px' }}
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
                          size={6}
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
                          name="agree1"
                          label={t('completedKYC')}
                          checked={
                            profile.kycStatus === 'Approved' ? true : false
                          }
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
                              &nbsp;{this.state.selectedBaseCurrency.value}
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
                          t('onlineRightNow'),
                          t('offlineManuallyLater'),
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
                      width="large"
                      pad="medium"
                      heading={t('confirmToPost')}
                    >
                      <OfferSubmitModal
                        handleSuccess={this.toggleModal}
                        values={values}
                        profile={profile}
                        isRegisteredXDaysAgo={this.state.isRegisteredXDaysAgo}
                        isMinBTCHolding={this.state.isMinBTCHolding}
                        estimateOfferPrice={this.state.estimateOfferPrice}
                      />
                    </Modal>
                  </Form>
                )}
              </Formik>
            </Box>
          </Box>
        </PageWrap>
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({
  p2p: { p2pCurrencies, p2pUserPaymentMethods },
  user,
}) => ({
  p2pCurrencies: p2pCurrencies,
  profile: user.profile,
  p2pUserPaymentMethods,
});

export default withNamespaces()(
  connect(mapStateToProps, {
    triggerToast,
    triggerModalOpen,
  })(PostOffer),
);
