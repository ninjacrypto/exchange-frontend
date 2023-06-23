import React from 'react';
import { useSelector } from 'react-redux';
import { TableWrapper } from 'containers/Tables';
import { Box } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { CryptoIcon } from 'components/CryptoIcon';
import { formatNumberToPlaces } from 'utils/numbers';

const TradingFeesTable = ({ t: translate }) => {
  const t = nestedTranslate(translate, 'tables.tradingRules');
  const tradingPairs = useSelector(
    ({ markets: { tradingPairs } }) => tradingPairs,
  );
  const tradingPairSettings = useSelector(
    ({
      exchangeSettings: {
        settings: { tradingPairSettings },
      },
    }) => tradingPairSettings,
  );

  const tradingRules = tradingPairs.map(({ baseCurrency, quoteCurrency }) => ({
    ...tradingPairSettings[`${baseCurrency}${quoteCurrency}`],
    baseCurrency,
    quoteCurrency,
  }));

  return (
    <TableWrapper
      data={tradingRules}
      isFilterable={true}
      filterBy={['tradingPair']}
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
          Header: t('minTradeAmount'),
          accessor: 'minTradeAmount',
          Cell: ({ value, original: { baseCurrency } }) =>
            `${formatNumberToPlaces(value)} ${baseCurrency}`,
        },
        {
          Header: t('minTickSize'),
          accessor: 'minTickSize',
          Cell: ({ value, original: { quoteCurrency } }) =>
            `${formatNumberToPlaces(value)} ${quoteCurrency}`,
        },
        {
          Header: t('minOrderValue'),
          accessor: 'minOrderValue',
          Cell: ({ value, original: { quoteCurrency } }) =>
            `${formatNumberToPlaces(value)} ${quoteCurrency}`,
        },
        {
          Header: '',
          show: false,
          accessor: 'quoteCurrency',
        },
        {
          Header: '',
          show: false,
          accessor: 'baseCurrency',
        },
      ]}
      showPagination={false}
      defaultSorted={[
        {
          id: 'tradingPair',
        },
      ]}
      minRows={tradingRules.length}
      pageSize={tradingRules.length}
    />
  );
};

export default withNamespaces()(TradingFeesTable);
