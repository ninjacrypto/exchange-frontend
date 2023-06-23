import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { Form } from 'formik';
import { Link } from 'react-router-dom';

import { Button, Heading, Tag } from 'components/Wrapped';
import { nestedTranslate } from 'utils/strings';
import { BulmaInput, FormField, NumberInput, TextField } from 'components/Form';
import { formatCrypto } from 'utils/numbers';
import { Requires2FA } from 'containers/Requires2FA';

class InstaTradeForm extends React.Component {
  static propTypes = {
    tradingPair: PropTypes.object.isRequired,
    formProps: PropTypes.object.isRequired,
  };

  calculateTotal() {
    const {
      tradingPair: { commission, rate },
      formProps: {
        values: { baseAmount },
      },
    } = this.props;

    const subTotal = formatCrypto(baseAmount * rate);
    const subTotalFloat = parseFloat(subTotal);

    const fee = formatCrypto((commission / 100) * subTotalFloat);
    const total = formatCrypto(subTotalFloat - parseFloat(fee));

    return {
      subTotal,
      fee,
      total,
    };
  }

  getWalletValueText() {
    const {
      portfolios,
      tradingPair: { baseCurrency, quoteCurrency },
      t,
    } = this.props;
    const balances = {
      baseCurrency: _.get(portfolios, `${baseCurrency}.balance`, 0),
      quoteCurrency: _.get(portfolios, `${quoteCurrency}.balance`, 0),
    };

    const balanceText = {
      baseCurrency: `${t(
        'instaTrade.balance',
      )} (${baseCurrency}): ${formatCrypto(balances.baseCurrency, true)}`,
      quoteCurrency: `${t(
        'instaTrade.balance',
      )} (${quoteCurrency}): ${formatCrypto(balances.quoteCurrency, true)}`,
    };

    return balanceText;
  }

  renderSubmitButton() {
    const { isAuthenticated, isSubmitting, t: translate } = this.props;

    return isAuthenticated ? (
      <Button
        type="submit"
        color="primary"
        fill="horizontal"
        disabled={isSubmitting}
        loading={isSubmitting}
      >
        {translate('buttons.submit')}
      </Button>
    ) : (
      <Tag size="large" color="grey">
        <p>
          <Link to="/login">Log In</Link> or <Link to="/signup">Register</Link>
        </p>
      </Tag>
    );
  }

  renderForm() {
    const {
      tradingPair,
      t: translate,
      gAuthEnabled
    } = this.props;
    const t = nestedTranslate(translate, 'instaTrade');
    const { fee, total, subTotal } = this.calculateTotal();
    const { baseCurrency, quoteCurrency } = this.getWalletValueText();

    return (
      <Form>
        <Heading level={3}>
          {t('purchasing', { currency: tradingPair.quoteCurrency })}
        </Heading>
        <Tag.Group>
          <Tag>{`1 ${tradingPair.baseCurrency} = ${formatCrypto(
            tradingPair.rate,
            true,
          )} ${tradingPair.quoteCurrency}`}</Tag>
          <Tag>{`${t('min')}: ${formatCrypto(tradingPair.minLimit, true)} ${
            tradingPair.baseCurrency
          }`}</Tag>
          <Tag>{`${t('max')}: ${formatCrypto(tradingPair.maxLimit, true)} ${
            tradingPair.baseCurrency
          }`}</Tag>
          <Tag>{`${t('reserve')}: ${formatCrypto(tradingPair.reserve, true)} ${
            tradingPair.quoteCurrency
          }`}</Tag>
          <Tag>{`${t('fee')}: ${formatCrypto(
            tradingPair.commission,
            true,
          )}%`}</Tag>
        </Tag.Group>
        <Tag.Group>
          <Tag>{baseCurrency}</Tag>
          <Tag>{quoteCurrency}</Tag>
        </Tag.Group>

        <FormField name="baseAmount" label={t('amount')}>
          <NumberInput
            type="text"
            addonEnd={{
              content: `${_.get(tradingPair, 'baseCurrency', '')}`,
              // onClick: () => setFieldValue('amount', balance),
              background: 'primary',
            }}
            precision={8}
          />
        </FormField>

        {
          gAuthEnabled && (
        <FormField name="gauth" label={translate('forms.common.gAuth')}>
          <TextField
            type="text"
            placeholder={translate('forms.common.gAuth')}
          />
        </FormField>
          )
        }

        <BulmaInput
          horizontal={false}
          label={t('total')}
          value={`${subTotal} ${tradingPair.quoteCurrency}`}
        />

        <BulmaInput
          horizontal={false}
          label={t('fee')}
          value={`${fee} ${tradingPair.quoteCurrency}`}
        />

        <BulmaInput
          horizontal={false}
          label={t('receive')}
          value={`${total} ${tradingPair.quoteCurrency}`}
        />

        {/* Add later with conversion back and forth like CreateOrder fields */}
        {/* <BulmaInput
                    label="Amount"
                    name="quoteAmount"
                    addon={
                      <Button color="primary" tabIndex="-1" type="button">
                        {_.get(tradingPair, 'quoteCurrency', '')}
                      </Button>
                    }
                  /> */}
        {this.renderSubmitButton()}
      </Form>
    );
  }

  renderFormWrapper() {
    const { isAuthenticated, gAuthEnabled } = this.props;

    if (isAuthenticated && gAuthEnabled) {
      return <Requires2FA>{this.renderForm()}</Requires2FA>;
    }

    return this.renderForm();
  }

  render() {
    return this.renderFormWrapper();
  }
}

const mapStateToProps = ({
  exchangeSettings: { currencySettings },
  auth: { isAuthenticated, gAuthEnabled },
  portfolio: { portfolios },
}) => ({
  currencySettings,
  isAuthenticated,
  portfolios,
  gAuthEnabled,
});

export default withNamespaces()(connect(mapStateToProps)(InstaTradeForm));
