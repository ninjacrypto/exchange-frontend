import React, { Component, Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { TableWrapper } from 'containers/Tables';
import { moment } from 'i18n';
import { Loading } from 'components/Loading';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { CurrencyInfo } from 'components/CurrencyInfo';
import { Tooltip } from 'components/Tooltip';
import { Box, Button, Text } from 'components/Wrapped';
import { FiatConverter } from 'containers/FiatConverter';
import { LowContrast } from 'components/Helpers/PrettyNumberTZ';
import {
  formatCrypto,
  formatNumberToPlaces,
  numberParser,
  formatFiat,
  formatNumber,
} from 'utils/numbers';
import { withRouter } from 'react-router-dom';
import styles from './Table.module.scss';

import _ from 'lodash';

export const P2PWalletTable = withRouter(
  withNamespaces()(
    ({
      p2pWalletBalances,
      t: translate,
      currencyCode,
      currencySettings,
    }) => {
      const t = nestedTranslate(translate, 'tables.p2pWallet');

      const currencies = currencySettings;

      const formatBalance = (value, Currency) => {
        const isFiat = _.startsWith(
          _.get(currencies, `${Currency}.walletType`),
          'Fiat',
        );

        return isFiat
          ? formatNumberToPlaces(value, 2)
          : formatNumberToPlaces(value);
      };

      const renderBalance = ({ value, original }) => {
        const { Currency } = original;
        return (
          <Box pad="none" align="start" fill={true}>
            <Text>{`${formatBalance(value, Currency)} ${Currency}`}</Text>
            <Text>
              <React.Fragment>
                {!_.isEqual(Currency, currencyCode) && (
                  <FiatConverter
                    walletBalance={value}
                    currency={Currency}
                    color="lowContrast"
                  />
                )}
              </React.Fragment>
            </Text>
          </Box>
        );
      };

      return (
        <Fragment>
          {p2pWalletBalances ? (
            <TableWrapper
              data={p2pWalletBalances}
              exportable={['Currency', 'balance']}
              fileName="p2pWallet"
              isFilterable={true}
              filterBy={['Currency']}
              columns={[
                {
                  Header: t('currency'),
                  accessor: 'Currency',
                  Cell: ({ value: currency }) => {
                    return (
                      <div className={styles.coinWrap}>
                        <CurrencyInfo
                          currency={currency}
                          hasFullName={true}
                          hasIcon={true}
                        />
                      </div>
                    );
                  },
                },
                {
                  Header: t('balanceInOrder'),
                  accessor: 'Balance',
                  Cell: renderBalance,
                },
              ]}
              defaultSorted={[
                {
                  id: 'Currency',
                  desc: false,
                },
              ]}
              showPagination={true}
              minRows={3}
              pageSize={10}
              style={{ fontSize: '14px' }}
            />
          ) : (
            <Loading />
          )}
        </Fragment>
      );
    },
  ),
);

const mapStateToProps = ({
  p2p,
  user: { profile },
  exchangeSettings: {
    currencySettings,
    currencyCode,
  },
}) => ({
  p2pWalletBalances: p2p.p2pWalletBalances,
  profile: profile,
  currencyCode,
  currencySettings,
});

export default withNamespaces()(connect(mapStateToProps)(P2PWalletTable));
