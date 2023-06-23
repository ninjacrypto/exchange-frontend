import React, { Fragment } from 'react';
import _ from 'lodash';
import { moment } from 'i18n';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Copy, Transaction } from 'grommet-icons';

import { nestedTranslate, handleCopyToClipboard } from 'utils';
import { Box, Paragraph, Text } from 'components/Wrapped';
import { TableWrapper } from 'containers/Tables';
import { ExternalLink } from 'components/Helpers';
import { formatNumberToPlaces } from 'utils/numbers';
import { TableSubComponentRow } from 'containers/Tables';
import { Button } from 'components/Wrapped';
import { exchangeApi } from 'api';
import { useMutation, queryCache } from 'react-query';
import { triggerToast } from 'redux/actions/ui';

import { withRouter } from 'react-router';
import { getWithdrawalHistory} from 'redux/actions/portfolio';
const INTERNAL_TRANSFER = 'Internal transfer';

export const FiatWithdrawalHistoryTable = ({ data, t, currency, getWithdrawalHistoryFun }) => {

  const renderDelete = ({ value, original: { type , withdrawalStatus} }) => {
      return (
        type === "Bank" && withdrawalStatus === "Pending" && 
        (<Button
        color="primary"
        size="xsmall"
        onClick={() => mutate({ ID: value})}
      >
        {t('delete')}
      </Button>)
      
      );
    };
    const [mutate] = useMutation(
      (ID) => exchangeApi.removeFiatWithdrawalrequest(ID),
      {
        onSuccess: (result) => {
          getWithdrawalHistoryFun(currency)
          triggerToast(result.message, 'success', 2500)
        },
      },
    );
 

  return(
    <TableWrapper 
    data={data}
    exportable={[
      'withdrawalReqDate',
      'withdrawalConfirmDate',
      'withdrawalAmount',
      'txnHash',
      'address',
      'withdrawalStatus',
    ]}
    filterBy={['withdrawalAmount']}
    isFilterable={true}
    fileName="withdrawal-history"
    columns={[
      {
        Header: () => (
            t('withdrawalReqDate')

        ) ,
        id: 'withdrawalReqDate',  
   
        accessor: ({ withdrawalReqDate }) =>
          moment
            .utc(withdrawalReqDate)
            .local()
            .format('L HH:mm'),
            style: {textAlign: 'center'},
            headerStyle: {textAlign: 'center'}
            
      },
      // {
      //   Header: t('withdrawalConfirmDate'),
      //   id: 'withdrawalConfirmDate',
      //   accessor: ({ withdrawalConfirmDate }) =>
      //     withdrawalConfirmDate &&
      //     moment
      //       .utc(withdrawalConfirmDate)
      //       .local()
      //       .format('L HH:mm'),
      // },
      {
        Header: t('withdrawalAmount'),
        id: 'withdrawalAmount',
        accessor: ({ withdrawalAmount, withdrawalType }) =>
          `${formatNumberToPlaces(withdrawalAmount)} ${withdrawalType}`,
          style: {textAlign: 'center'},
          headerStyle: {textAlign: 'center'}
      },  
      {
        Header: t('type'),
        id: 'type',
        accessor: ({ type }) => t(`${type.toLowerCase()}`),
        style: {textAlign: 'center'},
        headerStyle: {textAlign: 'center'}
      },
      {
        Header: t('txnHash'),
        id: 'txnHash',
        accessor: ({ txnHash, withdrawalAddress }) =>
          withdrawalAddress === INTERNAL_TRANSFER
            ? t('internalTransfer')
            : txnHash,
        Cell: ({
          value,
          original: { explorerURL, withdrawalAddress },
        }) =>
          value &&
          (withdrawalAddress === INTERNAL_TRANSFER ? (
            value
          ) : (
            <Box pad="none" direction="row">
              <ExternalLink
                style={{ maxWidth: 75, marginRight: 10 }}
                href={explorerURL}
              >
                <div
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {value}
                </div>
              </ExternalLink>
              <Copy
                size="small"
                onClick={() => handleCopyToClipboard(value)}
                style={{ cursor: 'pointer' }}
              />
            </Box>
          )),
          
        style: {textAlign: 'center'},
        headerStyle: {textAlign: 'center'}
      },
      // {
      //   Header: t('withdrawalAddress'),
      //   id: 'address',
      //   accessor: ({ withdrawalAddress }) =>
      //     withdrawalAddress === INTERNAL_TRANSFER
      //       ? t('internalTransfer')
      //       : withdrawalAddress,
      //   Cell: ({ value }) => <Text truncate={true} size="xsmall">{value}</Text>,
      // },
      {
        Header: t('withdrawalStatus'),
        id: 'withdrawalStatus',
        accessor: ({ withdrawalStatus }) => t(`${withdrawalStatus.toLowerCase()}`),
        style: {textAlign: 'center'},
        headerStyle: {textAlign: 'center'}
      },
      {
        Header: t('delete'),
        accessor: 'id',
        Cell: renderDelete,
        maxWidth: 125,
        style: {textAlign: 'center'},
        headerStyle: {textAlign: 'center'}
      },
    ]}
    // defaultSorted={[
    //   {
    //     id: 'withdrawalConfirmDate',
    //     desc: true,
    //   },
    //   {
    //     id: 'withdrawalReqDate',
    //     desc: true,
    //   },
    // ]}
    sortable={false}
    showPagination={true}
    minRows={10}
    pageSize={10}
    className="-highlight"
    SubComponent={({ original }) => {
      const formattedRowData = Object.entries(original)
        .filter(([key]) => !key.startsWith('_'))
        .map(([key, val]) => {
          return (
            <TableSubComponentRow
              key={key}
              type={key}
              value={val}
              label={t(key)}
              address={original?.withdrawalAddress}
              wtype= {original?.type}
            />
          );
        });
      return <Box background="background-3">{formattedRowData}</Box>;
    }}
  />
)};


class WithdrawalHistoryTable extends React.PureComponent {


  render() {
    const { withdrawalHistory, t: translate,
      match: {
        params: { currency },
      },
    } = this.props;
    const t = nestedTranslate(translate, 'tables.withdrawalHistory');
    const getWithdrawalHistoryData = (curreny) => {
      this.props.getWithdrawalHistory(curreny);
    }
    return (
      <Fragment>
        {_.isEmpty(withdrawalHistory) ? (
          <Box align="center" gap="small">
            <Transaction size="50px" />
            <Paragraph>{t('noWithdrawalHistory')}</Paragraph>
          </Box>
        ) : (
          <FiatWithdrawalHistoryTable t={t} data={withdrawalHistory} getWithdrawalHistoryFun={getWithdrawalHistoryData} currency={currency} />
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = ({ portfolio, ui }) => ({
  withdrawalHistory: portfolio.withdrawalHistory,
  isModalOpen: ui.isModalOpen,
});

export default withRouter(
  withNamespaces()(
  connect(mapStateToProps, {getWithdrawalHistory})(WithdrawalHistoryTable),
),);
