import React, { Component } from 'react';
import { Columns } from 'react-bulma-components';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import styles from './CreateOrder.module.scss';
import cx from 'classnames';
import { CreateOrderBalance, CreateOrderField, CreatePercentSelectors, CreateOrderSubmit } from 'containers/CreateOrder';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';

class StopLimitOrderFormContainer extends Component {
  stopLimitOrderFormValidationSchema = () => {
    return Yup.object().shape({
      rate: Yup.number().min(1e-8),
      stop: Yup.number().min(1e-8),
      volume: Yup.number().min(1e-8),
    });
  };

  render() {
    const { side, tradingPair, placeOrder, t: translate } = this.props;
    const additionalValues = {
      market: tradingPair.quoteCurrency,
      trade: tradingPair.baseCurrency,
    };
    const t = nestedTranslate(translate, 'forms.stopLimitOrder');

    return (
      <Formik
        initialValues={{
          side,
          volume: 0,
          rate: 0,
          stop: 0,
          type: 'STOPLIMIT',
        }}
        validationSchema={this.stopLimitOrderFormValidationSchema}
        onSubmit={(values, actions) => {
          placeOrder({ ...values, ...additionalValues });
        }}
      >
        {props => (
          <Form className={styles.formWrap}>
            <CreateOrderBalance tradingPair={tradingPair} side={side} />

            <CreateOrderField
              type="text"
              name="stop"
              label={t('stopPrice')}
              currency={tradingPair.quoteCurrency}
              setFieldValue={props.setFieldValue}
              handleBlur={props.handleBlur}
              side={side}
            />

            <CreateOrderField
              type="text"
              name="rate"
              label={t('rate')}
              currency={tradingPair.quoteCurrency}
              setFieldValue={props.setFieldValue}
              handleBlur={props.handleBlur}
              side={side}
            />

            <CreateOrderField
              type="text"
              name="volume"
              label={t('volume')}
              currency={tradingPair.baseCurrency}
              setFieldValue={props.setFieldValue}
              handleBlur={props.handleBlur}
              side={side}
            />

            <CreatePercentSelectors side={side} />

            <div className={cx('is-divider', styles.divider)} />

            {/* <CreateOrderFee
              side={side}
              tradingPair={tradingPair}
              total={props.values.rate * props.values.volume}
            /> */}

            <CreateOrderField
              type="number"
              name="total"
              label={t('total')}
              value={props.values.rate * props.values.volume}
              currency={tradingPair.quoteCurrency}
            />

            <CreateOrderSubmit side={side} tradingPair={tradingPair} />
          </Form>
        )}
      </Formik>
    );
  }
}

const StopLimitOrderForm = withNamespaces()(StopLimitOrderFormContainer);

const StopLimitOrder = ({ tradingPair, placeOrder }) => {
  return (
    <Columns marginless={true} className={styles.columnsWrap}>
      <Columns.Column>
        <StopLimitOrderForm
          tradingPair={tradingPair}
          side="BUY"
          placeOrder={placeOrder}
        />
      </Columns.Column>
      <div className="is-divider-vertical" />
      <Columns.Column>
        <StopLimitOrderForm
          tradingPair={tradingPair}
          side="SELL"
          placeOrder={placeOrder}
        />
      </Columns.Column>
    </Columns>
  );
};

export default StopLimitOrder;
