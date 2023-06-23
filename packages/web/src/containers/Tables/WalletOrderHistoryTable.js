import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { moment } from 'i18n';
import _ from 'lodash';
import { withNamespaces } from 'react-i18next';
import { TableWrapper } from 'containers/Tables';
import { formatNumberToPlaces } from 'utils';
import { Box, Paragraph, Text, Heading } from 'components/Wrapped';
import { nestedTranslate } from 'utils/strings';
import {
  PaginationTableWrapper2,
  NDTradingPairFilter,
} from 'containers/Tables';
import { Tooltip } from 'components/Tooltip';

import styles from './Table.module.scss';

const WalletOrderHistoryTable = ({
  t: translate,
  tradingPair: initialTradingPair,
  isAuthenticated,
  extraProps,
}) => {
  const [tradingPair, setTradingPair] = useState(initialTradingPair || 'ALL');
  const t = nestedTranslate(translate, 'tables.tradeHistory');

  useEffect(() => {
    if (initialTradingPair) {
      setTradingPair(initialTradingPair);
    }
  }, [initialTradingPair]);

  const formatUserOrderHistory = orderHistory => {
    const formattedTradeHistory = orderHistory.map(
      ({ placed_at, pair, ...rest }) => {
        const [trade, market] = pair.split('-');

        return {
          market,
          trade,
          date: moment
            .utc(placed_at)
            .local()
            .valueOf(),
          ...rest,
        };
      },
    );

    return _.orderBy(formattedTradeHistory, 'placed_at', 'desc');
  };

  return (
    <PaginationTableWrapper2
      filters={
        <NDTradingPairFilter
          setTradingPair={setTradingPair}
          defaultValue={tradingPair}
        />
      }
      shouldFetchData={
        isAuthenticated && tradingPair && !_.isEmpty(tradingPair)
      }
      apiUrl="/okx/order-history"
      apiData={{
        side: 'ALL',
        pair:
          tradingPair === 'ALL' || tradingPair.baseCurrency === 'ALL'
            ? 'ALL'
            : `${tradingPair.baseCurrency}-${tradingPair.quoteCurrency}`,
      }}
      dataTransformer={formatUserOrderHistory}
      exportable={['placed_at', 'pair', 'side', 'type', 'price', 'filled']}
      fileName="ND-order-history"
      columns={[
        {
          Header: t('date'),
          id: 'placed_at',
          accessor: ({ date }) => moment(date).format('YYYY-MM-DD HH:mm:ss Z'),
          minWidth: 135,
        },
        {
          Header: t('pair'),
          id: 'pair',
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
          id: 'type',
          accessor: ({ type }) => translate(`generics.orderTypes.${type}`),
          maxWidth: 75,
        },
        {
          Header: t('averagePrice'),
          id: 'avg_price',
          accessor: ({ avg_price, market }) =>
            `${formatNumberToPlaces(avg_price)} ${market}`,
        },
        {
          Header: t('size'),
          id: 'filled',
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
          Header: t('status'),
          id: 'status',
          accessor: ({ status }) => {
            const status2 = status.toLowerCase();
            switch (status2) {
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
          Cell: ({ value, original: { status } }) => {
            const status2 = status.toLowerCase();
            switch (status2) {
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
      SubComponent={({ original: { price, order_id, trades, market, trade } }) => {
        return (
          <Box background="background-3" round={false}>
            <Paragraph size="small">
              <Text weight="bold">{t('orderId')}</Text>: {order_id}
            </Paragraph>
            <Paragraph size="small">
              <Text weight="bold">{t('price')}</Text>:{' '}
              {`${formatNumberToPlaces(price)} ${market}`}
            </Paragraph>
            {trades && trades.length ? (
              <React.Fragment>
                <Heading level={4} margin={{ top: 'small' }}>
                  {t('mOrders')}
                </Heading>
                <TableWrapper
                  data={trades}
                  columns={[
                    {
                      Header: t('date'),
                      id: 'created_at',
                      accessor: ({ value }) => moment(value).format('YYYY-MM-DD HH:mm:ss Z'),
                      minWidth: 135,
                    },
                    {
                      Header: t('price'),
                      id: 'price',
                      accessor: ({ price }) =>
                        `${formatNumberToPlaces(price)} ${market}`,
                    },
                    {
                      Header: t('size'),
                      id: 'size',
                      accessor: ({ size }) =>
                        `${formatNumberToPlaces(size)} ${trade}`,
                    },
                  ]}
                  minRows={trades.length}
                  showPagination={false}
                />
              </React.Fragment>
            ) : null}
          </Box>
        );
      }}
      style={{ height: '100%' }}
      defaultSorted={[
        {
          id: 'order_id',
          desc: true,
        },
      ]}
      sortable={false}
      {...extraProps}
    />
  );
};

WalletOrderHistoryTable.propTypes = {
  tradingPair: PropTypes.oneOfType([
    PropTypes.shape({
      baseCurrency: PropTypes.string,
      quoteCurrency: PropTypes.string,
    }),
    PropTypes.oneOf(['ALL']),
  ]),
};

const mapStateToProps = ({ auth }) => ({
  isAuthenticated: auth.isAuthenticated,
});

export default withNamespaces()(
  connect(mapStateToProps)(WalletOrderHistoryTable),
);
