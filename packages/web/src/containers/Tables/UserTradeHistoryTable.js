import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { moment } from 'i18n';
import _ from 'lodash';
import { withNamespaces } from 'react-i18next';

import { formatNumberToPlaces } from 'utils';
import { nestedTranslate } from 'utils/strings';
import { PaginationTableWrapper, TradingPairFilter } from 'containers/Tables';
import styles from './Table.module.scss';
import { Box, Paragraph, Text } from 'components/Wrapped';

const UserTradeHistoryTable = ({
  t: translate,
  isAuthenticated,
  tradingPair: initialTradingPair,
  extraProps,
}) => {
  const [tradingPair, setTradingPair] = useState(initialTradingPair || 'ALL');
  const t = nestedTranslate(translate, 'tables.tradeHistory');

  useEffect(() => {
    if (initialTradingPair) {
      setTradingPair(initialTradingPair)
    }
  }, [initialTradingPair])



  return (
    <PaginationTableWrapper
      filters={
        <TradingPairFilter
          setTradingPair={setTradingPair}
          defaultValue={tradingPair}
        />
      }
      tradingPair={tradingPair}
      shouldFetchData={
        isAuthenticated && tradingPair && !_.isEmpty(tradingPair)
      }
      exportable={[
        'date',
        'tradingPair',
        'side',
        'rate',
        'size',
        'value',
        'serviceCharge',
      ]}
      fileName="trade-history"
      apiUrl="/api/TradeHistory"
      apiData={{
        side: 'ALL',
        pair:
          tradingPair === 'ALL'
            ? 'ALL'
            : `${tradingPair.baseCurrency}-${tradingPair.quoteCurrency}`,
      }}
      columns={[
        {
          Header: t('date'),
          id: 'date',
          accessor: ({ date }) =>
            moment
              .utc(date)
              .local()
              .format('YYYY-MM-DD HH:mm:ss Z'),
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
          Header: t('price'),
          id: 'rate',
          accessor: ({ rate, market }) =>
            `${formatNumberToPlaces(rate)} ${market}`,
        },
        {
          Header: t('size'),
          id: 'size',
          accessor: ({ volume, trade }) =>
            `${formatNumberToPlaces(volume)} ${trade}`,
        },
        {
          Header: t('value'),
          id: 'value',
          accessor: ({ amount, market }) =>
            `${formatNumberToPlaces(amount)} ${market}`,
        },
        {
          Header: t('fee'),
          accessor: 'serviceCharge',
          Cell: ({ value, original: { side, market, trade } }) =>
            `${formatNumberToPlaces(value)} ${
              side.toLowerCase() === 'buy' ? trade : market
            }`,
        },
      ]}
      style={{ height: '100%' }}
      defaultSorted={[
        {
          id: 'orderId',
          desc: true,
        },
      ]}
      sortable={false}
      SubComponent={props => {
        return (
          <Box background="background-3" round={false}>
            <Paragraph>
              <Text weight="bold">{t('orderId')}</Text>:{' '}
              {props.original.orderId}
            </Paragraph>
          </Box>
        );
      }}
      {...extraProps}
    />
  );
};

UserTradeHistoryTable.propTypes = {
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
  connect(mapStateToProps)(UserTradeHistoryTable),
);
