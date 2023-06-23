import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { withNamespaces } from 'react-i18next';
import { useQuery, useMutation, queryCache } from 'react-query';

import { exchangeApi } from 'api';
import { AddAddress } from './AddAddressForm';
import { AddressWhitelist } from './AddressWhitelist';
import { TableWrapper } from 'containers/Tables';
import { nestedTranslate } from 'utils';
import { Loading } from 'components/Loading';
import { Requires2FA } from 'containers/Requires2FA';
import { Button, Heading, Message, Box } from 'components/Wrapped';

export const useAddressBook = () => {
  return useQuery('addressBook', () => exchangeApi.getAddressBook());
};

export const AddressBook = withNamespaces()(({ t: translate }) => {
  const t = nestedTranslate(translate, 'wallet.addressBook');
  const { isLoading, data, error } = useAddressBook();
  const [mutate] = useMutation(
    ({ id, label }) => exchangeApi.removeFromAddressBook({ id, label }),
    {
      onSuccess: () => {
        queryCache.invalidateQueries('addressBook');
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
          <Box background="background-4">
            <Fragment>
              <Box pad="none" gap="small">
                <AddAddress />
                <AddressWhitelist />
                <Heading label={3}>{t('pluralAddresses')}</Heading>
                {tableData.length ? (
                  <TableWrapper
                    data={tableData}
                    columns={[
                      {
                        Header: t('label'),
                        accessor: 'Label',
                      },
                      {
                        Header: t('currency'),
                        accessor: 'Currency',
                      },
                      {
                        Header: t('newAddress'),
                        accessor: 'Address',
                      },
                      {
                        Header: t('tag'),
                        accessor: 'DT_Memo',
                      },
                      {
                        Header: t('action'),
                        accessor: 'ID',
                        Cell: renderDelete,
                        maxWidth: 125,
                      },
                    ]}
                    pageSize={tableData.length}
                    showPagination={false}
                  />
                ) : (
                  <Message background="background-2">{t('noAddresses')}</Message>
                )}
              </Box>
            </Fragment>
          </Box>
        {/* </Requires2FA> */}
    </React.Fragment>
  );
});

