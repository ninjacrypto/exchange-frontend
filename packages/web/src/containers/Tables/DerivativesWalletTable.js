import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withNamespaces } from 'react-i18next';
import { withRouter } from 'react-router-dom';

import { connect } from 'react-redux';
import { TableWrapper } from 'containers/Tables';
import { CurrencyInfo } from 'components/CurrencyInfo';
import {
  Button,
  CheckBox,
  Box,
  Text,
  Modal,
} from 'components/Wrapped';
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
import { getDerivativesPortfolio } from 'redux/actions/portfolio';
import styles from './Table.module.scss';
import { authenticatedInstance } from 'api';

export const BalanceTransfer = withNamespaces()(
  ({ t: translate, currentPortfolios, currentCurrency, portfolios, derivativesPortfolios, getDerivativesPortfolio }) => {
    const t = nestedTranslate(translate, 'derivatives.overview');
    const [mutate] = useMutation(
      data => {
        const { ...restData } = data;

        let formData = {
            currency: selectedCurrency?.value,
            amount: restData.amount,
            direction: selectedDirection?.value
        }
        return exchangeApi.requestTransferBalance({
          ...formData,
        });
      },
      {
        onSuccess: response => {
          if (response.status === 'Success') {
              triggerToast(response.message, 'success', 2500);
              getDerivativesPortfolio();
          }
        },
        onError: response => {
          triggerToast(response.message, 'error', 2500);
        },
      },
    );
    const [selectedCurrency, setSelectedCurrency] = useState();
    const [selectedDirection, setSelectedDirection] = useState();
    const [balLabel, setBalLabel] = useState('');
    const [currecyBalance, setCurrecyBalance] = useState();

    let transferDirections = [
        { value: 'TO_DERV', label: 'Margin Account' },
        { value: 'FROM_DERV', label: 'Spot Account' }
    ]

    useEffect(() => {
      setSelectedCurrency({ value: currentCurrency, label: currentCurrency });
      return () => {};
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
        amount: Yup.number().max(currecyBalance).required(),
      });
    };

    const handleChange = (data, setFieldValue) => {
        setSelectedCurrency(data);
        if (selectedDirection?.value !== 'TO_DERV') {
            derivativesPortfolios.forEach(element => {
                if (element.currency == data.value) {
                    setCurrecyBalance(element.balance);
                    setFieldValue('balance', element.balance);
                }
            });
        } else {
            Object.entries(portfolios).forEach(([currency, singleBalance]) => {
                if (currency == data.value) {
                    setCurrecyBalance(singleBalance.balance);
                    setFieldValue('balance', singleBalance.balance)
                }
            });
        }
    };

    const handleDirection = (value, setFieldValue) => {
        setSelectedDirection(value);
        if (value?.value !== 'TO_DERV') {
            setBalLabel('margin')
            derivativesPortfolios.forEach(element => {
                if (element.currency == selectedCurrency.value) {
                    setCurrecyBalance(element.balance);
                    setFieldValue('balance', element.balance);
                }
            });
        } else {
            setBalLabel('spot')
            Object.entries(portfolios).forEach(([currency, singleBalance]) => {
                if (currency == selectedCurrency.value) {
                    setCurrecyBalance(singleBalance.balance);
                    setFieldValue('balance', singleBalance.balance)
                }
            });
        }
    }

    return (
      <React.Fragment>

        <Formik
        initialValues={{
          balance: '',
          amount: '',
        }}
        validationSchema={validationSchema()}
        onSubmit={values => {
        //   setisWarningShown(true);
        //   setformData(values);
          mutate(values)
        }}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <Text weight={'bold'} margin={{bottom: '6px'}}>{t('currency')}</Text>
            <ReactSelect
              options={walletCurrencies}
              onChange={value => handleChange(value, setFieldValue)}
              value={selectedCurrency}
            />

            <Text weight={'bold'} margin={{bottom: '6px'}}>{t('transferTo')}</Text>
            <ReactSelect
              options={transferDirections}
              onChange={value => handleDirection(value, setFieldValue)}
              value={selectedDirection}
            />

            <FormField name="balance" label={t(`${balLabel}balance`)}>
                <TextField disabled={true} className={styles.walletBalTextBox} />
            </FormField>

            <FormField name="amount" label={t('amount')}>
              <TextField />
            </FormField>

            <Button color="primary" type="submit">
              {translate('buttons.transfer')}
            </Button>
          </Form>
        )}
      </Formik>
      </React.Fragment>
    );
  },
);

const WalletTable = ({
  currencySettings,
  derivativesPortfolios,
  portfolios,
  t: translate,
  extraProps,
  showBalanceToggle = true,
  hideBalances,
  setHideBalances,
  getDerivativesPortfolio,
}) => {
  const [currentPortfolios, setPortfolios] = useState(derivativesPortfolios);
  const [isOpen, setIsOpen] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState();

  useEffect(() => {
    let newPortfolios;
    newPortfolios = derivativesPortfolios;
    setPortfolios(newPortfolios);
  }, [derivativesPortfolios, setPortfolios]);

  const t = nestedTranslate(translate, 'tables.derivativesOverview');
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

  const renderActions = ({ value: currency }) => {
    return (
      <Box pad="none" direction="row" justify="start" gap="small">
        {walletButton({ type: 'transfer', currency })}
      </Box>
    );
  };

  const walletButton = ({ type, currency }) => {
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
            derivativesPortfolios={derivativesPortfolios}
            getDerivativesPortfolio={getDerivativesPortfolio}
          />
        </Modal>
      </React.Fragment>
    );
  };

  const renderBalance = btcType => ({ value, original }) => {
    const { currency } = original;

    return (
      <Box pad="none" align="start" fill={true}>
        <Text>
          {!hideBalances
            ? `${formatBalance(value, currency)} ${currency}`
            : '********'}
        </Text>
      </Box>
    );
  };

  const getDToken = async () => {
    try {
      const { data } = await authenticatedInstance({
        url: '/derivatives/dtoken',
        method: 'POST',
      });

      if (data.status === 'Success') {
        window.open(data.data.redirect_url);
      }
    } catch (e) {}
  }

  return (
    <Fragment>
      {showBalanceToggle && (
        <Box pad="small" direction="row" style={{justifyContent:"space-between"}} gap="small">
          <CheckBox
            checked={hideBalances}
            onChange={() => setHideBalances(!hideBalances)}
            label={t('hideBalances')}
          />
          <Button size="small" onClick={()=>getDToken()}>
            {t('toDerivatives')}
          </Button>
        </Box>
      )}
      <TableWrapper
        data={currentPortfolios}
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
            Header: t('actions'),
            id: 'actions',
            accessor: 'currency',
            Cell: renderActions,
            sortable: false,
          },
        ]}
        defaultSorted={[
          {
            id: 'currency',
          },
        ]}
        showPagination={false}
        minRows={10}
        pageSize={1000}
        // SubComponent={({ original: { currency } }) => renderNote(currency)}
        // expanded={getExpanded()}
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
  userSettings: { hideBalances },
}) => ({
  derivativesPortfolios: portfolio.derivativesPortfolios,
  portfolios: portfolio.portfolios,
  currencySettings,
  enableCryptoFeatures,
  tradingPairsByCurrency,
  hideBalances,
  currencyCode,
});

export default withNamespaces()(
  withRouter(
    connect(mapStateToProps, { setHideLowBalances, setHideBalances, getDerivativesPortfolio })(
      WalletTable,
    ),
  ),
);
