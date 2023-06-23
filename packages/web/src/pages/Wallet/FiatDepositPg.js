import React from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withNamespaces, Trans } from 'react-i18next';
import { Loading } from 'components/Loading';
import { Box, Button, Heading, Tag, Paragraph } from 'components/Wrapped';
import { callRenewTokenFun } from 'redux/actions/profile';

import { authenticatedInstance } from 'api';
import { nestedTranslate } from 'utils/strings';
import { formatFiat, trimNumber, divide, multiply, add } from 'utils';
import { Formik, Form } from 'formik';
import { FormField, TextField, NumberInput, CheckBox } from 'components/Form';
import { triggerToast } from 'redux/actions/ui';

class FiatDepositPg extends React.Component {
  state = {
    selectedOption: { value: '', label: '' },
    paymentGateway: {},
    isLoading: true,
    isSubmitted: false,
    isSubmitting: false,
    totalAmount: 0,
    formParams: {},
    postURL: ""
  };

  static propTypes = {
    currency: PropTypes.string.isRequired,
  };

  async getPgList() {
    const { currency } = this.props;

    try {
      const { data } = await authenticatedInstance({
        url: `/api/Get_Fiat_PGs`,
        method: 'GET',
        data: {
          Currency: currency,
        },
      });

      if (data.data[0] && data.data[0].pG_Name.toLowerCase() !== 'checkbook') {
        this.setState({
          paymentGateway: { ...data.data[0] },
          isLoading: false,
        });
      }
    } catch (e) { }
  }

  componentDidMount() {
    this.getPgList();
  }

  componentDidUpdate(prevProps) {
    if (this.props.currency !== prevProps.currency) {
      this.getPgList();
    }
  }

  async submitDepositRequest(values) {
    try {
      const { triggerToast, t, currency } = this.props;
      const { amount, comment } = values;
      const { fee } = this.getFee(amount);

      const { data } = await authenticatedInstance({
        url: '/api/Add_Fiat_PG_Deposit_Request',
        method: 'POST',
        data: {
          amount: parseFloat(amount),
          fee: parseFloat(fee),
          comment,
          currency,
        },
      });

      this.setState({ isSubmitting: false });

      if (data.status === 'Success') {
        const { redirectURL, formParams, postURL } = data.data;
        // triggerToast(t(data.message), 'success');
        this.setState({
          isSubmitted: true,
        });

        if (
          redirectURL == undefined ||
          redirectURL === null ||
          redirectURL.trim() === ''
        ) {
          this.props.callRenewTokenFun();
          this.setState({formParams: formParams, postURL: postURL}, () => {
            this.logToConsole();
          })
        } else {
          this.props.callRenewTokenFun();
          setTimeout(() => window.location.replace(redirectURL), 3000);
        }
      } else {
        triggerToast(t(data.message), 'error');
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

  logToConsole = (event) => {
    this.inputElement.click();
}

  renderDepositForm() {
    const { isLoading, isSubmitted, isSubmitting, paymentGateway, formParams, postURL } = this.state;
    const { t, currency, decimalPrecision } = this.props;
    const formT = nestedTranslate(t, 'forms.fiatDepositPg');

    return (
      !isLoading && (
        <React.Fragment>
          {!isSubmitted ? (
            <>
              <Heading level={3}>{t('wallet.deposits.formTitle')}</Heading>
              <Formik
                initialValues={{
                  amount: '',
                  comment: '',
                  agree: false,
                }}
                validationSchema={Yup.object().shape({
                  amount: Yup.number()
                    .required()
                    .min(paymentGateway.minTxnAmount)
                    .max(paymentGateway.maxTxnAmount),
                  comment: Yup.string().max(250),
                  agree: Yup.bool().oneOf(
                    [true],
                    t('forms.fiatDepositPg.disclaimer.error'),
                  ),
                })}
                onSubmit={({ agree, ...values }) => {
                  this.setState({ isSubmitting: true });
                  this.submitDepositRequest(values);
                }}
              >
                {({ values: { amount } }) => {
                  const { fee, totalAmount } = this.getFee(amount);

                  return (
                    <Form>
                      <Tag.Group>
                        <Tag>
                          {`${formT('minDeposit.label')}: ${paymentGateway.minTxnAmount
                            } ${currency}`}
                        </Tag>
                        <Tag>
                          {`${formT('maxDeposit.label')}: ${paymentGateway.maxTxnAmount
                            } ${currency}`}
                        </Tag>
                        <Tag>
                          {`${formT('percentFee.label')}: ${paymentGateway.fee_In_Percent
                            }%`}
                        </Tag>
                        {paymentGateway.fixedFee > 0 && (
                          <Tag>
                            {`${formT('fixedFee.label')}: ${paymentGateway.fixedFee
                              } ${currency}`}
                          </Tag>
                        )}
                        <Tag>
                          {`${formT('minFee.label')}: ${paymentGateway.minFee
                            } ${currency}`}
                        </Tag>
                        <Tag>
                          {`${formT('maxFee.label')}: ${paymentGateway.maxFee
                            } ${currency}`}
                        </Tag>
                      </Tag.Group>
                      <FormField name="amount" label={formT('amount.label')}>
                        <NumberInput type="text" precision={decimalPrecision} />
                      </FormField>

                      {/* <FormField name="comment" label={formT('comment.label')}>
                      <TextField
                        type="text"
                        placeholder={formT('comment.label')}
                      />
                    </FormField> */}

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

                      <Heading level={5}>{formT('disclaimer.title')}</Heading>
                      <Paragraph fill={false} margin={{ vertical: 'small' }}>
                        {formT('disclaimer.text')}
                      </Paragraph>

                      <CheckBox
                        name="agree"
                        label={formT('disclaimer.label')}
                      />

                      <Button
                        type="submit"
                        color="primary"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                        margin={{ vertical: 'small' }}
                      >
                        {formT('submit')}
                      </Button>
                    </Form>
                  );
                }}
              </Formik>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Loading size="25" type="Oval" />
              <p>{formT('redirecting')}</p>
            </div>
          )}
          <React.Fragment>
            {!_.isEmpty(formParams) && (
            <form action={postURL} method="post" onSubmit={this.logToConsole} style={{display: "none"}}>
              <input type="hidden" name="trans_id" value={formParams.trans_id} />
              <input type="hidden" name="merchant_code" value={formParams.merchant_code} />
              <input type="hidden" name="order_id" value={formParams.order_id} />
              <input type="hidden" name="signature" value={formParams.signature} />
              <input type="submit" value="Submit" ref={input => this.inputElement = input} />
            </form>
            )}
          </React.Fragment>
        </React.Fragment>
      )
    );
  }

  render() {
    return <Box background="background-4">{this.renderDepositForm()}</Box>;
  }
}

export default withNamespaces()(
  connect(null, { triggerToast, callRenewTokenFun })(FiatDepositPg),
);
