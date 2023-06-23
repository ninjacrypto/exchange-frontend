import React, { Component, Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { ControlledTabs } from 'components/Tabs';
import { Loading } from 'components/Loading';

import { placeOrder, placeOrderPriced } from 'redux/actions/orders';
import { LimitOrder, MarketOrder, StopOrder } from 'containers/CreateOrder';
import { withNamespaces } from 'react-i18next';
import { Select, Box, Text, Heading, Button, Modal } from 'components/Wrapped';
import { Columns } from 'react-bulma-components';
import { formatNumberToPlaces } from 'utils/numbers';
import { nestedTranslate } from 'utils';
import styles from './CreateOrder.module.scss';

export const TradingRules = withNamespaces()(
  ({
    t: translate,
    tradingPair: { baseCurrency, quoteCurrency },
    tradingPairSettings: { minTradeAmount, minTickSize, minOrderValue },
  }) => {
    const t = nestedTranslate(translate, 'tables.tradingRules');
    return (
      <React.Fragment>
        <Box pad="small">
          <Box pad="none" margin={{ bottom: 'small' }}>
            <Columns>
              <Columns.Column size={6}>
                <Text size="xsmall">{t('minTickSize')}</Text>
              </Columns.Column>
              <Columns.Column size={6}>
                <Box pad="none" align="end">
                  <Text size="xsmall">{`${formatNumberToPlaces(
                    minTickSize,
                  )} ${quoteCurrency}`}</Text>
                </Box>
              </Columns.Column>
            </Columns>
          </Box>
          <Box pad="none" margin={{ bottom: 'small' }}>
            <Columns>
              <Columns.Column size={6}>
                <Text size="xsmall">{t('minTradeAmount')}</Text>
              </Columns.Column>
              <Columns.Column size={6}>
                <Box pad="none" align="end">
                  <Text size="xsmall">{`${formatNumberToPlaces(
                    minTradeAmount,
                  )} ${baseCurrency}`}</Text>
                </Box>
              </Columns.Column>
            </Columns>
          </Box>
          <Box pad="none">
            <Columns>
              <Columns.Column size={6}>
                <Text size="xsmall">{t('minOrderValue')}</Text>
              </Columns.Column>
              <Columns.Column size={6}>
                <Box pad="none" align="end">
                  <Text size="xsmall">{`${formatNumberToPlaces(
                    minOrderValue,
                  )} ${quoteCurrency}`}</Text>
                </Box>
              </Columns.Column>
            </Columns>
          </Box>
        </Box>
      </React.Fragment>
    );
  },
);

export const TradingRulesButton = withNamespaces()(
  ({ t: translate, tradingPair, tradingPairSettings, label }) => {
    const t = nestedTranslate(translate, 'tables.tradingRules');
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => setIsOpen(!isOpen);

    return (
      <React.Fragment>
        <Text
          className={styles.pointer}
          size="xsmall"
          onClick={() => toggleModal()}
        >
          {t('title')}
        </Text>
        <Modal
          show={isOpen}
          toggleModal={toggleModal}
          pad="small"
          width="medium"
          heading={t('title')}
        >
          <TradingRules
            handleSuccess={toggleModal}
            tradingPair={tradingPair}
            tradingPairSettings={tradingPairSettings}
          />
        </Modal>
      </React.Fragment>
    );
  },
);

class CreateOrder extends Component {
  render() {
    const { tradingPair, tradingPairSettings, t, extraProps } = this.props;

    return (
      <Fragment>
        {tradingPair.baseCurrency ? (
          <React.Fragment>
            <ControlledTabs
              containerProps={{
                className:
                  'is-flex flex-column react-virtualized-container-fix',
              }}
              tabContentProps={{ className: 'react-virtualized-container-fix' }}
              tabProps={{
                marginless: true,
                fullwidth: true,
                className: 'top-border-radius',
              }}
              otherTabs={
                <TradingRulesButton
                  tradingPair={tradingPair}
                  tradingPairSettings={tradingPairSettings}
                />
              }
              {...extraProps}
            >
              <LimitOrder
                title={t('exchange.limitOrder')}
                tradingPair={tradingPair}
                placeOrder={this.props.placeOrder}
              />
              <MarketOrder
                title={t('exchange.marketOrder')}
                tradingPair={tradingPair}
                placeOrder={this.props.placeOrder}
                placeOrderPriced={this.props.placeOrderPriced}
              />
              <StopOrder
                title={t('exchange.stopOrder')}
                tradingPair={tradingPair}
                placeOrder={this.props.placeOrder}
              />
            </ControlledTabs>
          </React.Fragment>
        ) : (
          <Loading />
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = ({ exchange }) => ({
  tradingPair: exchange.tradingPair,
  tradingPairSettings: exchange.tradingPairSettings
});

const mapDispatchToProps = {
  placeOrder,
  placeOrderPriced,
};

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(CreateOrder),
);
