import React from 'react';
import { useSelector } from 'react-redux';
import { TableWrapper } from 'containers/Tables';
import { Box, Heading } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { CryptoIcon } from 'components/CryptoIcon';

const TradingFeesTable = ({ t: translate }) => {
  const tradingFees = useSelector(
    ({ markets: { tradingFees } }) => tradingFees,
  );
  const t = nestedTranslate(translate, 'tables.fees');
  let formattedTradingFees = [];
  Object.entries(tradingFees).forEach(
    ([quoteCurrency, currencyTradingFees]) => {
      Object.entries(currencyTradingFees).forEach(
        ([baseCurrency, singleTradingFee]) =>
          formattedTradingFees.push({
            baseCurrency,
            quoteCurrency,
            ...singleTradingFee,
          }),
      );
    },
  );

  const formatFee = ({ value }) => `${value}%`;

  return (
    <Box gap="small">
      <Heading>{t('tradingFeesTitle')}</Heading>
      <TableWrapper
        data={formattedTradingFees}
        columns={[
          {
            Header: t('tradingPair'),
            id: 'tradingPair',
            accessor: ({ quoteCurrency, baseCurrency }) =>
              `${baseCurrency}/${quoteCurrency}`,
            Cell: ({ value, original: { baseCurrency } }) => (
              <Box pad="none" align="center" direction="row">
                <CryptoIcon currency={baseCurrency} />
                {value}
              </Box>
            ),
          },
          {
            Header: t('makerFee'),
            accessor: 'makerFee',
            Cell: formatFee,
          },
          {
            Header: t('takerFee'),
            accessor: 'takerFee',
            Cell: formatFee,
          },
        ]}
        showPagination={false}
        defaultSorted={[
          {
            id: 'tradingPair',
          },
        ]}
        minRows={formattedTradingFees.length}
        pageSize={formattedTradingFees.length}
      />
    </Box>
  );
};

export default withNamespaces()(TradingFeesTable);
