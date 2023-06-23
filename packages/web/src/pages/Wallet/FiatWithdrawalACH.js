import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { connect } from 'react-redux';
import { withNamespaces, Trans } from 'react-i18next';
import {
  Box,
  Button,
  Heading,
  Tag,
  Paragraph,
  Columns,
  Column,
  Text
} from 'components/Wrapped';

import { authenticatedInstance } from 'api';
import { nestedTranslate } from 'utils/strings';
import { formatFiat, trimNumber, divide, multiply, add, formatNumberToPlaces } from 'utils';
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import { FormField, TextField, NumberInput, CheckBox, SelectField } from 'components/Form';
import { triggerToast } from 'redux/actions/ui';
import { PlaidLink } from 'pages/Wallet';
import { useQuery, useMutation, queryCache } from 'react-query';
import {AddDepositBanks} from './AddbankDepositACH';
import { getWithdrawalHistory } from 'redux/actions/portfolio';
import { exchangeApi } from 'api';
import RequestWithdrawalCode from './RequestWithdrawalCode';
import styles from './Wallet.module.scss';
import instance from 'api';

const WithdrawalFormOtp = ({ onSuccess, t, currency, BankList}) => {
  const ts = nestedTranslate(t, 'forms.walletWithdrawal');
  const { values } = useFormikContext();
  const { amount, bank_id } = values;
  let address =''
  if(BankList !== undefined){
    BankList.forEach(evl => {
      if(evl.value === bank_id) {
        address = evl.label;
      }
    
  });
  }

  

  let enabled = false;
if(amount > 0 && address !== ''){
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



class FiatWithdrawalACH extends React.Component {

  constructor(){
        super();
        window.helloComponent = this;
        this.handleOtpSuccess = this.handleOtpSuccess.bind(this);
    }


    state = {
        selectedOption: { value: '', label: '' },
        paymentGateway: {},
        isLoading: true,
        isSubmitted: false,
        isSubmitting: false,
        hasIframeClosed: false,
        totalAmount: 0,
        linkToken: '',
        bankdetails: [],
        isaddaccounthidden: false,
        emailOtpSuccess: false,
        tempToken: ''
      };
      static propTypes = {
        currency: PropTypes.string.isRequired,
      };

      getunverifiedbanks = async () => {
        try {
          const { data } = await instance({
            url: '/checkbook/get-unverified-banks',
            method: 'GET',
          });
    
          if (data.status === 'Success') {
            if(data.data.length > 0) {
              this.setState({
                bankdetails: data.data[0],
                isaddaccounthidden: true
              });
            } else {
              this.setState({
                isaddaccounthidden: false
              });
            }
           
          } 
        } catch (e) {}
      }
    
      async getPgList() {
        const { currency } = this.props;
    
        try {
          const { data } = await authenticatedInstance({
            url: `/api/Get_Fiat_PGs`,
            method: 'GET',
            data: {
              Currency: currency,
              Method: 'withdraw'
            },
          });

          if (data.data[0]) {
            data.data.forEach(element => {
              if (element.pG_Name.toLowerCase() === "checkbook") {
                  this.setState({
                    paymentGateway: { ...element },
                    isLoading: false,
                  });
              }
            });
          }


        } catch (e) {}
      }

      async reloadPage(){
       // console.log("reload called");
        this.getBankList();
        this.setState({
          hasIframeClosed: true,
        });
        this.render();
        //console.log("reload called finished");
      }

      async getPlaidKey() {
        try {
          const { data } = await authenticatedInstance({
            url: `/checkbook/get-plaid-key`,
            method: 'GET',
          });
     
          if (data.status === 'Success') {
           this.setState({linkToken: data.data.link_token});
          }
        } catch (e) { }
      }

      async getBankList() {
        try {
          const { data } = await authenticatedInstance({
            url: `/checkbook/get-banks`,
            method: 'GET',
          });
          if (data.status === 'Success') {
            let tempBankList = [];
            data.data.map(label => {
                let obj = {
                    value: label.id,
                    label: label.bankName + ' - ' + label.accountID
                }
                tempBankList.push(obj)
            });
            this.setState({BankList: tempBankList});
          }
        } catch (e) { }
      }
      
      handleOtpSuccess(data) {
        this.setState({emailOtpSuccess: true});
        this.setState({tempToken: data.token});
      }
    
      componentDidMount() {
        
        this.getPgList();
        this.getPlaidKey();
        this.getBankList();
        this.getunverifiedbanks();
      }
    
      componentDidUpdate(prevProps) {
        if (this.props.currency !== prevProps.currency) {
          this.getPgList();
          this.getPlaidKey();
          this.getBankList();
        }
      }
    
      async submitWithdrawalRequest(values) {
        try {
          const { triggerToast, t } = this.props;
          const { amount, gauth_code } = values;
    
          const { data } = await authenticatedInstance({
            url: '/checkbook/withdraw',
            method: 'POST',
            data: {
              amount: parseFloat(amount),
              gauth_code: gauth_code,
              token: this.state.tempToken
            },
          });
    
          this.setState({ isSubmitting: false });
    
          if (data.status === 'Success') {
            // const { redirectURL } = data.data;
            triggerToast(t(data.message), 'success');
            this.props.getWithdrawalHistory(this.props.currency);
            this.setState({
              isSubmitted: true,
            });
          } else {
            triggerToast(t(data.message), 'error');
          }
        } catch (e) {
          console.log(e);
        }
      }

      async submitVerifyRequest(values) {
        try {
          const { triggerToast, t } = this.props;
          const { amount1, amount2 } = values;
    
          const { data } = await authenticatedInstance({
            url: '/checkbook/verify-bank',
            method: 'POST',
            data: {
              amount1: parseFloat(amount1),
              amount2: parseFloat(amount2),
            },
          });
    
         
          this.setState({ submitVerify: false });
          if (data.status === 'Success') {
            // const { redirectURL } = data.data;
            triggerToast(data.message, 'success');
            this.getunverifiedbanks();  
            this.getBankList();
          } else {
            triggerToast(data.message, 'error');
          }
        } catch (e) {
          console.log(e);
        }
      }

      async submitdeletebank() {
        try {
          const { data } = await authenticatedInstance({
            url: '/checkbook/remove-unverified-bank',
            method: 'POST',
          });
    
    
          if (data.status === 'Success') {
            // const { redirectURL } = data.data;
            triggerToast(data.message, 'success');
            this.getunverifiedbanks();
          } else {
            triggerToast(data.message, 'error');
          }
        } catch (e) {
          console.log(e);
        }
      }
    
      getFee(amount = 0) {
        const {
          paymentGateway: { fee_In_Percent, fixedFee, maxFee, minFee },
        } = this.state;
        let numberAmount = parseFloat(amount);
        let fee = trimNumber(
          add(multiply(numberAmount, divide(fee_In_Percent, 100)), fixedFee),
          2,
        );
    
        if (fee < minFee) {
          fee = minFee;
        } else if (fee > maxFee) {
          fee = maxFee;
        }
    
        const totalAmount = add(parseFloat(numberAmount), parseFloat(fee)) || '0';
    
        return {
          fee: formatFiat(fee, true),
          totalAmount: formatFiat(totalAmount, true),
          amount: numberAmount,
        };
      }

      renderWithdrawalForm() {
        const {
          isLoading,
          isSubmitted,
          isSubmitting,
          paymentGateway,
          linkToken
        } = this.state;
        const {
            t: translate,
            currency,
            decimalPrecision,
            gAuthEnabled,
            balanceInfo: { balance },
            calculateServiceCharge
        } = this.props;

        const ts = nestedTranslate(translate, 'forms.fiatWithdrawalManual');
        const formT = nestedTranslate(translate, 'forms.fiatDepositPg');
        const { BankList, isaddaccounthidden } = this.state;
        const isUsingGAuth = gAuthEnabled;
    
        return (
          <React.Fragment>
             <Box background="background-4" margin={{bottom:"10px"}}>
{
     !isLoading && (
      <React.Fragment>
        <Heading level={3}>{translate('forms.fiatDeposit.ACH')}</Heading>
        {!isSubmitted ? (
          <Formik
            initialValues={{
              amount: '',
              bank_id: '',
              gauth_code: '',
              token:''
            }}
            validationSchema={Yup.object().shape({
              amount: Yup.number()
                .required()
                .min(paymentGateway.minTxnAmount)
                .max(paymentGateway.maxTxnAmount),
              bank_id: Yup.string().required(),
              gauth_code: Yup.string()
              .required()
              .min(6),
            })}
            onSubmit={({ agree, ...values }) => {
              this.setState({ isSubmitting: true });
              this.submitWithdrawalRequest(values);
            }}
          >
            {({ values, resetForm, setFieldValue }) => {
              const { fee, totalAmount } = this.getFee(values.amount);

              return (
                <Form>
              <Tag.Group>
                <Tag>
                  {`${ts('minWithdrawal.label')}: ${
                    paymentGateway.minTxnAmount
                  } ${currency}`}
                </Tag>
                <Tag>
                  {`${ts('maxWithdrawal.label')}: ${
                    paymentGateway.maxTxnAmount
                  } ${currency}`}
                </Tag>
                <Tag>
                  {`${ts('percentFee.label')}: ${
                    paymentGateway.fee_In_Percent
                  }%`}
                </Tag>
                {paymentGateway.fixedFee > 0 && (
                  <Tag>
                    {`${ts('fixedFee.label')}: ${
                      paymentGateway.fixedFee
                    } ${currency}`}
                  </Tag>
                )}
                <Tag>
                  {`${ts('minFee.label')}: ${
                    paymentGateway.minFee
                  } ${currency}`}
                </Tag>
                <Tag>
                  {`${ts('maxFee.label')}: ${
                    paymentGateway.maxFee
                  } ${currency}`}
                </Tag>
              </Tag.Group>
              
                  <Columns>
                  <Column width={[1, 1, 1 / 2]}>
                  {BankList && (
                    <React.Fragment>
                  
                   <FormField name="bank_id" label={ts('selectBank.label')}>
                      <Field
                          name="bank_id"
                          component={SelectField}
                          options={BankList}
                          hasIcon={false}
                          style={{margin: "0px"}}
                          placeholder={ts('selectBank.label')}
                      />
                      </FormField>
                  <ErrorMessage
                      name="bank_id"
                      component="div"
                      style={{marginTop:"-32px", marginBottom:"10px"}}
                      className={styles.errorMessage}
                    />
                   

                    </React.Fragment>
                  )}
                  </Column>
                      <Column width={[1, 1, 1 / 2]}  style={{marginTop:"25px"}}>
                      <div style={{display:"flex", alignItems: "center", justifyContent: "flex-start"}}>
                      
                      <div style={{marginRight: "10px"}}>
                   {linkToken && (
                         <PlaidLink token={linkToken} getBank={
                             this.reloadPage} />
                     )}
                     </div> 

{!isaddaccounthidden && 
<div>
                    
<AddDepositBanks oncall={this.getunverifiedbanks}/>
</div>
}
               
                  
                      </div>
                      </Column>
                  </Columns>

                  <FormField name="amount" label={ts('amount.label')}>
                    <NumberInput type="text" precision={decimalPrecision} />
                  </FormField>

                  
              {!isUsingGAuth && (
              // <RequestWithdrawalCode
              //   requestMethod={exchangeApi.requestWithdrawalCode}
              //   // requestData={{ currency, address, memo }}
              //   messageText={ts('emailOtpMessage')}
              //   buttonText={ts('emailOtpButton')}
              //   successText={ts('emailOtpSuccessMessage')}
              //   successState={this.state.emailOtpSuccess}
              //   handleSuccess={() => this.state.emailOtpSuccess(true)}
              // />
              // this.WithdrawalFormOtp(currency)
              <WithdrawalFormOtp onSuccess={this.handleOtpSuccess} t={translate} currency={currency} BankList={BankList} />

            )}

            <FormField
              name="gauth_code"
              label={
                isUsingGAuth
                  ? translate('forms.common.gAuth')
                  : ts('emailOtp')
              }
            >
              <TextField
                type="text"
                placeholder={
                  isUsingGAuth
                    ? translate('forms.common.gAuth')
                    : ts('emailOtp')
                }
              />
            </FormField>

            {/* <WithdrawalHeadingValue
                heading={translate('wallet.withdrawals.serviceCharge')}
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
              /> */}
                                  <FormField label={formT('fee.label')}>
                      <Paragraph
                        margin={{ bottom: 'xsmall' }}
                      >{`${fee} ${currency}`}</Paragraph>
                    </FormField>

                    <FormField label={formT('charge.label')}>
                      <Paragraph
                        margin={{ bottom: 'xsmall' }}
                      >{`${totalAmount} ${currency}`}</Paragraph>
                    </FormField>

                  <Button
                    type="submit"
                    color="primary"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    margin={{ vertical: 'small' }}
                  >
                    {translate('buttons.submit')}
                  </Button>
                </Form>
              );
            }}
          </Formik>
        ) : (
          <p>{ts('achmessage')}</p>
        )}


      </React.Fragment>
    )
}
             </Box>

             {isaddaccounthidden && 
           <Box background="background-4">
           {this.renderUnverifiedForm()}
           </Box >
          }
          </React.Fragment>
       
        );
      }

      renderUnverifiedForm() {
        const {
          isLoading,
          isSubmitted,
          submitVerify,
       
        } = this.state;
        const { t, decimalPrecision } = this.props;
        const formT = nestedTranslate(t, 'forms.fiatDepositPg');
        const { bankdetails } = this.state;
        return (
        <React.Fragment>
          {!isLoading && (
            <React.Fragment>
              <Heading level={3} margin={{bottom:"15px"}}>Complete Verification</Heading>
              <Box pad="small" margin={{bottom: "small"}} background="background-2">
                <Text>Bank Name: {bankdetails?.bankName} </Text>
                <Text>Account Number: {bankdetails?.accountNo} </Text>
                <Text>Account Type: {bankdetails?.type}</Text>
                <Text>Bank Routing Code: {bankdetails?.routing} </Text>
              </Box>
              {!isSubmitted ? (
                <Formik
                  initialValues={{
                    amount1: 0,
                    amount2: 0
                  }}
                  validationSchema={Yup.object().shape({
                    amount1: Yup.number()
                      .required(),
                      amount2: Yup.number()
                      .required(),
                    // comment: Yup.string().max(250),
                    // agree: Yup.bool().oneOf(
                    //   [true],
                    //   t('forms.fiatDepositPg.disclaimer.error'),
                    // ),
                  })}
                  onSubmit={({...values }) => {
                    this.setState({ submitVerify: true });
                    this.submitVerifyRequest(values);
                  }}
                >
                  {() => {
                    
    
                    return (
                      <Form>
               
                     
           
              <Columns>
          <Column width={[1, 1, 1 / 3]}>
          <FormField name="amount1" label="Amount 1">
                          <NumberInput type="text" precision={decimalPrecision} />
                        </FormField>
            </Column>
            <Column width={[1, 1, 1 / 3]}>
            <FormField name="amount2" label="Amount 2">
                          <NumberInput type="text" precision={decimalPrecision} />
                        </FormField>
            </Column>
            <Column width={[1, 1, 1 / 3]} style={{marginTop: "28px"}}>
            <Button type="submit" color="primary" disabled={submitVerify}
                          loading={submitVerify}> Verify Bank</Button>
            </Column>
            </Columns>
                       
 
                    
    
                
                      </Form>
                    );
                  }}
                </Formik>


              ) : (
                <></>
              )}
    
<Box pad="small" margin={{bottom: "small"}} background="background-2">
  <Text>
  You can cancel this bank verification request  
  <Text color="primary" onClick={() => { this.submitdeletebank() }} style={{cursor:"pointer"}}> here</Text> 
  </Text>
  </Box>
    
            </React.Fragment>
          )}
     
          </React.Fragment>
        );
      }

    render() {
        const { balanceInfo, currency, t: translate } = this.props;
        const t = nestedTranslate(translate, 'wallet.withdrawals');

        return (
            <React.Fragment>
                <Box pad={{ vertical: 'small' }}>
                    <WithdrawalHeadingValue
                    heading={t('totalBalance')}
                    value={`${formatNumberToPlaces(balanceInfo.totalBalance)} ${currency}`}
                    />
                    <WithdrawalHeadingValue
                    heading={t('inOrders')}
                    value={`${formatNumberToPlaces(balanceInfo.balanceInTrade)} ${currency}`}
                    />
                    <WithdrawalHeadingValue
                    heading={t('availableBalance')}
                    value={`${formatNumberToPlaces(balanceInfo.balance)} ${currency}`}
                    />
                </Box>
                {this.renderWithdrawalForm()}
            </React.Fragment>
        );
      }
}

export const WithdrawalHeadingValue = ({ heading, value }) => (
    <p>
      {`${heading}: `}
      <strong>{value}</strong>
    </p>
  );

FiatWithdrawalACH.propTypes = {

};

const mapStateToProps = ({
    markets,
    portfolio,
    auth: { gAuthEnabled },
  }) => ({
    coins: markets.currencies,
    addresses: portfolio.addresses,
    portfolios: portfolio.portfolios,
    gAuthEnabled,
  });

export default withNamespaces()(
    connect(
        mapStateToProps,
      { triggerToast, getWithdrawalHistory },
    )(FiatWithdrawalACH),
  );