import React from 'react';
import { useSelector } from 'react-redux';
import { TableWrapper } from 'containers/Tables';
import { Box, Heading } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { CurrencyInfo } from 'components/CurrencyInfo';

const WithdrawalFeesTable = ({ t: translate }) => {
  const currencySettings = useSelector(
    ({ exchangeSettings: { currencySettings } }) => currencySettings,
  );
  const tableData = Object.values(currencySettings);
  const t = nestedTranslate(translate, 'tables.fees');

  return (
    <Box gap="small">
      <Heading>{t('withdrawalFeesTitle')}</Heading>
      <TableWrapper
        data={tableData}
        columns={[
          {
            Header: t('currency'),
            accessor: 'shortName',
            Cell: ({ value }) => (
              <CurrencyInfo
                currency={value}
                hasFullName={true}
                hasIcon={true}
              />
            ),
          },
          {
            Header: t('depositFee'),
            id: 'depositFee',
            accessor: () => t('free'),
          },
          {
            Header: t('withdrawalFee'),
            accessor: 'withdrawalServiceCharge',
            Cell: ({
              value,
              original: { withdrawalServiceChargeType, shortName },
            }) =>
              withdrawalServiceChargeType === 'Fixed'
                ? `${value} ${shortName}`
                : `${value}%`,
          },
          // {
          //   Header: t('minWithdrawal'),
          //   accessor: 'minWithdrawalLimit',
          //   Cell: ({ value, original: { shortName } }) =>
          //     `${value} ${shortName}`,
          // },
        ]}
        showPagination={false}
        defaultSorted={[
          {
            id: 'shortName',
          },
        ]}
        minRows={tableData.length}
        pageSize={tableData.length}
      />
    </Box>
  );
};

export default withNamespaces()(WithdrawalFeesTable);
