import React from 'react';
import _ from 'lodash';
import { withNamespaces } from 'react-i18next';
import { useQuery, useMutation, queryCache } from 'react-query';

import { exchangeApi } from 'api';
import { AddBanks } from './AddBanksForm';
import { TableWrapper } from 'containers/Tables';
import { nestedTranslate } from 'utils';
import { Loading } from 'components/Loading';
import { Button, Heading, Message, Box, Paragraph, Text } from 'components/Wrapped';
import { triggerToast } from 'redux/actions/ui';
import { TableSubComponentRow } from 'containers/Tables';
import { Requires2FA } from 'containers/Requires2FA';

export const useFiatCustomerAccounts = () => {
  return useQuery('banks', () => exchangeApi.getFiatCustomerAccounts());
};

export const Banks = withNamespaces()(({ t: translate }) => {
  const t = nestedTranslate(translate, 'wallet.banks');
  const { isLoading, data, error } = useFiatCustomerAccounts();
  const [mutate] = useMutation(
    (id) => exchangeApi.removeFiatCustomerAccount(id),
    {
      onSuccess: (result) => {
        queryCache.invalidateQueries('banks');
        triggerToast(result.message, 'success', 2500)
      },
    },
  );

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return null;
  }

  const tableData = _.isArray(data.data) ? data.data : [];

  const renderDelete = ({ value, original: { Label } }) => {
    return (
      <Button
        color="primary"
        size="xsmall"
        onClick={() => mutate({ id: value, label: Label })}
      >
        {translate('buttons.delete')}
      </Button>
    );
  };

  return (
    <React.Fragment>
      {/* <Requires2FA> */}
      <Box pad="none" gap="small">
      <AddBanks />
      <Heading label={3}>{t('bankAccounts')}</Heading>
      {tableData.length ? (
        <TableWrapper
          data={tableData}
          columns={[
            {
              Header: t('accountNumber'),
              accessor: 'accountNumber',
            },
            {
              Header: t('accountType'),
              accessor: 'accountType',
            },
            {
              Header: t('accountCurrency'),
              accessor: 'accountCurrency',
            },
            {
              Header: t('bankRoutingCode'),
              accessor: 'bankRoutingCode',
            },
            {
              Header: t('bankName'),
              accessor: 'bankName',
            },
            {
              Header: t('swiftCode'),
              accessor: 'swiftCode',
            },
            {
              Header: t('action'),
              accessor: 'id',
              Cell: renderDelete,
              maxWidth: 125,
            },
          ]}
          // SubComponent={({
          //   original: { accountCurrency, bankRoutingCode, branchCity, branchCountry, branchName, branchProvince, branchRoutingCode},
          // }) => {
          //   return (
          //     <Box background="background-3" round={false}>
          //       <Paragraph size="small">
          //         <Text weight="bold">{t('accountCurrency')}</Text>: {accountCurrency}
          //       </Paragraph>
          //       <Paragraph size="small">
          //         <Text weight="bold">{t('bankRoutingCode')}</Text>: {bankRoutingCode}
          //       </Paragraph>
          //       <Paragraph size="small">
          //         <Text weight="bold">{t('branchCity')}</Text>: {branchCity}
          //       </Paragraph>
          //       <Paragraph size="small">
          //         <Text weight="bold">{t('branchCountry')}</Text>: {branchCountry}
          //       </Paragraph>
          //       <Paragraph size="small">
          //         <Text weight="bold">{t('branchName')}</Text>: {branchName}
          //       </Paragraph>
          //       <Paragraph size="small">
          //         <Text weight="bold">{t('branchProvince')}</Text>: {branchProvince}
          //       </Paragraph>
          //       <Paragraph size="small">
          //         <Text weight="bold">{t('branchRoutingCode')}</Text>: {branchRoutingCode}
          //       </Paragraph>
          //     </Box>
          //   );
          // }}
          pageSize={tableData.length}
          showPagination={false}
        />
      ) : (
        <Message background="background-2">{t('noBankAccounts')}</Message>
      )}
    </Box>
      {/* </Requires2FA> */}
    </React.Fragment>
  );
});

