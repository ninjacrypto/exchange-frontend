import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withNamespaces } from 'react-i18next';
import { withRouter } from 'react-router-dom';

import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { TableWrapper } from 'containers/Tables';
import { CurrencyInfo } from 'components/CurrencyInfo';
import { FiatConverter } from 'containers/FiatConverter';
import {
  Button,
  CheckBox,
  Box,
  Menu,
  Paragraph,
  Text,
} from 'components/Wrapped';
import { formatNumberToPlaces, nestedTranslate } from 'utils';
import { LowContrast } from 'components/Helpers/PrettyNumberTZ';
import {
  setHideLowBalances,
  setHideBalances,
} from 'redux/actions/userSettings';

import styles from 'pages/Wallet/Wallet.module.scss';

const WalletTable = ({
  currencySettings,
  portfolios,
  t: translate,
  extraProps,
  tradingPairsByCurrency,
  history,
  enableCryptoFeatures,
  showBalanceToggle = true,
  hideLowBalances,
  hideBalances,
  setHideLowBalances,
  setHideBalances,
  currencyCode,
}) => {
  // const [hideLowBalance, setHideLowBalance] = useState(false);
  // const [hideBalances, setHideBalances] = useState(false);
  const [currentPortfolios, setPortfolios] = useState(
    Object.values(portfolios),
  );
  useEffect(() => {
    let newPortfolios;
    if (hideLowBalances) {
      newPortfolios = Object.values(portfolios)
        .filter(({ btcValue }) => btcValue > 0e-4)
        .map(singleValue => singleValue);
    } else {
      newPortfolios = Object.values(portfolios);
    }
    setPortfolios(newPortfolios);
  }, [portfolios, hideLowBalances, setPortfolios]);

  const t = nestedTranslate(translate, 'tables.walletOverview');
  const currencies = currencySettings;

  const formatBalance = (value, currency) => {
    const isFiat = _.startsWith(
      _.get(currencies, `${currency}.walletType`),
      'Fiat',
    );

    return isFiat
      ? formatNumberToPlaces(value, 2)
      : formatNumberToPlaces(value);
  };

  const renderBtcValue = value =>
    value ? (
      !hideBalances ? (
        <LowContrast>{`${formatBalance(value, 'BTC')} BTC`}</LowContrast>
      ) : (
        '********'
      )
    ) : null;

  const renderBalance = btcType => ({ value, original }) => {
    const { currency } = original;
    const btcValue = original[btcType];

    return (
      <Box pad="none" align="start" fill={true}>
        <Text>
          {!hideBalances
            ? `${formatBalance(value, currency)} ${currency}`
            : '********'}
        </Text>
        <Text>
          {!hideBalances ? (
            <React.Fragment>
              {!_.isEqual(currency, currencyCode) && (
                <FiatConverter
                  walletBalance={value}
                  currency={currency}
                  color="lowContrast"
                />
              )}
            </React.Fragment>
          ) : (
            '********'
          )}
        </Text>
        {!_.isEqual(currency, 'BTC') && (
          <React.Fragment>
            {enableCryptoFeatures && <Text>{renderBtcValue(btcValue)}</Text>}
          </React.Fragment>
        )}
      </Box>
    );
  };

  const walletButton = ({ type, currency }) => {
    const isEnabled = _.get(currencies, `${currency}.${type}Enabled`);
    // const extraProps =
    //   type === 'deposit'
    //     ? { color: 'accent-1', margin: { bottom: 'small' } }
    //     : {};

    if (isEnabled) {
      return (
        <Button size="small" {...extraProps} plain>
          <Link to={`/wallet/${type}s/${currency}`}>
            {translate(`buttons.${type}`)}
          </Link>
        </Button>
      );
    }

    return (
      <Button size="small" disabled={true} plain {...extraProps}>
        {translate(`buttons.${type}`)}
      </Button>
    );
  };

  const renderEmptyCell = () => (
    <Box fill={true} justify="center" align="center" pad="small">
      <Paragraph>-</Paragraph>
    </Box>
  );

  const getExpanded = () => {
    let expanded = {};

    Object.values(currentPortfolios).forEach((__, index) => {
      expanded[index] = true;
    });
    return expanded;
  };

  const renderNote = currency => {
    const note = t(`currencyNote.${currency}`, '');
    if (!note) {
      return null;
    }

    return (
      <Box pad="small" fill={false}>
        <Box pad="small" background="background-3" flex={false}>
          <Paragraph>{note}</Paragraph>
        </Box>
      </Box>
    );
  };

  const renderActions = ({ value: currency }) => {
    const tradingPairs = tradingPairsByCurrency[currency] || [];

    const menuItems = tradingPairs.map(singleTradingPair => ({
      label: `${singleTradingPair.baseCurrency}/${singleTradingPair.quoteCurrency}`,
      onClick: () =>
        history.push(
          `/trade/${singleTradingPair.baseCurrency}-${singleTradingPair.quoteCurrency}`,
        ),
    }));

    return _.get(currencySettings, `${currency}.walletType`) !==
      'SecurityToken' ? (
      <Box pad="none" direction="row" justify="start" gap="small">
        {walletButton({ type: 'deposit', currency })}
        {walletButton({ type: 'withdrawal', currency })}
        {menuItems.length >= 1 && (
          <Menu
            label={
              <Text color="primary" size="small" hoverColor="text">
                {t('trade')}
              </Text>
            }
            // color="primary"
            items={menuItems}
            size="small"
          />
        )}
      </Box>
    ) : (
      renderEmptyCell()
    );
  };

  return (
    <Fragment>
      {showBalanceToggle && (
        <Box pad="small" direction="row" gap="small">
          <CheckBox
            checked={hideBalances}
            onChange={() => setHideBalances(!hideBalances)}
            label={t('hideBalances')}
          />
          <CheckBox
            checked={hideLowBalances}
            onChange={() => setHideLowBalances(!hideLowBalances)}
            label={t('lowBalances')}
          />
        </Box>
      )}
      <TableWrapper
        data={Object.values(currentPortfolios)}
        exportable={['currency', 'balance', 'balance_in_trade', 'total']}
        fileName="portfolio"
        isFilterable={true}
        filterBy={['currency']}
        columns={[
          {
            expander: true,
            show: false,
          },
          {
            Header: t('currency'),
            accessor: 'currency',
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
            Header: t('balance'),
            accessor: 'balance',
            Cell: renderBalance('balanceBtcValue'),
          },
          {
            Header: t('inOrders'),
            accessor: 'balance_in_trade',
            Cell: renderBalance('balanceInTradeBtcValue'),
          },
          {
            Header: t('total'),
            accessor: 'totalBalance',
            Cell: renderBalance('btcValue'),
          },
          {
            show: false,
            accessor: 'btcValue',
          },
          {
            Header: t('actions'),
            id: 'actions',
            accessor: 'currency',
            Cell: renderActions,
            sortable: false,
          },
          // {
          //   Header: t('trade'),
          //   id: 'trade',
          //   accessor: 'currency',
          //   Cell: ({ value: currency }) => {
          //     const tradingPairs = tradingPairsByCurrency[currency];
          //     if (!tradingPairs) {
          //       return renderEmptyCell();
          //     }
          //     const menuItems = tradingPairs.map((singleTradingPair) => ({
          //       label: `${singleTradingPair.baseCurrency}/${singleTradingPair.quoteCurrency}`,
          //       onClick: () =>
          //         history.push(
          //           `/trade/${singleTradingPair.baseCurrency}-${singleTradingPair.quoteCurrency}`,
          //         ),
          //     }));

          //     return (
          //       // <Box fill={true} justify="center" align="center" pad="small">
          //         <Menu label={t('trade')} items={menuItems} plain size="small" />
          //       // </Box>
          //     );
          //   },
          // },
        ]}
        defaultSorted={[
          {
            id: 'btcValue',
            desc: true,
          },
          {
            id: 'currency',
          },
        ]}
        showPagination={false}
        minRows={Object.values(portfolios).length || 10}
        pageSize={1000}
        SubComponent={({ original: { currency } }) => renderNote(currency)}
        expanded={getExpanded()}
        {...extraProps}
      />
    </Fragment>
  );
};

WalletTable.propTypes = {
  hideActions: PropTypes.bool.isRequired,
};

WalletTable.defaultProps = {
  hideActions: false,
};

const mapStateToProps = ({
  portfolio,
  exchangeSettings: {
    currencySettings,
    settings: { enableCryptoFeatures },
    currencyCode,
  },
  markets: { tradingPairsByCurrency },
  userSettings: { hideBalances, hideLowBalances },
}) => ({
  portfolios: portfolio.portfolios,
  currencySettings,
  enableCryptoFeatures,
  tradingPairsByCurrency,
  hideBalances,
  hideLowBalances,
  currencyCode,
});

export default withNamespaces()(
  withRouter(
    connect(mapStateToProps, { setHideLowBalances, setHideBalances })(
      WalletTable,
    ),
  ),
);
