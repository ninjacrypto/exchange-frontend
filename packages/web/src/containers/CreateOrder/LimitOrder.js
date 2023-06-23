import React, { Component } from 'react';
import { Columns } from 'react-bulma-components';
import { FormField, Select, Form } from 'components/Form';
import { Formik } from 'formik';
import * as Yup from 'yup';
import styles from './CreateOrder.module.scss';
import {
  CreateOrderBalance,
  CreateOrderField,
  CreatePercentSelectors,
  CreateOrderSubmit,
} from 'containers/CreateOrder';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { connect } from 'react-redux';
import { getSingleTradingPairSettings } from 'redux/selectors/settings';

class LimitOrderFormContainer extends Component {
  renderOptions() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'forms.limitOrder');

    return [
      { value: 'GTC', label: t('goodTillCancelled') },
      { value: 'IOC', label: t('immediateOrCancel') },
      { value: 'FOK', label: t('fillOrKill') },
      { value: 'DO', label: t('dayOnly') },
    ];
  }

  limitOrderValidationSchema = () => {
    const {
      tradingPairSettings: { minTickSize, minTradeAmount, minOrderValue },
    } = this.props;

    return Yup.object().shape({
      rate: Yup.number()
        .required()
        .min(minTickSize),
      volume: Yup.number()
        .required()
        .min(minTradeAmount),
      total: Yup.number().min(minOrderValue)
    });
  };

  render() {
    const {
      side,
      tradingPair,
      placeOrder,
      t: translate,
      tradingPairSettings: {
        tickDecimals,
        tradeAmountDecimals,
        orderValueDecimals,
      },
    } = this.props;
    const t = nestedTranslate(translate, 'forms.limitOrder');

    const additionalValues = {
      market: tradingPair.quoteCurrency,
      trade: tradingPair.baseCurrency,
    };

    return (
      <Formik
        initialValues={{
          side,
          volume: '',
          rate: '',
          total: '',
          type: 'LIMIT',
          timeInForce: 'GTC',
        }}
        validateOnChange={true}
        validationSchema={this.limitOrderValidationSchema}
        onSubmit={(values, actions) => {
          placeOrder({ ...values, ...additionalValues });
        }}
      >
        {props => (
          <Form gap="small" autoComplete="off">
            <CreateOrderBalance tradingPair={tradingPair} side={side} />

            <CreateOrderField
              type="text"
              name="rate"
              label={t('rate')}
              currency={tradingPair.quoteCurrency}
              formProps={props}
              side={side}
              precision={tickDecimals}
            />

            <CreateOrderField
              type="text"
              name="volume"
              label={t('volume')}
              currency={tradingPair.baseCurrency}
              formProps={props}
              side={side}
              precision={tradeAmountDecimals}
            />

            <CreatePercentSelectors
              side={side}
              total={props.values.total}
              amount={props.values.volume}
            />

            <CreateOrderField
              type="text"
              name="total"
              label={t('total')}
              currency={tradingPair.quoteCurrency}
              formProps={props}
              side={side}
              precision={orderValueDecimals}
              showErrors={true}
            />

            {/* <Field
              name="timeInForce"
              component={SelectField}
              options={this.renderOptions()}
              className={styles.selectField}
            /> */}

            <FormField name="timeInForce">
              <Select
                name="timeInForce"
                background="background-3"
                options={this.renderOptions()}
                valueKey="value"
                labelKey="label"
                valueSize="xsmall"
              />
            </FormField>

            {/* <CreateOrderFee
              side={side}
              tradingPair={tradingPair}
              total={props.values.rate * props.values.volume}
            /> */}
            <CreateOrderSubmit side={side} tradingPair={tradingPair} />
          </Form>
        )}
      </Formik>
    );
  }
}

const mapStateToProps = (state, props) => ({
  tradingPairSettings: getSingleTradingPairSettings(state, props),
});

const LimitOrderForm = withNamespaces()(
  connect(mapStateToProps)(LimitOrderFormContainer),
);

const LimitOrder = ({ tradingPair, placeOrder }) => {
  return (
    <Columns marginless={true} className={styles.columnsWrap}>
      <Columns.Column className={styles.column}>
        <LimitOrderForm
          tradingPair={tradingPair}
          side="BUY"
          placeOrder={placeOrder}
        />
      </Columns.Column>
      <div className="is-divider-vertical" />
      <Columns.Column className={styles.column}>
        <LimitOrderForm
          tradingPair={tradingPair}
          side="SELL"
          placeOrder={placeOrder}
        />
      </Columns.Column>
    </Columns>
  );
};

export default LimitOrder;
