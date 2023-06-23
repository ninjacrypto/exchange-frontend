import React, { Fragment } from 'react';
import _ from 'lodash';
import { moment } from 'i18n';
import { connect } from 'react-redux';
import { Copy, Transaction } from 'grommet-icons';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { Box, Paragraph } from 'components/Wrapped';
import { TableWrapper, TableSubComponentRow } from 'containers/Tables';
import { ExternalLink } from 'components/Helpers';
import { handleCopyToClipboard } from 'utils';
import { formatNumberToPlaces } from 'utils/numbers';
import { useMutation, queryCache } from 'react-query';
import { Button } from 'components/Wrapped';
import { exchangeApi } from 'api';
import { triggerToast } from 'redux/actions/ui';
import { getDepositHistory} from 'redux/actions/portfolio';
import { withRouter } from 'react-router';

const INTERNAL_TRANSFER = 'Internal transfer';

const CryptoDepositHistoryTable = ({ data, t }) => (
  <TableWrapper
    data={data}
    exportable={[
      'depositReqDate',
      'depositConfirmDate',
      'depositAmount',
      'txnHash',
      'status',
    ]}
    fileName="deposit-history"
    isFilterable={true}
    filterBy={['depositAmount']}
    columns={[
      {
        Header: t('depositReqDate'),
        id: 'depositReqDate',
        accessor: ({ depositReqDate: value }) =>
          moment
            .utc(value)
            .local()
            .format('L HH:mm'),
            style: {textAlign: 'center'},
            headerStyle: {textAlign: 'center'}
      },
      {
        Header: t('depositConfirmDate'),
        accessor: 'depositConfirmDate',
        Cell: ({ value }) =>
          moment
            .utc(value)
            .local()
            .format('L HH:mm'),
            style: {textAlign: 'center'},
            headerStyle: {textAlign: 'center'}
      },
      {
        Header: t('depositAmount'),
        id: 'depositAmount',
        accessor: ({ depositAmount, depositType }) =>
          `${formatNumberToPlaces(depositAmount)} ${depositType}`,
          style: {textAlign: 'center'},
          headerStyle: {textAlign: 'center'}
      },
      {
        Header: t('txnHash'),
        id: 'txnHash',
        accessor: ({ txnHash, depositAddress }) =>
        depositAddress === INTERNAL_TRANSFER ? t('internalTransfer') : txnHash,
        Cell: ({ value, original: { explorerURL, depositAddress } }) =>
          value &&
          (depositAddress === INTERNAL_TRANSFER ? (
            value
          ) : (
            <Box pad="none" direction="row" style={{alignItems: 'center',justifyContent: 'center'}}>
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
      {
        Header: t('status'),
        id: 'status',
        accessor: ({ currentTxnCount, requiredTxnCount }) => {
          return currentTxnCount >= requiredTxnCount
            ? t('completed')
            : `${currentTxnCount}/${requiredTxnCount} Confirmations`;
        },
        style: {textAlign: 'center'},
        headerStyle: {textAlign: 'center'}
      },
    ]}
    // defaultSorted={[
    //   {
    //     id: 'depositConfirmDate',
    //     desc: true,
    //   },
    //   {
    //     id: 'depositReqDate',
    //     desc: true,
    //   },
    // ]}
    minRows={10}
    pageSize={10}
    showPagination={true}
    sortable={false}
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
              address={original?.depositAddress}
            />
          );
        });
      return <Box background="background-3">{formattedRowData}</Box>;
    }}
  />
);



export const FiatDepositHistoryTable = ({ data, t, currency, wallettype, getDepositHistoryFun }) => {

  const renderDelete = ({ value, original: { type , status} }) => {
      return (
        type === "Bank" && status === "Pending" && 
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
      (ID) => exchangeApi.removeFiatdepositrequest(ID),
      {
        onSuccess: (result) => {
          getDepositHistoryFun(currency, wallettype)
          triggerToast(result.message, 'success', 2500)
        },
      },
    );
 

  return(
  <TableWrapper
    data={data}
    exportable={[
      'requestDate',
      'approvedDate',
      'requestAmount',
      'transactionID',
      'status',
      'rejectReason'
    ]}
    fileName="deposit-history"
    columns={[
      {
        Header: t('requestDate'),
        accessor: 'requestDate',
        Cell: ({ value }) =>
          moment
            .utc(value)
            .local()
            .format('L HH:mm'),
        style: {textAlign: 'center'},
        headerStyle: {textAlign: 'center'}
      },
      // {
      //   Header: t('approvedDate'),
      //   accessor: 'approvedDate',
      //   Cell: ({ value }) =>
      //     value &&
      //     moment
      //       .utc(value)
      //       .local()
      //       .format('L HH:mm'),
      //       style: {textAlign: 'center'},
      //       headerStyle: {textAlign: 'center'}
      // },
      {
        Header: t('requestAmount'),
        accessor: 'requestAmount',
        Cell: ({ value }) => formatNumberToPlaces(value),
        style: {textAlign: 'center'},
        headerStyle: {textAlign: 'center'}
      },
      {
        Header: t('transactionID'),
        accessor: 'transactionID',
        style: {textAlign: 'center', overflow:'hidden', textOverflow:'ellipsis'},
        headerStyle: {textAlign: 'center', }
      },
      {
        Header: t('status'),
        id: 'status',
        accessor: ({ status }) => t(`${status.toLowerCase()}`),
        maxWidth: 80,
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
      // {
      //   Header: t('rejectReason'),
      //   accessor: 'rejectReason',
      //   minWidth: 150,
      //   style: {textAlign: 'center'},
      //   headerStyle: {textAlign: 'center'}
      // },
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
    //     id: 'depositConfirmDate',
    //     desc: true,
    //   },
    //   {
    //     id: 'depositReqDate',
    //     desc: true,
    //   },
    // ]}
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
            />
          );
        });
      return <Box background="background-3">{formattedRowData}</Box>;
    }}
    className="-highlight"
    minRows={10}
    pageSize={10}
    showPagination={true}
    sortable={false}
  />
)};

class DepositHistoryTable extends React.PureComponent {

  renderDepositHistoryTable() {
    const { depositHistory, t: translate, currencySettings,
      match: {
        params: { currency },
      },
    } = this.props;
 
    const t = nestedTranslate(translate, 'tables.depositHistory');
    const isFiat = _.has(depositHistory[0], 'type');

    const getDepositHistoryData = (curreny, walletType) => {
      this.props.getDepositHistory(curreny, walletType);
    }

    const Component = isFiat
      ? FiatDepositHistoryTable
      : CryptoDepositHistoryTable;

    return <Component t={t} data={depositHistory} getDepositHistoryFun={getDepositHistoryData} currency={currency} wallettype={_.get(currencySettings, 'walletType', currency === `ALLC` ? 'Crypto' : 'Fiat')} />;
  }

  render() {
    const { depositHistory, t: translate } = this.props;
    const t = nestedTranslate(translate, 'tables.depositHistory');
    return (
      <Fragment>
        {_.isEmpty(depositHistory) ? (
          <Box align="center" gap="small">
            <Transaction size="50px" />
            <Paragraph>{t('noDepositHistory')}</Paragraph>
          </Box>
        ) : (
          this.renderDepositHistoryTable()
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = ({ portfolio, ui, exchangeSettings }) => ({
  currencySettings: exchangeSettings.currencySettings,
  depositHistory: portfolio.depositHistory,
  isModalOpen: ui.isModalOpen,
});

export default withRouter(
  withNamespaces()(
    connect(mapStateToProps, {getDepositHistory})(DepositHistoryTable),
  ),
);
