import React from 'react';
import _ from 'lodash';
import { moment } from 'i18n';

import { ExternalLink } from 'components/Helpers';
import { Paragraph, Text } from 'components/Wrapped';
import { S3Download } from 'containers/S3Storage';
import { nestedTranslate } from 'utils';
import { withNamespaces } from 'react-i18next';
const INTERNAL_TRANSFER = 'Internal transfer';
const FIAT_PAYMENT = 'Bank'
const ACH_PAYMENT = 'ACH'



export const TableSubComponentRow = ({ type, value, label, address, wtype }) => {
  const isInternalTransfer = address === INTERNAL_TRANSFER;
  const isFiatPayment = wtype === FIAT_PAYMENT;
  const isAchPayment = wtype === ACH_PAYMENT;

  if (!value || value === 'NA' || value === '') {
    return null;
  }
  // Hide in all cases
  if (_.includes(['type','withdrawalStatus', 'withdrawalType', 'withdrawalReqDate', 'id','equivalentUsdAmt', 'status'],type)) {
    return null;
  }
  if (isFiatPayment || isAchPayment) {
    if (_.includes(_.lowerCase(type), 'url')) {
      return null;
    }
    if (_.includes(['txnHash', 'withdrawalAddress', 'withdrawalReqDate'], type)) {
      return null;
    }
  }

  if (isInternalTransfer) {
    if (_.includes(_.lowerCase(type), 'url')) {
      return null;
    }
    if (_.includes(['txnHash', 'currentTxnCount', 'requiredTxnCount'], type)) {
      return null;
    }
  }

  if (type === 'bankDetails'){
    return (
        <TableSubComponentValue type={type} value={value} address={address} />
    );
  }
  else{
  return (
    <Paragraph>
      <Text weight="bold">{`${label}: `}</Text>
      <TableSubComponentValue type={type} value={value} address={address} />
    </Paragraph>
  );
  }
};

export const TableSubComponentValue = withNamespaces() ( ({ t: translate ,type, value}) => {
  const t = nestedTranslate(translate, 'tables.withdrawalHistory');

  if (type === 'bankDetails'){
    const formattedRowData = Object.entries(value)
                .filter(([key]) => !key.startsWith('_'))
                .map(([key, val]) => {
                  return (
                    <TableSubComponentRow
                      key={key}
                      type={key}
                      value={val}
                      label={t(key)}
                      address={value?.withdrawalAddress}
                      wtype= {value?.type}
                    />
                  );
                });
      return formattedRowData;      
  }

  if (_.includes(_.lowerCase(type), 'date')) {
    return moment
      .utc(value)
      .local()
      .format('L HH:mm');
  }

  if (_.includes(_.lowerCase(type), 'url')) {
    return <ExternalLink href={value}>{value}</ExternalLink>;
  }

  if (_.isEqual(type, 'comments')) {
    return <S3Download keyName={value} />;
  }

  return value;
},);