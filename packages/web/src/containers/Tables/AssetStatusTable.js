import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Loading } from 'components/Loading';
import TableWrapper from './TableWrapper';
import { CurrencyInfo } from 'components/CurrencyInfo';
import { nestedTranslate } from 'utils';
import { Box, Text } from 'components/Wrapped';
import { StatusGood, StatusCritical } from 'grommet-icons';

const AssetStatusTable = ({ currencySettings, t: translate }) => {
  const t = nestedTranslate(translate, 'tables.assetStatus');
  if (_.isEmpty(currencySettings)) {
    return <Loading />;
  }

  const tableData = Object.values(currencySettings).filter(
    ({ currencyEnabled }) => currencyEnabled,
  );

  const renderStatus = enabled => {
    return (
      <Box pad="none" direction="row" gap="small" align="center">
        {enabled ? (
          <StatusGood color="bidColor" size="medium" />
        ) : (
          <StatusCritical color="askColor" size="medium" />
        )}
        <Text>{enabled ? t('enabled') : t('disabled')}</Text>
      </Box>
    );
  };

  return (
    <TableWrapper
      data={tableData}
      columns={[
        {
          Header: t('name'),
          accessor: 'fullName',
          Cell: ({ value, original: { shortName } }) => (
            <CurrencyInfo
              currency={shortName}
              onlyFullName={true}
              hasIcon={true}
            />
          ),
        },
        {
          Header: t('ticker'),
          accessor: 'shortName',
          maxWidth: 100,
        },
        // {
        //   Header: t('assetType'),
        //   id: 'assetType',
        //   accessor: ({ walletType }) => t(`walletTypes.${walletType}`, walletType),
        // },
        {
          Header: t('deposits'),
          accessor: 'depositEnabled',
          Cell: ({ value }) => renderStatus(value),
        },
        {
          Header: t('withdrawals'),
          accessor: 'withdrawalEnabled',
          Cell: ({ value }) => renderStatus(value),
        },
        {
          Header: t('trade'),
          accessor: 'tradeEnabled',
          Cell: ({ value }) => renderStatus(value),
        },
      ]}
      defaultSorted={[
        {
          id: 'fullName',
          asc: true,
        },
      ]}
      pageSize={tableData.length}
      showPagination={false}
    />
  );
};

const mapStateToProps = ({ exchangeSettings: { currencySettings } }) => ({
  currencySettings,
});

export default withNamespaces()(connect(mapStateToProps)(AssetStatusTable));
