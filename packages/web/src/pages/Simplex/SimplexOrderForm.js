import { authenticatedInstance } from 'api';
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { FormField, NumberInput } from 'components/Form';
import { SimplexCurrencySelect } from 'pages/Simplex';
import { Form } from 'formik';
import { triggerToast } from 'redux/actions/ui';

import { nestedTranslate } from 'utils';
import { withNamespaces } from 'react-i18next';

import { Box, Button, Heading, Image, Paragraph } from 'components/Wrapped';

class SimplexOrderForm extends Component {
  state = {
    crypto_currency: 'BTC',
    fiat_currency: 'USD',
  };

  componentDidMount() {
    this.initializeDefaultQuote();
  }

  initializeDefaultQuote() {
    const { crypto_currency, fiat_currency } = this.state;
    const {
      formProps: { setFieldValue },
    } = this.props;

    setFieldValue('crypto_currency', crypto_currency);
    setFieldValue('fiat_currency', fiat_currency);

    this.simplexGetQuoteRequest({
      amount: 1,
      fiat_currency,
      crypto_currency,
      requested_currency: crypto_currency,
    });
  }

  simplexGetQuoteRequest = _.debounce(async quoteData => {
    const {
      formProps: { setFieldValue, setFieldTouched },
      setQuoteAndFee,
    } = this.props;

    try {
      const { data } = await authenticatedInstance({
        url: '/api/simplex_get_quote',
        method: 'POST',
        data: quoteData,
      });

      if (data.status === 'Success') {
        const {
          data: { digital_money, fiat_money, quote_id },
        } = data;
        const fee = fiat_money.total_amount - fiat_money.base_amount;

        setFieldValue('requested_amount_crypto', digital_money.amount);
        setFieldValue('requested_amount_fiat', fiat_money.total_amount);
        setFieldTouched('requested_amount_fiat');

        setQuoteAndFee(quote_id, fee);
      } else {
        triggerToast(data.message);
      }
    } catch (e) {
      console.log(e);
    }
  }, 1000);

  onCurrencySelected = (currency, type) => {
    const {
      setFiatCurrency,
      formProps: {
        setFieldValue,
        values: { fiat_currency, crypto_currency },
      },
    } = this.props;

    if (type === 'fiat') {
      setFiatCurrency(currency);
      this.setState({ fiat_currency: currency });
      setFieldValue('fiat_currency', currency);
      this.simplexGetQuoteRequest({
        amount: 50,
        fiat_currency: currency,
        crypto_currency: crypto_currency,
        requested_currency: currency,
      });
    } else {
      this.setState({ crypto_currency: currency });
      setFieldValue('crypto_currency', currency);
      this.simplexGetQuoteRequest({
        amount: 1,
        fiat_currency: fiat_currency,
        crypto_currency: currency,
        requested_currency: currency,
      });
    }
  };

  handleChange = e => {
    const { handleChange, setFieldValue } = this.props.formProps;

    const {
      target: { name, value },
    } = e;

    const parsedValue = parseFloat(value);

    handleChange(e);
    setFieldValue(name, value);

    if (parsedValue) {
      const { values } = this.props.formProps;

      const {
        target: { name, value },
      } = e;

      const { crypto_currency, fiat_currency } = values;

      let requestedCurrency;

      if (name.includes('fiat')) {
        requestedCurrency = fiat_currency;
      } else {
        requestedCurrency = crypto_currency;
      }

      const data = {
        amount: value,
        fiat_currency,
        crypto_currency,
        requested_currency: requestedCurrency,
      };

      this.simplexGetQuoteRequest(data);
    }
  };

  renderCoinOptions() {
    return [
      { value: 'BTC', label: 'BTC' },
      { value: 'BCH', label: 'BCH' },
      { value: 'LTC', label: 'LTC ' },
      { value: 'XRP', label: 'XRP ' },
      { value: 'ETH', label: 'ETH ' },
    ];
  }

  renderFiatOptions() {
    return [
      { value: 'USD', label: 'USD' },
      { value: 'EUR', label: 'EUR ' },
    ];
  }

  render() {
    const { children } = this.props;

    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'simplex:form');

    return (
      <Fragment>
        <Form>
          <Box fill={true} pad="none" gap="small">
            <Box pad="small" background="background-4" gap="small">
              <FormField
                name="requested_amount_crypto"
                label={t('amount.placeholder')}
              >
                <NumberInput
                  name="requested_amount_crypto"
                  inputOnChange={this.handleChange}
                  precision={8}
                  addonEnd={{
                    content: (
                      <SimplexCurrencySelect
                        options={this.renderCoinOptions()}
                        onCurrencySelected={this.onCurrencySelected}
                        type="crypto"
                        name="crypto_currency"
                        value={{ value: 'BTC', label: 'BTC' }}
                      />
                    ),
                    pad: 'none',
                    width: 'small',
                  }}
                />
              </FormField>

              <FormField
                name="requested_amount_fiat"
                label={t('charge.placeholder')}
              >
                <NumberInput
                  name="requested_amount_crypto"
                  inputOnChange={this.handleChange}
                  precision={2}
                  addonEnd={{
                    content: (
                      <SimplexCurrencySelect
                        options={this.renderFiatOptions()}
                        onCurrencySelected={this.onCurrencySelected}
                        type="fiat"
                        name="fiat_currency"
                        value={{ value: 'USD', label: 'USD' }}
                      />
                    ),
                    pad: 'none',
                    width: 'small',
                  }}
                />
              </FormField>

              <Button
                fill="horizontal"
                color="primary"
                type="submit"
                className="m-t-sm"
              >
                {t('button')}
              </Button>
            </Box>

            <Box pad="small" gap="small" background="background-4">
              <Heading>{t('simplexFaq.why')}</Heading>
              <Paragraph>{t('simplexFaq.fast')}</Paragraph>
              <Paragraph>{t('simplexFaq.low')}</Paragraph>
              <Paragraph>{t('simplexFaq.convenient')}</Paragraph>
              <Box
                pad="none"
                round={false}
                direction="row"
                height="50px"
                width="150px"
              >
                <Box pad="none" round={false}>
                  <Image
                    src="/assets/img/credit-card-logos.png"
                    fit="contain"
                    alt="Visa and Mastercard Logos"
                  />
                </Box>
              </Box>
            </Box>
          </Box>
          {children}
        </Form>
      </Fragment>
    );
  }
}

export default withNamespaces()(connect(null, null)(SimplexOrderForm));
