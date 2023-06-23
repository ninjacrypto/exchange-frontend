import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { PrettyPercent, PrettyNumberTZ } from 'components/Helpers';
import { CurrencyInfo } from 'components/CurrencyInfo';
import AnalyticsItem from './AnalyticsItem';

import styles from './Analytics.module.scss';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { formatNumberToPlaces } from 'utils/numbers';
import { getSingleTradingPairSettings } from 'redux/selectors/settings';

export class Analytics extends Component {
  getCoinInfo() {
    const { tradingPair, t: translate } = this.props;
    const {
      markets: { prices },
      tradingPairSettings: { tickDecimals, orderValueDecimals },
    } = this.props;
    let coinData;
    const t = nestedTranslate(translate, 'navbar.analyticsContainer');

    if (!_.isEmpty(tradingPair)) {
      coinData =
        prices[tradingPair.quoteCurrency] &&
        prices[tradingPair.quoteCurrency][tradingPair.baseCurrency];
    }

    const coinInfo = [
      {
        name: t('coinInfo'),
        item: <CurrencyInfo currency={_.get(coinData, 'baseCurrency', '-')} />,
      },
      {
        name: t('lastPrice'),
        item: coinData && (
          <React.Fragment>
            <PrettyNumberTZ
              number={formatNumberToPlaces(coinData.lastPrice, tickDecimals)}
            />{' '}
            {coinData.quoteCurrency}
          </React.Fragment>
        ),
      },
      {
        name: t('change'),
        item: coinData && <PrettyPercent value={coinData.priceChange24h} />,
      },
      {
        name: t('priceHigh24h'),
        item: coinData && (
          <PrettyNumberTZ
            number={formatNumberToPlaces(coinData.priceHigh24h, tickDecimals)}
          />
        ),
      },
      {
        name: t('priceLow24h'),
        item: coinData && (
          <PrettyNumberTZ
            number={formatNumberToPlaces(coinData.priceLow24h, tickDecimals)}
          />
        ),
      },
      {
        name: t('volume'),
        item: coinData && (
          <PrettyNumberTZ
            number={formatNumberToPlaces(
              coinData.volumeBaseCurrency24h,
              orderValueDecimals,
            )}
          />
        ),
      },
    ];

    return coinInfo;
  }

  renderAnalytics() {
    return this.getCoinInfo().map((val, index) => (
      <AnalyticsItem key={index} data={val} />
    ));
  }

  render() {
    const { prices } = this.props.markets;
    const { tradingPair, mgokx, markets } = this.props;

    if (!_.isEmpty(mgokx) && !_.isEmpty(tradingPair) && !_.isEmpty(markets)) {
      if (mgokx.enabled) {
        if (
          !_.isEmpty(markets.prices) &&
          !_.isEmpty(tradingPair.quoteCurrency) &&
          !_.isEmpty(tradingPair.baseCurrency)
        ) {
          if (
            markets.prices[tradingPair.quoteCurrency][tradingPair.baseCurrency]
              .isNDWallet
          ) {
            return <></>;
          }
        }
      }
    }

    return (
      <Fragment>
        <div className={styles.analyticsContainer}>
          {!_.isEmpty(prices) && this.renderAnalytics()}
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  const {
    markets,
    exchange,
    exchangeSettings: { settings },
  } = state;
  return {
    markets: markets,
    tradingPair: exchange.tradingPair,
    tradingPairs: markets.tradingPairs,
    tradingPairSettings: getSingleTradingPairSettings(state, {
      tradingPair: state.exchange.tradingPair,
    }),
    mgokx: settings.mgokx,
  };
};

const AnalyticsContainer = withRouter(connect(mapStateToProps)(Analytics));

export default withNamespaces()(AnalyticsContainer);
