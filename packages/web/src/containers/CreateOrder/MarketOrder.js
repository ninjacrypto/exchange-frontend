import React, { Component, useState } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Columns } from 'react-bulma-components';
import { Formik } from 'formik';
import * as Yup from 'yup';
import styles from './CreateOrder.module.scss';

import {
  CreateOrderBalance,
  CreatePercentSelectors,
  CreateOrderField,
  CreateOrderSubmit,
} from 'containers/CreateOrder';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { getSingleTradingPairSettings } from 'redux/selectors/settings';
import { Form } from 'components/Form';
import { Text, Box } from 'components/Wrapped';
import { CaretDownFill } from 'grommet-icons';

export const MarketDrop = withNamespaces()(({ t: translate, getKey }) => {
  const t = nestedTranslate(translate, 'forms.marketOrder');
  const [IsShown, setIsShown] = useState(false);
  const [dropLabel, setDropLabel] = useState('volume');
  const [dropList, setDropList] = useState(['volume', 'total']);

  const getListKey = key => {
    setDropLabel(key);
    setIsShown(false);
    getKey(key);
  };

  return (
    <React.Fragment>
      <Box pad="none">
        <Box
          pad="none"
          onMouseEnter={() => {
            setIsShown(true);
          }}
          onMouseLeave={() => {
            setIsShown(false);
          }}
          className={styles.hoverDropBtn}
        >
          <Box
            pad="xxsmall"
            direction="row"
            align="center"
            className={styles.btnlink}
          >
            <Box pad="none">
              {_.isEqual(dropLabel, 'total') ? (
                <Text size="xsmall" textAlign="start">
                  {translate(`forms.stopOrder.${dropLabel}`)}
                </Text>
              ) : (
                <Text size="xsmall" textAlign="start">
                  {t(dropLabel)}
                </Text>
              )}
            </Box>
            <CaretDownFill size="12px" />
          </Box>
          {_.isEqual(IsShown, true) && (
            <Box pad="none" className={styles.hoverDrop}>
              <ul className={styles.hoverDropList}>
                {dropList.map((item, index) => (
                  <li
                    key={index}
                    className={
                      '' + (_.isEqual(dropLabel, item) ? styles.active : '')
                    }
                    onClick={() => getListKey(item)}
                  >
                    {_.isEqual(item, 'total') ? (
                      <Text size="xsmall">
                        {translate(`forms.stopOrder.${item}`)}
                      </Text>
                    ) : (
                      <Text size="xsmall">{t(item)}</Text>
                    )}
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </Box>
      </Box>
    </React.Fragment>
  );
});

class MarketOrderFormContainer extends Component {
  state = {
    IsShown: false,
    currentMode: 'volume',
  };

  marketOrderValidationSchema = () => {
    const {
      tradingPairSettings: { minTradeAmount },
    } = this.props;

    return Yup.object().shape({
      volume: Yup.number()
        .required()
        .min(minTradeAmount),
    });
  };

  getKey = key => {
    this.setState({ currentMode: key });
  };

  render() {
    const {
      side,
      tradingPair,
      placeOrder,
      placeOrderPriced,
      t: translate,
      tradingPairSettings: { tradeAmountDecimals, orderValueDecimals },
    } = this.props;
    const additionalValues = {
      market: tradingPair.quoteCurrency,
      trade: tradingPair.baseCurrency,
    };
    const t = nestedTranslate(translate, 'forms.marketOrder');

    return (
      <Formik
        initialValues={{
          side,
          volume: '',
          type: 'MARKET',
        }}
        validationSchema={this.marketOrderValidationSchema}
        validateOnChange={true}
        onSubmit={(values, actions) => {
          if (_.isEqual(this.state.currentMode, 'total')) {
            placeOrderPriced({ ...values, ...additionalValues });
          } else {
            placeOrder({ ...values, ...additionalValues });
          }
        }}
      >
        {props => (
          <Form gap="small">
            <CreateOrderBalance tradingPair={tradingPair} side={side} />

            <CreateOrderField
              type="text"
              name="price"
              label={t('rate')}
              value={t('marketPrice')}
              currency={tradingPair.quoteCurrency}
              side={side}
            />

            <CreateOrderField
              type="text"
              name="volume"
              label={t('volume')}
              currency={
                _.isEqual(this.state.currentMode, 'volume')
                  ? tradingPair.baseCurrency
                  : tradingPair.quoteCurrency
              }
              formProps={props}
              side={side}
              precision={
                _.isEqual(this.state.currentMode, 'volume')
                  ? tradeAmountDecimals
                  : orderValueDecimals
              }
              formType="MARKET"
              addonStartDrop={<MarketDrop getKey={this.getKey} />}
              marketCurrentMode={this.state.currentMode}
              tradingPair={tradingPair}
            />

            <CreatePercentSelectors
              marketOrder={true}
              side={side}
              total={props.values.total}
              amount={props.values.volume}
            />

            {/* <div className={cx('is-divider', styles.divider)} /> */}

            {/* <CreateOrderFee
              side={side}
              tradingPair={tradingPair}
              total={lastPrice * props.values.volume}
            /> */}
            <CreateOrderSubmit side={side} tradingPair={tradingPair} />
          </Form>
        )}
      </Formik>
    );
  }
}

const mapStateToProps = (state, props) => ({
  lastPrice: state.exchange.tradingPairStats.lastPrice,
  tradingPairSettings: getSingleTradingPairSettings(state, props),
});

const MarketOrderForm = withNamespaces()(
  connect(mapStateToProps)(MarketOrderFormContainer),
);

const MarketOrder = ({ tradingPair, placeOrder, placeOrderPriced }) => {
  return (
    <Columns marginless={true} className={styles.columnsWrap}>
      <Columns.Column>
        <MarketOrderForm
          tradingPair={tradingPair}
          side="BUY"
          placeOrder={placeOrder}
          placeOrderPriced={placeOrderPriced}
        />
      </Columns.Column>
      <div className="is-divider-vertical" />
      <Columns.Column>
        <MarketOrderForm
          tradingPair={tradingPair}
          side="SELL"
          placeOrder={placeOrder}
          placeOrderPriced={placeOrderPriced}
        />
      </Columns.Column>
    </Columns>
  );
};

export default MarketOrder;
