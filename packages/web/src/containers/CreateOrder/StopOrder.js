import React, { Component, useEffect, useState } from 'react';
import _ from 'lodash';
import { Columns } from 'react-bulma-components';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import styles from './CreateOrder.module.scss';
import {
  CreateOrderBalance,
  CreateOrderField,
  CreatePercentSelectors,
  CreateOrderSubmit,
} from 'containers/CreateOrder';
import { connect } from 'react-redux';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { PropTypes } from 'prop-types';
import { SelectField, Form } from 'components/Form';
import { Select, Box, Text, Heading, Button, Modal } from 'components/Wrapped';
import { getSingleTradingPairSettings } from 'redux/selectors/settings';
import { StatusInfo } from 'grommet-icons';

const STOPLIMIT = 'STOPLIMIT';
const STOPMARKET = 'STOPMARKET';
const TRAILINGSTOPMARKET = 'TRAILINGSTOPMARKET';

class StopOrderFormContainer extends Component {
  stopOrderFormValidationSchema = () => {
    const {
      orderType,
      tradingPairSettings: { minTickSize, minTradeAmount, minOrderValue },
    } = this.props;

    switch (orderType) {
      case STOPLIMIT:
        return Yup.object().shape({
          rate: Yup.number()
            .required()
            .min(minTickSize),
          stop: Yup.number()
            .required()
            .min(minTickSize),
          volume: Yup.number()
            .required()
            .min(minTradeAmount),
          total: Yup.number().min(minOrderValue),
        });
      case STOPMARKET:
        return Yup.object().shape({
          stop: Yup.number()
            .required()
            .min(minTickSize),
          volume: Yup.number()
            .required()
            .min(minTradeAmount),
        });
      case TRAILINGSTOPMARKET:
        return Yup.object().shape({
          trail: Yup.number()
            .required()
            .min(minTickSize),
          volume: Yup.number()
            .required()
            .min(minTradeAmount),
        });
      default:
        break;
    }
  };

  trailingStopOptions() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'forms.stopOrder');

    return [
      { value: false, label: t('absolute') },
      { value: true, label: t('percentage') },
    ];
  }

  render() {
    const {
      side,
      tradingPair,
      placeOrder,
      t: translate,
      orderType,
      tradingPairSettings: {
        tickDecimals,
        tradeAmountDecimals,
        orderValueDecimals,
      },
    } = this.props;
    const additionalValues = {
      market: tradingPair.quoteCurrency,
      trade: tradingPair.baseCurrency,
      type: orderType,
    };
    const t = nestedTranslate(translate, 'forms.stopOrder');

    const isStopLimit = orderType === STOPLIMIT;
    const isTrailingStop = orderType === TRAILINGSTOPMARKET;

    // if (isTrailingStop && side === 'BUY') {
    //   return (
    //     <Paragraph color="status-warning">{t('invalidOrderSide')}</Paragraph>
    //   );
    // }

    return (
      <Formik
        initialValues={{
          side,
          volume: '',
          rate: '',
          stop: '',
          trail: '',
          total: '',
          isTrailInPercentage: false,
        }}
        validationSchema={this.stopOrderFormValidationSchema}
        onSubmit={(values, actions) => {
          const formValues = _.clone(values);
          if (additionalValues.type === STOPMARKET) {
            _.unset(formValues, 'rate');
            _.unset(formValues, 'trail');
            _.unset(formValues, 'isTrailInPercentage');
          } else if (additionalValues.type === TRAILINGSTOPMARKET) {
            _.unset(formValues, 'rate');
            _.unset(formValues, 'stop');
          } else {
            _.unset(formValues, 'trail');
            _.unset(formValues, 'isTrailInPercentage');
          }

          placeOrder({ ...formValues, ...additionalValues });
        }}
      >
        {props => (
          <Form gap="small">
            <CreateOrderBalance tradingPair={tradingPair} side={side} />

            {!isTrailingStop && (
              <CreateOrderField
                type="text"
                name="stop"
                label={t('stopPrice')}
                currency={tradingPair.quoteCurrency}
                formProps={props}
                side={side}
                precision={tickDecimals}
              />
            )}

            {isStopLimit && (
              <CreateOrderField
                type="text"
                name="rate"
                label={t('rate')}
                currency={tradingPair.quoteCurrency}
                formProps={props}
                side={side}
                precision={tickDecimals}
              />
            )}

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

            {/* {(isStopLimit || isTrailingStop) && (
              <div className={cx('is-divider', styles.divider)} />
            )} */}

            {/* <CreateOrderFee
              side={side}
              tradingPair={tradingPair}
              total={props.values.rate * props.values.volume}
            /> */}

            <CreateOrderField
              type="number"
              name="total"
              label={t('total')}
              currency={tradingPair.quoteCurrency}
              formProps={props}
              side={side}
              precision={orderValueDecimals}
              showErrors={true}
            />

            {isTrailingStop && (
              <Field
                name="isTrailInPercentage"
                component={SelectField}
                options={this.trailingStopOptions()}
                margin="none"
              />
            )}

            {isTrailingStop && (
              <CreateOrderField
                type="number"
                name="trail"
                label={t('trail')}
                currency={
                  props.values.isTrailInPercentage
                    ? '%'
                    : tradingPair.quoteCurrency
                }
                formProps={props}
                side={side}
                precision={tickDecimals}
              />
            )}

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

const StopOrderForm = withNamespaces()(
  connect(mapStateToProps)(StopOrderFormContainer),
);

export const TradingRules = withNamespaces()(({ t: translate }) => {
  return (
    <React.Fragment>
      <Box pad="small">
        <Box pad="none" margin={{bottom: 'small'}}>
        <Text size="small" margin={{bottom: 'xsmall'}}>{`${translate('exchange.BUY')} ${translate('forms.stopOrder.stopLimit')} & ${translate('forms.stopOrder.stopMarket')}`}</Text>
        <Text size="xsmall">{`- ${translate('tables.tradeHistory.stopprice')} > ${translate('forms.marketOrder.marketPrice')}`}</Text>
        <Text size="xsmall">{`- ${translate('tables.tradeHistory.stopprice')} < ${translate('forms.stopOrder.rate')} ${translate('forms.limitOrder.rate')}`}</Text>
        </Box>
        <Box pad="none" margin={{bottom: 'small'}}>
        <Text size="small" margin={{bottom: 'xsmall'}}>{`${translate('exchange.SELL')} ${translate('forms.stopOrder.stopLimit')} & ${translate('forms.stopOrder.stopMarket')}`}</Text>
        <Text size="xsmall">{`- ${translate('tables.tradeHistory.stopprice')} < ${translate('forms.marketOrder.marketPrice')}`}</Text>
        <Text size="xsmall">{`- ${translate('tables.tradeHistory.stopprice')} > ${translate('forms.stopOrder.rate')} ${translate('forms.limitOrder.rate')}`}</Text>
        </Box>
      </Box>
    </React.Fragment>
  );
});

export const TradingRulesButton = withNamespaces()(({ t: translate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => setIsOpen(!isOpen);

  return (
    <React.Fragment>
      <Button
        color="primary"
        primary={false}
        fill="horizontal"
        onClick={() => toggleModal()}
      >
        <Box pad="xxsmall" fill="horizontal" direction="row" justify="center">
          <StatusInfo size="16px" />
        </Box>
      </Button>
      <Modal
        show={isOpen}
        toggleModal={toggleModal}
        pad="small"
        width="medium"
      >
        <TradingRules handleSuccess={toggleModal} />
      </Modal>
    </React.Fragment>
  );
});

class StopOrder extends React.Component {
  state = {
    orderType: {
      value: 'STOPLIMIT',
      placeholder: '',
    },
  };

  static propTypes = {
    tradingPair: PropTypes.object.isRequired,
    placeOrder: PropTypes.func.isRequired,
  };

  handleChange = orderType => {
    this.setState({ orderType });
  };

  renderOptions() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'forms.stopOrder');

    return [
      { value: STOPLIMIT, label: t('stopLimit') },
      { value: STOPMARKET, label: t('stopMarket') },
      { value: TRAILINGSTOPMARKET, label: t('trailingStop') },
    ];
  }

  componentDidMount() {
    this.setState({ orderType: this.renderOptions()[0] });
  }

  render() {
    const { placeOrder, tradingPair } = this.props;

    return (
      <Box margin={{ top: 'small' }} pad="none">
        <Box flex={false} pad="none">
          <Box pad="none" direction="row" align="center">
            <Box pad={{ horizontal: 'small' }} fill="horizontal">
              <Select
                options={this.renderOptions()}
                onChange={this.handleChange}
                defaultValue={this.state.orderType}
                valueKey="value"
                labelKey="label"
                valueSize="xsmall"
                background="background-3"
                margin="none"
              />
            </Box>
            <Box pad={{ horizontal: 'small' }}>
              <TradingRulesButton />
            </Box>
          </Box>
        </Box>
        <Columns marginless={true} className={styles.columnsWrap}>
          <Columns.Column>
            <StopOrderForm
              tradingPair={tradingPair}
              orderType={this.state.orderType.value}
              side="BUY"
              placeOrder={placeOrder}
            />
          </Columns.Column>
          <div className="is-divider-vertical" />
          <Columns.Column>
            <StopOrderForm
              tradingPair={tradingPair}
              orderType={this.state.orderType.value}
              side="SELL"
              placeOrder={placeOrder}
            />
          </Columns.Column>
        </Columns>
      </Box>
    );
  }
}

export default withNamespaces()(StopOrder);
