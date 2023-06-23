import React, { Component } from 'react';
import PropTypes, { string } from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { authenticatedInstance } from 'api';
import { FormField, TextField, NumberInput } from 'components/Form';
import {
  getWithdrawalHistory,
  withdrawalRequest,
} from 'redux/actions/portfolio';
import { formatFiat, numberParser, formatNumberToPlaces } from 'utils';
import { ConfirmModal } from 'containers/Modals';
import { nestedTranslate } from 'utils/strings';
import { withNamespaces } from 'react-i18next';
import { triggerToast, triggerModalOpen } from 'redux/actions/ui';
import { WithdrawalHeadingValue } from './Withdrawal';
import {
  Button,
  Box,
  Tag,
  Paragraph,
  Heading,
  Text,
  Columns,
  Column,
} from 'components/Wrapped';
import { exchangeApi } from 'api';
import { ReactSelect } from 'components/Form/SelectField';
import RequestWithdrawalCode from './RequestWithdrawalCode';
import { Link } from 'react-router-dom';
import styles from './Wallet.module.scss';

const WithdrawalFormOtp = ({ onSuccess, t, currency, BankList }) => {
  const ts = nestedTranslate(t, 'forms.walletWithdrawal');
  const { values } = useFormikContext();
  const { RequestAmount } = values;
  let address = BankList.bankName + '-' + BankList.accountNumber;
  let amount = RequestAmount;

  let enabled = false;
  if (amount > 0 && address !== '') {
    enabled = true;
  }
  return (
    <RequestWithdrawalCode
      messageText={ts('emailOtpMessage')}
      successText={ts('emailOtpSuccessMessage')}
      buttonText={ts('emailOtpButton')}
      requestMethod={exchangeApi.requestWithdrawalCode}
      requestData={{ currency, address, amount }}
      background="background-3"
      disabled={!enabled}
      handleSuccess={onSuccess}
    />
  );
};

const FIXED = 'Fixed';
const PERCENTAGE = 'Percentage';
const BOTH = 'Fixed + Percentage';

class FiatWithdrawalManual extends Component {
  constructor() {
    super();
    // this.handleOtpSuccess = this.handleOtpSuccess.bind(this);
  }

  static propTypes = {
    currency: PropTypes.string.isRequired,
    currencyInfo: PropTypes.object.isRequired,
  };

  state = {
    modalOpen: false,
    emailOtpSuccess: false,
    bankList: [],
    selectedOption: { value: '', label: '' },
    selectedBankDetails: {},
    emailToken: '',
    smsToken: '',
  };

  // handleOtpSuccess(data) {
  //   this.setState({ emailOtpSuccess: true });
  //   this.setState({ tempToken: data.token });
  // }

  componentDidMount() {
    const { currency } = this.props;
    this.getFiatCustomerAccounts({ currency });
    this.setState({
      selectedOption: this.renderCustomerAccountOptions()[0],
    });
  }

  componentDidUpdate(prevProps) {
    const { currency } = this.props;
    if (currency !== prevProps.currency) {
      this.getFiatCustomerAccounts({ currency });
      this.setState({
        selectedOption: this.renderCustomerAccountOptions()[0],
      });
    }
  }

  closeModal = () => {
    this.setState({
      modalOpen: false,
    });
  };

  renderCustomerAccountOptions = () => {
    const { t: translate } = this.props;

    if (this.state.bankList.length > 0) {
      let options = this.state.bankList.map(value => ({
        value: `${value.bankName}-${value.accountNumber}`,
        label: `${value.bankName} - ${value.accountNumber}`,
      }));
      options.unshift({ value: '', label: translate('forms.common.select') });

      return options;
    } else {
      const options = [{ value: '', label: translate('forms.common.select') }];
      return options;
    }
  };

  handleChange = selectedOption => {
    this.setState({ selectedOption });
    this.renderBankForm(selectedOption);
  };

  renderBankForm(selectedOption) {
    const { bankList } = this.state;
    const selectedBank = selectedOption.value.split('-');

    let selectedBankData = {};
    bankList.map(field => {
      if (
        field.bankName === selectedBank[0] &&
        field.accountNumber === selectedBank[1]
      ) {
        selectedBankData = field;
      }
    });
    this.setState({ selectedBankDetails: selectedBankData });
  }

  getFiatCustomerAccounts = async ({
    Module: Module,
    Bankid: Bankid,
    currency: Currency,
  }) => {
    try {
      const { t, triggerToast } = this.props;

      const { data } = await authenticatedInstance({
        url: 'api/Get_Fiat_CustomerAccounts',
        method: 'GET',
        data: {
          Module: Module,
          Bankid: Bankid,
          Currency: Currency,
        },
      });

      if (data.status === 'Success') {
        this.setState({ bankList: data.data });
      } else {
        triggerToast(t(data.message), 'error');
      }
    } catch (e) {
      console.log(e);
    }
  };

  handleSubmit = async (values, actions) => {
    try {
      const {
        triggerToast,
        t,
        triggerModalOpen,
        calculateServiceCharge,
        balanceInfo: { balance, balanceInTrade, totalBalance },
        isMobileVerified,
      } = this.props;
      const { selectedBankDetails } = this.state;
      const { willReceive } = calculateServiceCharge(
        balance,
        values.RequestAmount,
      );

      values.RequestAmount = willReceive.toString();
      values.CurrencyName = selectedBankDetails.accountCurrency;
      // values.AccountId = selectedBankDetails.id;
      values.BankName = selectedBankDetails.bankName;
      values.BeneficiaryName = 'Self';
      values.AccountNumber = selectedBankDetails.accountNumber;
      values.BankRoutingCode = selectedBankDetails.bankRoutingCode;
      values.SwiftCode = selectedBankDetails.swiftCode;

      if (isMobileVerified) {
        values.sms_token = this.state.smsToken;
      }

      const { data } = await authenticatedInstance({
        url: '/api/withdraw-fiat?fee=v2',
        method: 'POST',
        data: {
          ...values,
          email_token: this.state.emailToken,
        },
      });

      if (data.status === 'Success') {
        triggerModalOpen('withdrawalRequest');
        actions.resetForm();
        this.props.changePaymentMethod();
      } else {
        triggerToast(t(data.message), 'error');
      }
    } catch (e) {
      console.log(e);
    }
    this.closeModal();
  };

  validationSchema = () => {
    const { currencyInfo, t, gAuthEnabled, isMobileVerified } = this.props;
    const isUsingGAuth = gAuthEnabled;

    return Yup.object().shape({
      RequestAmount: Yup.number()
        .typeError(t('forms.validations.required'))
        .min(currencyInfo.minWithdrawalLimit)
        .required(),
      // BankName: Yup.string().required(),
      // BeneficiaryName: Yup.string().required(),
      // AccountNumber: Yup.string().required(),
      // BankRoutingCode: Yup.string().required(),
      // SwiftCode: Yup.string().required(),
      email_otp: Yup.string()
        .required()
        .min(6),
      gauth_code: isUsingGAuth
        ? Yup.string()
            .required()
            .min(6)
        : Yup.string(),
      sms_otp: isMobileVerified
        ? Yup.string()
            .required()
            .min(6)
        : Yup.string(),
    });
  };

  renderWithdrawalServiceCharge(currency) {
    const { currencyInfo } = this.props;
    const withdrawalServiceChargeType = _.get(
      currencyInfo,
      'withdrawalServiceChargeType',
    );
    const withdrawalServiceChargeFixed = formatNumberToPlaces(
      _.get(currencyInfo, 'withdrawalServiceChargeFixed'),
    );
    const withdrawalServiceChargePercentage = formatNumberToPlaces(
      _.get(currencyInfo, 'withdrawalServiceChargePercentage'),
    );

    switch (withdrawalServiceChargeType) {
      case FIXED:
        return {
          fixedCharge: `${withdrawalServiceChargeFixed} ${currency}`,
          PercentageCharge: null,
        };
      case PERCENTAGE:
        return {
          PercentageCharge: `${withdrawalServiceChargePercentage}%`,
          fixedCharge: null,
        };
      case BOTH:
        return {
          fixedCharge: `${withdrawalServiceChargeFixed} ${currency}`,
          PercentageCharge: `${withdrawalServiceChargePercentage}%`,
        };
      default:
        return '';
    }
  }

  requestEmailCode = async (
    RequestAmount,
    accountNumber,
    currency,
    otpType,
  ) => {
    if (RequestAmount > 0 && accountNumber !== '') {
      try {
        const { data } = await authenticatedInstance({
          url: '/api/RequestWithdraw_EmailOTP',
          method: 'POST',
          data: {
            amount: RequestAmount,
            currency: currency,
            address: accountNumber,
            otp_type: otpType,
          },
        });

        if (data.status === 'Success') {
          if (otpType === 'sms') {
            this.setState({ smsToken: data.data.token });
          } else if (otpType === 'email') {
            this.setState({ emailToken: data.data.token });
          }

          triggerToast(data.message, 'success');
        } else {
          triggerToast(data.message, 'error');
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  render() {
    const {
      match: {
        params: { currency },
      },
      currencyInfo,
      t: translate,
      calculateServiceCharge,
      balanceInfo: { balance, balanceInTrade, totalBalance },
      decimalPrecision,
      gAuthEnabled,
      isMobileVerified,
      email,
      mobileNumber,
    } = this.props;
    const isUsingGAuth = gAuthEnabled;
    const t = nestedTranslate(translate, 'forms.fiatWithdrawalManual');
    const ts = nestedTranslate(translate, 'wallet.withdrawals');
    const tss = nestedTranslate(translate, 'forms.walletWithdrawal');
    const { selectedBankDetails } = this.state;

    const {
      fixedCharge,
      PercentageCharge,
    } = this.renderWithdrawalServiceCharge(currency);

    return (
      <React.Fragment>
        <Box pad={{ vertical: 'small' }}>
          <WithdrawalHeadingValue
            heading={ts('totalBalance')}
            value={`${formatNumberToPlaces(totalBalance)} ${currency}`}
          />
          <WithdrawalHeadingValue
            heading={ts('inOrders')}
            value={`${formatNumberToPlaces(balanceInTrade)} ${currency}`}
          />
          <WithdrawalHeadingValue
            heading={ts('availableBalance')}
            value={`${formatNumberToPlaces(balance)} ${currency}`}
          />
        </Box>

        <Box background="background-4">
          <Paragraph color="status-warning">{ts('fiatWarning')}</Paragraph>
          <Tag.Group>
            {!_.isEqual(fixedCharge, null) &&
              _.isEqual(PercentageCharge, null) && (
                <Tag>
                  {ts('fee')} {`${fixedCharge}`}
                </Tag>
              )}
            {_.isEqual(fixedCharge, null) &&
              !_.isEqual(PercentageCharge, null) && (
                <Tag>
                  {ts('fee')} {`${PercentageCharge}`}
                </Tag>
              )}
            {!_.isEqual(fixedCharge, null) &&
              !_.isEqual(PercentageCharge, null) && (
                <Tag>
                  {ts('fee')} {`${fixedCharge} + ${PercentageCharge}`}
                </Tag>
              )}
          </Tag.Group>
          <Columns>
            <Column
              width={[1, 1, 1 / 2]}
              style={{ paddingLeft: '0px', paddingBottom: '0px' }}
            >
              <Box pad="none">
                <Heading level={6} margin={{ bottom: 'xsmall' }}>
                  {t('SelectBank')}
                </Heading>
                <ReactSelect
                  options={this.renderCustomerAccountOptions()}
                  onChange={this.handleChange}
                  value={this.state.selectedOption}
                  margin={{ bottom: 'small' }}
                />
              </Box>
            </Column>
            <Column
              width={[1, 1, 1 / 6]}
              style={{ paddingLeft: '0px', paddingBottom: '0px' }}
            >
              <div style={{ marginBottom: '10px' }}>
                {window.innerWidth > 480 && (
                  <div style={{ marginBottom: '3px' }}>&nbsp;</div>
                )}

                <Link to={`/wallet/banks/${currency}`}>
                  <Button
                    fullwidth={true}
                    color="primary"
                    type="submit"
                    className="btn"
                  >
                    + {t('Addbank')}
                  </Button>
                </Link>
              </div>
            </Column>
          </Columns>
          {this.state.selectedOption.value !== '' && (
            <React.Fragment>
              <Box
                pad="small"
                margin={{ bottom: 'small' }}
                background="background-2"
              >
                <Text>
                  {t('bankname')}: {selectedBankDetails?.bankName}
                </Text>
                <Text>
                  {t('accountnumber')}: {selectedBankDetails?.accountNumber}
                </Text>
                <Text>
                  {t('accounttype')}: {selectedBankDetails?.accountType}
                </Text>
                <Text>
                  {t('accountCurrency')}: {selectedBankDetails?.accountCurrency}
                </Text>
                <Text>
                  {t('routingcode')}: {selectedBankDetails?.bankRoutingCode}
                </Text>
                <Text>
                  {t('swiftcode')}: {selectedBankDetails?.swiftCode}
                </Text>
              </Box>
              {!_.isEmpty(currencyInfo) ? (
                <Formik
                  validationSchema={this.validationSchema()}
                  initialValues={{
                    RequestAmount: '',
                    gauth_code: '',
                    email_otp: '',
                  }}
                  onSubmit={this.handleSubmit}
                >
                  {({ values, resetForm, setFieldValue }) => {
                    const {
                      serviceCharge,
                      balanceAfter,
                      willReceive,
                    } = calculateServiceCharge(balance, values.RequestAmount);

                    return (
                      <Form>
                        <FormField
                          name="RequestAmount"
                          label={t('requestAmount.placeholder')}
                        >
                          <NumberInput
                            type="text"
                            addonEnd={{
                              content: `${formatNumberToPlaces(
                                balance,
                              )} ${currency}`,
                              onClick: () =>
                                setFieldValue('RequestAmount', balance),
                              background: 'primary',
                            }}
                            precision={decimalPrecision}
                          />
                        </FormField>
                        <Box pad="none" className={styles.verificationFieldBox}>
                          <Box pad="none" className={styles.fieldBox}>
                            <Box pad="none" margin={{ bottom: '20px' }}>
                              <FormField
                                name="email_otp"
                                label={t(
                                  'emailandSMSVerificationCode.placeholder',
                                )}
                              >
                                <TextField
                                  type="text"
                                  placeholder={t(
                                    'emailandSMSVerificationCode.placeholder',
                                  )}
                                  className={styles.modifiedTextField}
                                  margin={{ bottom: '0px' }}
                                />
                              </FormField>
                              <div>{t('emailVerificationMsg', { email })}</div>
                            </Box>
                          </Box>
                          <Box pad="none">
                            <div style={{ marginBottom: '2px' }}>&nbsp;</div>
                            <Button
                              color="primary"
                              type="button"
                              disabled={
                                values.RequestAmount <= 0 ||
                                selectedBankDetails?.accountNumber == ''
                              }
                              onClick={() =>
                                this.requestEmailCode(
                                  values.RequestAmount,
                                  selectedBankDetails.accountNumber,
                                  currency,
                                  'email',
                                )
                              }
                              className={styles.modifiedBtnAddon}
                            >
                              {tss('emailOtpButton')}
                            </Button>
                          </Box>
                        </Box>
                        {isMobileVerified && (
                          <Box
                            pad="none"
                            className={styles.verificationFieldBox}
                          >
                            <Box pad="none" className={styles.fieldBox}>
                              <Box pad="none" margin={{ bottom: '20px' }}>
                                <FormField
                                  name="sms_otp"
                                  label={t('smsVerificationCode.placeholder')}
                                >
                                  <TextField
                                    type="text"
                                    placeholder={t(
                                      'smsVerificationCode.placeholder',
                                    )}
                                    className={styles.modifiedTextField}
                                    margin={{ bottom: '0px' }}
                                  />
                                </FormField>
                                <div>
                                  {t('smsVerificationMsg', { mobileNumber })}
                                </div>
                              </Box>
                            </Box>
                            <Box pad="none">
                              <div style={{ marginBottom: '2px' }}>&nbsp;</div>
                              <Button
                                color="primary"
                                type="button"
                                disabled={
                                  values.RequestAmount <= 0 ||
                                  selectedBankDetails?.accountNumber == ''
                                }
                                onClick={() =>
                                  this.requestEmailCode(
                                    values.RequestAmount,
                                    selectedBankDetails.accountNumber,
                                    currency,
                                    'sms',
                                  )
                                }
                                className={styles.modifiedBtnAddon}
                              >
                                {tss('emailOtpButton')}
                              </Button>
                            </Box>
                          </Box>
                        )}
                        {isUsingGAuth && (
                          <FormField
                            name="gauth_code"
                            label={translate('forms.common.gAuth')}
                          >
                            <TextField
                              type="text"
                              placeholder={translate('forms.common.gAuth')}
                            />
                          </FormField>
                        )}
                        <WithdrawalHeadingValue
                          heading={translate(
                            'wallet.withdrawals.serviceCharge',
                          )}
                          value={formatNumberToPlaces(serviceCharge)}
                        />
                        <WithdrawalHeadingValue
                          heading={translate('wallet.withdrawals.willReceive')}
                          value={formatNumberToPlaces(willReceive)}
                        />
                        <WithdrawalHeadingValue
                          heading={translate('wallet.withdrawals.balanceAfter')}
                          value={`${formatNumberToPlaces(balanceAfter)}
                          ${currency}`}
                        />
                        ​
                        <Button
                          fullwidth={true}
                          color="primary"
                          type="submit"
                          className="m-t-sm"
                        >
                          {translate('buttons.submit')}
                        </Button>
                      </Form>
                    );
                  }}
                </Formik>
              ) : null}
            </React.Fragment>
          )}
        </Box>
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({
  markets,
  portfolio,
  auth: { gAuthEnabled },
  user: {
    profile: { isMobileVerified, email, mobileNumber },
  },
}) => ({
  coins: markets.currencies,
  addresses: portfolio.addresses,
  portfolios: portfolio.portfolios,
  gAuthEnabled,
  isMobileVerified,
  email,
  mobileNumber,
});

export default withRouter(
  withNamespaces()(
    connect(mapStateToProps, {
      getWithdrawalHistory,
      withdrawalRequest,
      triggerToast,
      triggerModalOpen,
    })(FiatWithdrawalManual),
  ),
);
