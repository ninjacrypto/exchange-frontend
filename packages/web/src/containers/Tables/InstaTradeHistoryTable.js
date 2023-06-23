import React from 'react';
import { withNamespaces } from 'react-i18next';

import { exchangeApi } from 'api';
import { TableWrapper } from 'containers/Tables';
import { moment } from 'i18n';
import { nestedTranslate, formatCrypto, formatNumberToPlaces } from 'utils';
import { Text } from 'components/Wrapped';
import { useQuery } from 'react-query';

const useInstaTradeHistory = isSimplex => {
  return useQuery('instaTradeHistory', () =>
    exchangeApi.getInstaTradeHistory(isSimplex),
  );
};

const calculatePayment = ({ value, rate, commission }) => {
  return -(100 * value) / (rate * (commission - 100));
};

const InstaTradeHistoryTable = ({ t: translate, type = 'instaTrade' }) => {
  const isSimplex = type !== 'instaTrade';
  const { isLoading, data } = useInstaTradeHistory(isSimplex);
  const t = nestedTranslate(translate, 'tables.instaTradeHistory');
  let trades = [];

  if (!isLoading && data?.status === 'Success') {
    trades = data.data;
  }

  return (
    <TableWrapper
      data={trades}
      columns={[
        {
          Header: t('date'),
          accessor: 'requestedOn',
          Cell: ({ value }) =>
            moment
              .utc(value)
              .local()
              .format('L HH:mm'),
        },
        {
          Header: t('purchased'),
          accessor: 'quoteAmount',
          Cell: ({ value, original: { quoteCurrency } }) =>
            `${formatCrypto(value, true)} ${quoteCurrency}`,
        },
        {
          Header: t('paymentAmount'),
          accessor: 'baseAmount',
          Cell: ({ value, original: { baseCurrency } }) =>
            `${formatCrypto(value, true)} ${baseCurrency}`,
        },
        {
          Header: t('rate'),
          id: 'rate',
          accessor: ({ rate, commission }) => calculatePayment({ value: 1, rate, commission }),
          Cell: ({ value, original: { baseCurrency } }) => `${formatNumberToPlaces(value)} ${baseCurrency}`
        },
        {
          Header: t('status'),
          accessor: 'status',
          Cell: ({ value }) => {
            return value ? (
              <Text color="status-ok">{t('complete')}</Text>
            ) : (
              <Text>{t('pendingOrCancelled')}</Text>
            );
          },
        },
      ]}
      defaultSorted={[{ id: 'date', desc: true }]}
      minRows={trades.length || 10}
    />
  );
};

export default withNamespaces()(InstaTradeHistoryTable);
