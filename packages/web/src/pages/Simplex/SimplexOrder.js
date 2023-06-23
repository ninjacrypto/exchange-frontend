import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as Yup from 'yup';
import _ from 'lodash';
import { Formik } from 'formik';
import { withNamespaces, Trans } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import qs from 'qs';

import { authenticatedInstance } from 'api';
import { redirectForm, formatFiat } from 'utils';
import { SimplexOrderForm } from 'pages/Simplex';
import { ConfirmModal } from 'containers/Modals';
import { nestedTranslate } from 'utils/strings';
import { triggerModalOpen } from 'redux/actions/ui';
import { ExternalLink } from 'components/Helpers';
import {
  Box,
  Accordion,
  AccordionPanel,
  Paragraph,
} from 'components/Wrapped';
import { InstaTradeHistoryTable } from 'containers/Tables';

class SimplexOrder extends Component {
  state = {
    modalOpen: false,
    fiatCurrency: 'USD',
    quoteId: '',
    fee: '',
  };

  componentDidMount() {
    const { t, triggerModalOpen } = this.props;
    const { search } = window.location;

    const params = qs.parse(search, { ignoreQueryPrefix: true });

    if (_.get(params, 'payment')) {
      triggerModalOpen(t('simplex:paymentSuccess'));
    }
  }

  setQuoteAndFee = (quoteId, fee) => {
    this.setState({
      quoteId,
      fee,
    });
  };

  setFiatCurrency = fiatCurrency => {
    this.setState({
      fiatCurrency,
    });
  };

  closeModal = () => {
    this.setState({
      modalOpen: false,
    });
  };

  confirmWithdrawal = (values, resetForm) => {
    this.simplexPaymentRequest({ ...values }, { cb: () => resetForm() });
    this.closeModal();
  };

  simplexPostForm = async data => {
    const {
      partner,
      payment_id,
      destination_wallet_address,
      payment_details_quote_id,
      Fiat_Total_Currency,
      Fiat_Total_Amount,
      Requested_Digital_Currency,
      Requested_Digital_Amount,
      Customer_Info: { uaid },
    } = data;

    const formData = {
      version: 1,
      partner,
      payment_id,
      payment_flow_type: 'wallet',
      return_url: `${window.location.origin}/credit-card?payment=successful`,
      quote_id: payment_details_quote_id,
      user_id: uaid,
      'destination_wallet[address]': destination_wallet_address,
      'destination_wallet[currency]': Requested_Digital_Currency,
      'fiat_total_amount[amount]': Fiat_Total_Amount,
      'fiat_total_amount[currency]': Fiat_Total_Currency,
      'digital_total_amount[amount]': Requested_Digital_Amount,
      'digital_total_amount[currency]': Requested_Digital_Currency,
    };

    redirectForm(formData);
  };

  simplexPaymentRequest = async (orderData, { cb }) => {
    const { quoteId } = this.state;
    const {
      profile: { customerID },
      authorization,
    } = this.props;
    const {
      crypto_currency,
      fiat_currency,
      requested_amount_crypto,
      requested_amount_fiat,
    } = orderData;

    let paymentData = {
      payment_details_quote_id: quoteId,
      Fiat_Total_Currency: fiat_currency,
      Fiat_Total_Amount: requested_amount_fiat,
      Requested_Digital_Currency: crypto_currency,
      Requested_Digital_Amount: requested_amount_crypto,
      Customer_Info: {
        location: '',
        uaid: customerID,
        accept_language: window.navigator.language,
        http_accept_language: window.navigator.language,
        user_agent: window.navigator.userAgent,
        cookie_session_id: authorization,
      },
    };

    try {
      const { data } = await authenticatedInstance({
        url: '/api/simplex_payment',
        method: 'POST',
        data: paymentData,
      });

      if (data.status === 'Success') {
        const { destination_wallet_address, partner, payment_id } = data.data;

        paymentData = {
          ...paymentData,
          destination_wallet_address,
          payment_id,
          partner,
        };
        this.simplexPostForm(paymentData);
      } else {
        // console.log(data.message);
      }
    } catch (e) {
      console.log(e);
    }
    if (cb) {
      cb();
    }
  };

  validationSchema = () => {
    const { fiatCurrency } = this.state;
    const { fiat } = this.props;

    let min = 50;
    let max = 20000;

    if (!_.isEmpty(fiat)) {
      min = fiatCurrency === 'USD' ? 50 : 50 * fiat[fiatCurrency];
      max = fiatCurrency === 'USD' ? 20000 : 20000 * fiat[fiatCurrency];
    }

    return Yup.object().shape({
      requested_amount_fiat: Yup.number()
        .min(min)
        .max(max)
        .required(),
      requested_amount_crypto: Yup.number()
        .min(1e-8)
        .required(),
      crypto_currency: Yup.string().required(),
      fiat_currency: Yup.string().required(),
    });
  };

  render() {
    const { fee } = this.state;

    const {
      t: translate,
      exchangeName,
      profile: { email },
    } = this.props;

    const t = nestedTranslate(translate, 'simplex:form');

    return (
      <Box pad="none" gap="small">
        <Formik
          validationSchema={this.validationSchema()}
          initialValues={{
            requested_amount_fiat: '',
            requested_amount_crypto: '1',
            crypto_currency: 'BTC',
            fiat_currency: 'USD',
          }}
          validateOnChange={true}
          onSubmit={values => {
            this.setState({
              modalOpen: true,
            });
          }}
        >
          {props => (
            <SimplexOrderForm
              formProps={props}
              setQuoteAndFee={this.setQuoteAndFee}
              setFiatCurrency={this.setFiatCurrency}
            >
              <ConfirmModal
                show={this.state.modalOpen}
                onClose={this.closeModal}
                confirm={() =>
                  this.confirmWithdrawal(
                    {
                      ...props.values,
                    },
                    props.resetForm,
                  )
                }
                title={t('confirmModal.title')}
              >
                <Box pad="none" gap="small">
                  <SimplexOrderHeadingValue
                    heading={t('confirmModal.amount')}
                    value={`${props.values.requested_amount_crypto} ${props.values.crypto_currency}`}
                  />
                  <SimplexOrderHeadingValue
                    heading={t('confirmModal.account')}
                    value={email}
                  />
                  <SimplexOrderHeadingValue
                    heading={t('confirmModal.fee')}
                    value={`${formatFiat(fee)} ${props.values.fiat_currency}`}
                  />
                  <SimplexOrderHeadingValue
                    heading={t('confirmModal.charge')}
                    value={`${props.values.requested_amount_fiat} ${props.values.fiat_currency}`}
                  />
                  <Paragraph>
                    <Trans
                      i18nKey="simplex:form.confirmModal.disclaimer"
                      values={{ exchangeName }}
                    >
                      {' '}
                      <ExternalLink href="https://www.simplex.com/terms-of-use/">
                        Terms of Use
                      </ExternalLink>
                    </Trans>
                  </Paragraph>
                </Box>
              </ConfirmModal>
            </SimplexOrderForm>
          )}
        </Formik>
        <Box pad="small" background="background-4">
          <Accordion>
            <AccordionPanel label={t('purchaseHistory')}>
              <InstaTradeHistoryTable type="simplex" />
            </AccordionPanel>
          </Accordion>
        </Box>
      </Box>
    );
  }
}

const SimplexOrderHeadingValue = ({ heading, value }) => (
  <p>
    {`${heading}: `}
    <strong>{value}</strong>
  </p>
);

const mapStateToProps = ({ user, auth, exchangeSettings, markets }) => ({
  profile: user.profile,
  authorization: auth.authorization,
  exchangeName: exchangeSettings.settings.exchangeName,
  fiat: markets.rateList.fiat,
});

export default withRouter(
  withNamespaces(['translation', 'simplex'])(
    connect(mapStateToProps, { triggerModalOpen })(SimplexOrder),
  ),
);
