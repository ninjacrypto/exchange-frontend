import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withNamespaces } from 'react-i18next';
import { withRouter } from 'react-router-dom';

import { connect } from 'react-redux';
import { TableWrapper } from 'containers/Tables';
import { CurrencyInfo } from 'components/CurrencyInfo';
import { Button, CheckBox, Box, Text, Modal } from 'components/Wrapped';
import { formatNumberToPlaces, nestedTranslate } from 'utils';
import {
  setHideLowBalances,
  setHideBalances,
} from 'redux/actions/userSettings';
import { useMutation } from 'react-query';
import { exchangeApi } from 'api';
import { Formik } from 'formik';
import { triggerToast } from 'redux/actions/ui';
import * as Yup from 'yup';
import { Form, FormField, TextField } from 'components/Form';
import { ReactSelect } from 'components/Form/SelectField';
import { getNDWalletBalance } from 'redux/actions/NDWalletData';
import styles from './Table.module.scss';
import { Link } from 'react-router-dom';
import { LowContrast } from 'components/Helpers/PrettyNumberTZ';
import { FiatConverter } from 'containers/FiatConverter';

export const BalanceTransfer = withNamespaces()(
  ({
    t: translate,
    currentPortfolios,
    currentCurrency,
    portfolios,
    walletBalances,
    getNDWalletBalance,
    handleSuccess,
  }) => {
    const t = nestedTranslate(translate, 'NDWallet.overview');
    const [isTransferProcessing, setIsTransferProcessing] = useState(false);
    const [mutate] = useMutation(
      data => {
        const { ...restData } = data;

        let formData = {
          currency: selectedCurrency?.value,
          amount: restData.amount,
          direction: selectedDirection?.value,
        };
        setIsTransferProcessing(true);
        return exchangeApi.requestTransferBalanceOKX({
          ...formData,
        });
      },
      {
        onSuccess: response => {
          if (response.status === 'Success') {
            triggerToast(response.message, 'success', 2500);
            getNDWalletBalance();
            setIsTransferProcessing(false);
            handleSuccess();
          } else {
            triggerToast(response.message, 'error', 2500);
            setIsTransferProcessing(false);
            handleSuccess();
          }
        },
        onError: response => {
          triggerToast(response.message, 'error', 2500);
          setIsTransferProcessing(false);
          handleSuccess();
        },
      },
    );
    const [selectedCurrency, setSelectedCurrency] = useState();
    const [selectedDirection, setSelectedDirection] = useState({});
    const [balLabel, setBalLabel] = useState('');
    const [currecyBalance, setCurrecyBalance] = useState();

    let transferDirections = [
      { value: 'EXCHANGE_TO_OKX', label: t('ndWallet') },
      { value: 'OKX_TO_EXCHANGE', label: t('mainWallet') },
    ];

    useEffect(() => {
      setSelectedCurrency({ value: currentCurrency, label: currentCurrency });
      return () => { };
    }, []);

    let walletCurrencies = [];
    if (currentPortfolios !== undefined) {
      currentPortfolios.forEach(element => {
        walletCurrencies.unshift({
          value: element.currency,
          label: element.currency,
        });
      });
    }

    const validationSchema = () => {
      return Yup.object().shape({
        amount: Yup.number()
          .max(currecyBalance)
          .required(),
      });
    };

    const handleChange = (data, setFieldValue) => {
      setSelectedCurrency(data);
      if (_.isEmpty(selectedDirection.value)) {
        return;
      }
      if (selectedDirection?.value !== 'EXCHANGE_TO_OKX') {
        walletBalances.forEach(element => {
          if (element.currency == data.value) {
            setCurrecyBalance(element.trading_balance);
            setFieldValue('balance', element.trading_balance);
          }
        });
      } else {
        Object.entries(portfolios).forEach(([currency, singleBalance]) => {
          if (currency == data.value) {
            setCurrecyBalance(singleBalance.balance);
            setFieldValue('balance', singleBalance.balance);
          }
        });
      }
    };

    const handleDirection = (value, setFieldValue) => {
      setSelectedDirection(value);
      if (value?.value !== 'EXCHANGE_TO_OKX') {
        setBalLabel('ND Wallet');
        walletBalances.forEach(element => {
          if (element.currency == selectedCurrency.value) {
            setCurrecyBalance(element.trading_balance);
            setFieldValue('balance', element.trading_balance);
          }
        });
      } else {
        setBalLabel('Main Wallet');
        Object.entries(portfolios).forEach(([currency, singleBalance]) => {
          if (currency == selectedCurrency.value) {
            setCurrecyBalance(singleBalance.balance);
            setFieldValue('balance', singleBalance.balance);
          }
        });
      }
    };

    return (
      <React.Fragment>
        <Formik
          initialValues={{
            balance: '',
            amount: '',
          }}
          validationSchema={validationSchema()}
          onSubmit={values => {
            mutate(values);
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <Text weight={'bold'} margin={{ bottom: '6px' }}>
                {t('currency')}
              </Text>
              <ReactSelect
                options={walletCurrencies}
                onChange={value => handleChange(value, setFieldValue)}
                value={selectedCurrency}
              />

              <Text weight={'bold'} margin={{ bottom: '6px' }}>
                {t('transferTo')}
              </Text>
              <ReactSelect
                options={transferDirections}
                onChange={value => handleDirection(value, setFieldValue)}
                value={selectedDirection}
              />

              <FormField name="balance" label={t(`${balLabel}balance`)}>
                <TextField
                  disabled={true}
                  className={styles.walletBalTextBox}
                />
              </FormField>

              <FormField name="amount" label={t('amount')}>
                <TextField />
              </FormField>

              <Button
                color="primary"
                type="submit"
                disabled={isTransferProcessing}
              >
                {translate('buttons.transfer')}
              </Button>
            </Form>
          )}
        </Formik>
      </React.Fragment>
    );
  },
);

export const BalanceTransferModal = withNamespaces()(
  ({
    currency,
    currentPortfolios,
    portfolios,
    walletBalances,
    t: translate,
    type,
    getNDWalletBalance,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentCurrency, setCurrentCurrency] = useState();
    const toggleModal = () => {
      setIsOpen(!isOpen);
      setCurrentCurrency(currency);
    };
    return (
      <React.Fragment>
        <Button size="small" onClick={toggleModal}>
          {translate(`buttons.${type}`)}
        </Button>
        <Modal show={isOpen} toggleModal={toggleModal}>
          <BalanceTransfer
            handleSuccess={toggleModal}
            currentPortfolios={currentPortfolios}
            currentCurrency={currentCurrency}
            portfolios={portfolios}
            walletBalances={walletBalances}
            getNDWalletBalance={getNDWalletBalance}
          />
        </Modal>
      </React.Fragment>
    );
  },
);

export const MoveFunds = withNamespaces()(
  ({
    t: translate,
    currentPortfolios,
    currentCurrency,
    portfolios,
    walletBalances,
    getNDWalletBalance,
    handleSuccess,
  }) => {
    const t = nestedTranslate(translate, 'NDWallet.overview');
    const [isTransferProcessing, setIsTransferProcessing] = useState(false);
    const [mutate] = useMutation(
      data => {
        const { ...restData } = data;

        let formData = {
          currency: selectedCurrency?.value,
          amount: restData.amount,
          direction: selectedDirection?.value,
        };
        setIsTransferProcessing(true);
        return exchangeApi.requestMoveFunds({
          ...formData,
        });
      },
      {
        onSuccess: response => {
          if (response.status === 'Success') {
            triggerToast(response.message, 'success', 2500);
            getNDWalletBalance();
            setIsTransferProcessing(false);
            handleSuccess();
          } else {
            triggerToast(response.message, 'error', 2500);
            setIsTransferProcessing(false);
            handleSuccess();
          }
        },
        onError: response => {
          triggerToast(response.message, 'error', 2500);
          setIsTransferProcessing(false);
          handleSuccess();
        },
      },
    );
    const [selectedCurrency, setSelectedCurrency] = useState();
    const [selectedDirection, setSelectedDirection] = useState({});
    const [balLabel, setBalLabel] = useState('');
    const [currecyBalance, setCurrecyBalance] = useState();

    let transferDirections = [
      { value: 'FUNDING_TO_TRADING', label: t('trading') },
      { value: 'TRADING_TO_FUNDING', label: t('funding') },
    ];

    useEffect(() => {
      setSelectedCurrency({ value: currentCurrency, label: currentCurrency });
      return () => { };
    }, []);

    let walletCurrencies = [];
    if (currentPortfolios !== undefined) {
      currentPortfolios.forEach(element => {
        walletCurrencies.unshift({
          value: element.currency,
          label: element.currency,
        });
      });
    }

    const validationSchema = () => {
      return Yup.object().shape({
        amount: Yup.number()
          .max(currecyBalance)
          .required(),
      });
    };

    const handleChange = (data, setFieldValue) => {
      setSelectedCurrency(data);
      if (_.isEmpty(selectedDirection.value)) {
        return;
      }
      if (selectedDirection?.value !== 'FUNDING_TO_TRADING') {
        walletBalances.forEach(element => {
          if (element.currency == data.value) {
            setCurrecyBalance(element.trading_balance);
            setFieldValue('balance', element.trading_balance);
          }
        });
      } else {
        walletBalances.forEach(element => {
          if (element.currency == data.value) {
            setCurrecyBalance(element.funding_balance);
            setFieldValue('balance', element.funding_balance);
          }
        });
      }
    };

    const handleDirection = (value, setFieldValue) => {
      setSelectedDirection(value);
      if (value?.value !== 'FUNDING_TO_TRADING') {
        setBalLabel('Trading');
        walletBalances.forEach(element => {
          if (element.currency == selectedCurrency.value) {
            setCurrecyBalance(element.trading_balance);
            setFieldValue('balance', element.trading_balance);
          }
        });
      } else {
        setBalLabel('Funding');
        walletBalances.forEach(element => {
          if (element.currency == selectedCurrency.value) {
            setCurrecyBalance(element.funding_balance);
            setFieldValue('balance', element.funding_balance);
          }
        });
      }
    };

    return (
      <React.Fragment>
        <Formik
          initialValues={{
            balance: '',
            amount: '',
          }}
          validationSchema={validationSchema()}
          onSubmit={values => {
            mutate(values);
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <Text weight={'bold'} margin={{ bottom: '6px' }}>
                {t('currency')}
              </Text>
              <ReactSelect
                options={walletCurrencies}
                onChange={value => handleChange(value, setFieldValue)}
                value={selectedCurrency}
              />

              <Text weight={'bold'} margin={{ bottom: '6px' }}>
                {t('moveTo')}
              </Text>
              <ReactSelect
                options={transferDirections}
                onChange={value => handleDirection(value, setFieldValue)}
                value={selectedDirection}
              />

              <FormField name="balance" label={t(`${balLabel}balance`)}>
                <TextField
                  disabled={true}
                  className={styles.walletBalTextBox}
                />
              </FormField>

              <FormField name="amount" label={t('amount')}>
                <TextField />
              </FormField>

              <Button
                color="primary"
                type="submit"
                disabled={isTransferProcessing}
              >
                {translate('buttons.confirm')}
              </Button>
            </Form>
          )}
        </Formik>
      </React.Fragment>
    );
  },
);

export const MoveFundsModal = withNamespaces()(
  ({
    currency,
    currentPortfolios,
    portfolios,
    walletBalances,
    t: translate,
    type,
    getNDWalletBalance,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentCurrency, setCurrentCurrency] = useState();
    const toggleModal = () => {
      setIsOpen(!isOpen);
      setCurrentCurrency(currency);
    };
    return (
      <React.Fragment>
        <Button size="small" onClick={toggleModal}>
          {translate(`buttons.${type}`)}
        </Button>
        <Modal show={isOpen} toggleModal={toggleModal}>
          <MoveFunds
            handleSuccess={toggleModal}
            currentPortfolios={currentPortfolios}
            currentCurrency={currentCurrency}
            portfolios={portfolios}
            walletBalances={walletBalances}
            getNDWalletBalance={getNDWalletBalance}
          />
        </Modal>
      </React.Fragment>
    );
  },
);

const NDWalletTable = ({
  walletBalances,
  currencySettings,
  portfolios,
  t: translate,
  extraProps,
  showBalanceToggle = true,
  hideLowBalances,
  hideBalances,
  setHideBalances,
  setHideLowBalances,
  getNDWalletBalance,
  mgokx,
  currencyCode,
  enableCryptoFeatures
}) => {
  const [currentPortfolios, setPortfolios] = useState(walletBalances);
  const { funds_transfer } = mgokx;
  useEffect(() => {
    let newPortfolios;
    if (hideLowBalances) {
      newPortfolios = walletBalances
        .filter(({ trading_balance }) => trading_balance > 0e-4)
        .map(singleValue => singleValue);
    } else {
      newPortfolios = walletBalances;
    }
    setPortfolios(newPortfolios);
  }, [walletBalances, hideLowBalances, setPortfolios]);

  const t = nestedTranslate(translate, 'tables.NDWalletOverview');
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

  const renderActions = ({ value: currency }) => {
    return (
      <Box pad="none" direction="row" justify="start" gap="small">

        {funds_transfer && (
          <React.Fragment>
            <BalanceTransferModal
              currency={currency}
              currentPortfolios={currentPortfolios}
              portfolios={portfolios}
              walletBalances={walletBalances}
              type='transfer'
              getNDWalletBalance={getNDWalletBalance}
            />
          </React.Fragment>
        )}

        <React.Fragment>
          <MoveFundsModal
            currency={currency}
            currentPortfolios={currentPortfolios}
            portfolios={portfolios}
            walletBalances={walletBalances}
            type='moveFunds'
            getNDWalletBalance={getNDWalletBalance}
          />
        </React.Fragment>
      </Box>
    );
  };

  const walletButton = ({ type, currency }) => {
    const isEnabled = _.get(currencies, `${currency}.${type}Enabled`);

    if (isEnabled) {
      return (
        <Button size="small" {...extraProps} plain>
          <Link to={`/NDWallet/${type}s/${currency}`}>
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

  return (
    <Fragment>
      {showBalanceToggle && (
        <Box
          pad="small"
          direction="row"
          gap="small"
        >
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
        data={currentPortfolios}
        fileName="ND-Wallet-balances"
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
            Header: t('tradingBalance'),
            accessor: 'trading_balance',
            Cell: renderBalance('trading_balanceBtcValue'),
          },
          {
            Header: t('tradingFrozenBalance'),
            accessor: 'trading_frozen_balance',
            Cell: renderBalance('trading_frozen_balanceBtcValue'),
          },
          {
            Header: t('fundingBalance'),
            accessor: 'funding_balance',
            Cell: renderBalance('funding_balanceBtcValue'),
          },
          {
            Header: t('fundingFrozenBalance'),
            accessor: 'funding_frozen_balance',
            Cell: renderBalance('funding_frozen_balanceBtcValue'),
          },
          {
            Header: t('actions'),
            id: 'actions',
            accessor: 'currency',
            Cell: renderActions,
            sortable: false,
          },
        ]}
        defaultSorted={[
          {
            id: 'trading_balance',
            desc: true,
          },
          {
            id: 'currency',
          },
        ]}
        showPagination={false}
        minRows={10}
        pageSize={1000}
        {...extraProps}
      />
    </Fragment>
  );
};

NDWalletTable.propTypes = {
  hideActions: PropTypes.bool.isRequired,
};

NDWalletTable.defaultProps = {
  hideActions: false,
};

const mapStateToProps = ({
  portfolio,
  NDWalletData,
  exchangeSettings: {
    currencySettings,
    settings: { enableCryptoFeatures, mgokx },
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
  walletBalances: NDWalletData.balance,
  mgokx
});

export default withNamespaces()(
  withRouter(
    connect(mapStateToProps, {
      setHideLowBalances,
      setHideBalances,
      getNDWalletBalance,
    })(NDWalletTable),
  ),
);
