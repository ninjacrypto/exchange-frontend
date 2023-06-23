import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { moment } from 'i18n';
import _ from 'lodash';
import { withNamespaces } from 'react-i18next';

import { formatNumberToPlaces } from 'utils';
import {
  Box,
  Paragraph,
  Text,
  Heading,
} from 'components/Wrapped';
import { nestedTranslate } from 'utils/strings';
import { PaginationTableWrapper, UserTradeHistoryTable, TradingPairFilter } from 'containers/Tables';
import { Tooltip } from 'components/Tooltip';

import styles from './Table.module.scss';

const UserOrderHistoryTable = ({
  t: translate,
  tradingPair: initialTradingPair,
  isAuthenticated,
  extraProps,
}) => {
  const [tradingPair, setTradingPair] = useState(initialTradingPair || 'ALL');
  const t = nestedTranslate(translate, 'tables.tradeHistory');

  useEffect(() => {
    if (initialTradingPair) {
      setTradingPair(initialTradingPair)
    }
  }, [initialTradingPair])

  const formatUserOrderHistory = tradeHistory => {
    const formattedTradeHistory = tradeHistory.map(
      ({ date, currencyPair, ...rest }) => {
        const [trade, market] = currencyPair.split('-');

        return {
          market,
          trade,
          date: moment
            .utc(date)
            .local()
            .valueOf(),
          ...rest,
        };
      },
    );

    return _.orderBy(formattedTradeHistory, 'date', 'desc');
  };

  return (
    <PaginationTableWrapper
      filters={
        <TradingPairFilter
          setTradingPair={setTradingPair}
          defaultValue={tradingPair}
        />
      }
      shouldFetchData={
        isAuthenticated && tradingPair && !_.isEmpty(tradingPair)
      }
      apiUrl="/api/OrderHistory"
      apiData={{
        side: 'ALL',
        pair:
          tradingPair === 'ALL' || tradingPair.baseCurrency === 'ALL'
            ? 'ALL'
            : `${tradingPair.baseCurrency}-${tradingPair.quoteCurrency}`,
      }}
      dataTransformer={formatUserOrderHistory}
      exportable={[
        'date',
        'tradingPair',
        'side',
        'tradeType',
        'tradePrice',
        'filledAmount',
        'value',
        'txnFee',
      ]}
      fileName="order-history"
      columns={[
        {
          Header: t('date'),
          id: 'date',
          accessor: ({ date }) => moment(date).format('YYYY-MM-DD HH:mm:ss Z'),
          minWidth: 135,
        },
        {
          Header: t('pair'),
          id: 'tradingPair',
          accessor: ({ market, trade }) => `${trade}/${market}`,
        },
        {
          Header: t('side'),
          id: 'side',
          accessor: ({ side }) => t('orderSide', { side: side.toUpperCase() }),
          maxWidth: 75,
          Cell: ({ value, original: { side } }) => {
            const color =
              side.toUpperCase() === 'BUY' ? styles.bid : styles.ask;
            return <span className={color}>{value}</span>;
          },
        },
        {
          Header: t('type'),
          id: 'tradeType',
          accessor: ({ tradeType }) =>
            translate(`generics.orderTypes.${tradeType}`),
          maxWidth: 75,
        },
        {
          Header: t('price'),
          id: 'tradePrice',
          accessor: ({ tradePrice, market }) =>
            `${formatNumberToPlaces(tradePrice)} ${market}`,
        },
        {
          Header: t('size'),
          id: 'filledAmount',
          accessor: ({ trade, filled, size }) =>
            `${formatNumberToPlaces(filled)} / ${formatNumberToPlaces(
              size,
            )} ${trade}`,
          Cell: ({ value }) => (
            <Tooltip description={t('sizeToolTip')} position="bottom">
              {value}
            </Tooltip>
          ),
        },
        {
          Header: t('value'),
          id: 'value',
          accessor: ({ totalExecutedValue, market }) =>
            `${formatNumberToPlaces(totalExecutedValue)} ${market}`,
        },
        {
          Header: t('fee'),
          accessor: 'feePaid',
          Cell: ({ value, original: { side, market, trade } }) =>
            `${formatNumberToPlaces(value)} ${
              side.toLowerCase() === 'buy' ? trade : market
            }`,
        },
        {
          Header: t('status'),
          id: 'status',
          accessor: ({ orderStatus }) => {
            const status = orderStatus.toLowerCase();
            switch (status) {
              case 'pending':
                return t('statusPending');
              case 'cancelled':
                return t('statusCancelled');
              case 'partially filled':
                return t('statusPartial');
              case 'filled':
                return t('statusFilled');
              case 'filled & cancelled':
                return t('statusFilledCancelled');
              default:
                return;
            }
          },
          Cell: ({ value, original: { orderStatus } }) => {
            const status = orderStatus.toLowerCase();
            switch (status) {
              case 'pending':
                return <Text color="status-warning">{value}</Text>;
              case 'cancelled':
                return <Text color="askColor">{value}</Text>;
              case 'partially filled':
                return <Text color="status-warning">{value}</Text>;
              case 'filled':
                return <Text color="bidColor">{value}</Text>;
              case 'filled & cancelled':
                return <Text color="bidColor">{value}</Text>;
              default:
                return;
            }
          },
        },
      ]}
      SubComponent={({
        original: { averagePrice, stopPrice, orderId, mOrders, market },
      }) => {
        return (
          <Box background="background-3" round={false}>
            <Paragraph size="small">
              <Text weight="bold">{t('orderId')}</Text>: {orderId}
            </Paragraph>
            <Paragraph size="small">
              <Text weight="bold">{t('averagePrice')}</Text>:{' '}
              {`${formatNumberToPlaces(averagePrice)} ${market}`}
            </Paragraph>
            <Paragraph size="small">
              <Text weight="bold">{t('stopprice')}</Text>:{' '}
              {`${formatNumberToPlaces(stopPrice)} ${market}`}
            </Paragraph>
            {mOrders && mOrders.length ? (
              <React.Fragment>
                <Heading level={4} margin={{ top: 'small' }}>
                  {t('mOrders')}
                </Heading>
                <UserTradeHistoryTable
                  extraProps={{
                    staticData: mOrders,
                    shouldFetchData: false,
                    SubComponent: null,
                  }}
                />
              </React.Fragment>
            ) : null}
          </Box>
        );
      }}
      style={{ height: '100%' }}
      defaultSorted={[
        {
          id: 'orderId',
          desc: true,
        },
      ]}
      sortable={false}
      {...extraProps}
    />
  );
};

UserOrderHistoryTable.propTypes = {
  tradingPair: PropTypes.oneOfType([
    PropTypes.shape({
      baseCurrency: PropTypes.string,
      quoteCurrency: PropTypes.string,
    }),
    PropTypes.oneOf(['ALL']),
  ]),
};

const mapStateToProps = ({ orders, auth }) => ({
  isAuthenticated: auth.isAuthenticated,
});

export default withNamespaces()(
  connect(mapStateToProps)(UserOrderHistoryTable),
);
