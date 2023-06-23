import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Formik } from 'formik';
import { withNamespaces } from 'react-i18next';
import * as Yup from 'yup';
import cx from 'classnames';

import instance, { authenticatedInstance } from 'api';
import { CryptoIcon } from 'components/CryptoIcon';
import { PageWrap } from 'components/Containers';
import { nestedTranslate } from 'utils/strings';
import InstaTradeForm from './InstaTradeForm';
import { triggerModalOpen } from 'redux/actions/ui';
import styles from './InstaTrade.module.scss';
import { getPortfolioData } from 'redux/actions/portfolio';
import {
  Accordion,
  AccordionPanel,
  Box,
  Heading,
  Columns,
  Column,
} from 'components/Wrapped';
import { formatCrypto } from 'utils';
import { InstaTradeHistoryTable } from 'containers/Tables';
import { BoxHeading } from 'components/Helpers';

class InstantBuy extends React.Component {
  state = {
    currencies: [],
    tradingPairs: {},
    currentTradingPairs: [],
    selectedCurrency: '',
    selectedTradingPair: {},
    isSubmitting: false,
  };

  componentDidMount() {
    const { isAuthenticated } = this.props;

    this.getPairs();
    if (isAuthenticated) {
      this.props.getPortfolioData();
    }
  }

  getPairs = async () => {
    try {
      const { data } = await instance({
        url: '/api/get_insta_pairs',
        method: 'GET',
      });

      if (data.status === 'Success') {
        this.parsePairs(data.data);
      }
    } catch (e) {}
  };

  requestTrade = async formValues => {
    const { baseCurrency, quoteCurrency } = this.state.selectedTradingPair;
    const { triggerModalOpen } = this.props;

    const values = {
      ...formValues,
      baseCurrency,
      quoteCurrency,
    };

    try {
      const { data } = await authenticatedInstance({
        url: '/api/request_insta_trade',
        method: 'POST',
        data: values,
      });

      this.setState({ isSubmitting: false });

      if (data.status === 'Success') {
        triggerModalOpen('instaTradeSuccess');
      } else {
        triggerModalOpen(data.message);
      }
    } catch (e) {}
  };

  parsePairs(pairs) {
    let tradingPairs = {};

    pairs.forEach(singlePair => {
      const { quoteCurrency } = singlePair;
      if (!tradingPairs[quoteCurrency]) {
        tradingPairs[quoteCurrency] = [];
      }

      tradingPairs[quoteCurrency].push(singlePair);
    });

    this.setState({
      currencies: Object.keys(tradingPairs),
      tradingPairs,
    });
  }

  setSelectedCurrency = currency => () => {
    if (currency !== this.state.selectedCurrency) {
      this.setState(
        {
          selectedCurrency: currency,
          currentTradingPairs: this.state.tradingPairs[currency],
          selectedTradingPair: {},
        },
        () => {
          if (this.state.currentTradingPairs.length === 1) {
            this.setSelectedTradingPair(this.state.currentTradingPairs[0])();
          }
        },
      );
    }
  };

  setSelectedTradingPair = tradingPair => () => {
    this.setState({
      selectedTradingPair: tradingPair,
    });
  };

  renderCurrencyCard({ currency, tradingPair }) {
    const { currencySettings } = this.props;
    let isActive = false;

    if (_.isEqual(this.state.selectedTradingPair, tradingPair)) {
      isActive = true;
    } else if (
      !tradingPair &&
      _.isEqual(this.state.selectedCurrency, currency)
    ) {
      isActive = true;
    }

    return (
      <Column width={[1, 1 / 3]} key={currency}>
        <Box
          background="background-4"
          justify="center"
          align="center"
          alignContent="center"
          onClick={
            tradingPair
              ? this.setSelectedTradingPair(tradingPair)
              : this.setSelectedCurrency(currency)
          }
          className={cx(styles.currencyCard, {
            [`${styles.active}`]: isActive,
          })}
          textAlignment="centered"
        >
          <CryptoIcon currency={currency} className="is-marginless" />
          <p>{`${currencySettings[currency].fullName} (${currency})`}</p>
          {tradingPair && (
            <React.Fragment>
              <p className="is-marginless">1 {currency}</p>
              <p className="is-marginless">=</p>
              <p className="is-marginless">{`${formatCrypto(
                tradingPair.rate,
              )} ${tradingPair.quoteCurrency}`}</p>
            </React.Fragment>
          )}
        </Box>
      </Column>
    );
  }

  validationSchema = () => {
    const { gAuthEnabled } = this.props;
    const { selectedTradingPair } = this.state;
    const additionalValidations = gAuthEnabled
      ? {
          gauth: Yup.string()
            .required()
            .length(6),
        }
      : {};

    return Yup.object().shape({
      baseAmount: Yup.number()
        .required()
        .min(selectedTradingPair.minLimit)
        .max(selectedTradingPair.maxLimit),
      ...additionalValidations,
    });
  };

  render() {
    const {
      currencies,
      currentTradingPairs,
      selectedTradingPair,
      isSubmitting,
    } = this.state;
    const { t: translate, isAuthenticated } = this.props;

    const t = nestedTranslate(translate, 'instaTrade');

    return (
      <PageWrap>
        <BoxHeading>{t('title')}</BoxHeading>
        <Box
          background="background-3"
          pad="medium"
          margin={{ bottom: 'small' }}
          {...BoxHeading.boxProps}
        >
          <Columns>
            <Column width={[1, 1, 1 / 2]}>
              <Heading level={2}>{t('purchaseCurrency')}</Heading>
              <Columns>
                {currencies.map(currency =>
                  this.renderCurrencyCard({ currency }),
                )}
              </Columns>
              {!_.isEmpty(currentTradingPairs) && (
                <Heading level={2}>{t('paymentMethod')}</Heading>
              )}
              <Columns>
                {currentTradingPairs.map(singleTradingPair =>
                  this.renderCurrencyCard({
                    currency: singleTradingPair.baseCurrency,
                    tradingPair: singleTradingPair,
                  }),
                )}
              </Columns>
            </Column>
            <Column width={[1, 1, 1 / 2]}>
              <Box background="background-4" pad="medium">
                {!_.isEmpty(selectedTradingPair) ? (
                  <Formik
                    initialValues={{
                      baseAmount: '',
                      gauth: '',
                    }}
                    onSubmit={values => {
                      this.setState({ isSubmitting: true });
                      this.requestTrade(values);
                    }}
                    validationSchema={this.validationSchema}
                  >
                    {props => (
                      <InstaTradeForm
                        formProps={props}
                        tradingPair={selectedTradingPair}
                        isSubmitting={isSubmitting}
                      />
                    )}
                  </Formik>
                ) : (
                  <Heading level={2}>{t('selectPair')}</Heading>
                )}
              </Box>
            </Column>
          </Columns>
        </Box>
        {isAuthenticated && (
          <Box background="background-3">
            <Accordion>
              <AccordionPanel label={t('tradeHistory')}>
                <InstaTradeHistoryTable />
              </AccordionPanel>
            </Accordion>
          </Box>
        )}
      </PageWrap>
    );
  }
}

const mapStateToProps = ({
  exchangeSettings: { currencySettings },
  auth: { isAuthenticated, gAuthEnabled },
}) => ({
  currencySettings,
  isAuthenticated,
});

export default withNamespaces()(
  connect(mapStateToProps, { triggerModalOpen, getPortfolioData })(InstantBuy),
);
