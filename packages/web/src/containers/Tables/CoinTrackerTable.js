import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { withRouter } from 'react-router-dom';

import { getTradingDataByGroup } from 'redux/selectors/markets';
import { TableWrapper } from 'containers/Tables';
import { FiatConverter } from 'containers/FiatConverter';
import { nestedTranslate, formatNumberToPlaces } from 'utils';
import { PrettyPercent, PrettyNumberTZ } from 'components/Helpers';
import { CryptoIcon } from 'components/CryptoIcon';
import { Favorite } from 'containers/Favorite';
import coinTrackerStyles from 'containers/CoinTracker/CoinTracker.module.scss';
import { singleTradingPairSettings } from 'redux/selectors/settings';

class CoinTrackerTable extends React.Component {
  state = {
    displayQuoteCurrency: true,
  };

  componentDidMount() {
    this.setDisplayQuoteCurrency();
  }

  componentDidUpdate(prevProps) {
    const { currentMarket } = this.props;
    if (!_.isEqual(prevProps.currentMarket, currentMarket)) {
      this.setDisplayQuoteCurrency();
    }
  }

  setDisplayQuoteCurrency() {
    const { currentMarket, tradingPairGroupSettings } = this.props;
    this.setState({
      displayQuoteCurrency: _.get(
        tradingPairGroupSettings,
        `${currentMarket}.displayQuoteCurrency`,
        true,
      ),
    });
  }

  renderIcon = ({ value, original: { baseCurrency } }) => {
    return (
      <div className={coinTrackerStyles.coinWrap}>
        {this.state.displayQuoteCurrency && (
          <CryptoIcon
            currency={baseCurrency}
            className={coinTrackerStyles.icon}
          />
        )}
        {this.state.displayQuoteCurrency
          ? value
          : `${_.get(
              this.props.currencySettings,
              `${baseCurrency}.fullName`,
            )} (${baseCurrency})`}
      </div>
    );
  };

  renderPercent({ value }) {
    return <PrettyPercent value={value} />;
  }

  renderPrice = ({ value, original: { baseCurrency, quoteCurrency } }) => {
    const { tickDecimals } = singleTradingPairSettings(
      this.props.tradingPairSettings,
      { baseCurrency, quoteCurrency },
    );

    return (
      <span>
        <PrettyNumberTZ
          number={formatNumberToPlaces(value, tickDecimals, { trim: false })}
        />{' '}
        <FiatConverter
          isFiat={true}
          lastPrice={value}
          market={quoteCurrency}
          color="lowContrast"
        />
      </span>
    );
  };

  renderNumber({ value }) {
    return <PrettyNumberTZ number={formatNumberToPlaces(value)} />;
  }

  renderVolume = ({ value, original: { baseCurrency, quoteCurrency } }) => {
    const { orderValueDecimals } = singleTradingPairSettings(
      this.props.tradingPairSettings,
      { baseCurrency, quoteCurrency },
    );

    return (
      <span>
        <PrettyNumberTZ
          number={formatNumberToPlaces(value, orderValueDecimals)}
        />{' '}
        {quoteCurrency}
      </span>
    );
  };

  renderFavorite({ value }) {
    return <Favorite tradingPair={value} />;
  }

  render() {
    const { tableData, t: translate } = this.props;
    const t = nestedTranslate(translate, 'tables.coinTracker');

    return (
      !!tableData && (
        <TableWrapper
          data={tableData}
          isFilterable={true}
          filterBy={['pair', 'lastPrice', 'priceChange24h']}
          columns={[
            {
              id: 'favorite',
              accessor: ({ baseCurrency, quoteCurrency }) =>
                `${baseCurrency}_${quoteCurrency}`,
              Cell: this.renderFavorite,
              minWidth: 30,
            },
            {
              Header: t('pair'),
              id: 'pair',
              className: 'is-primary',
              accessor: d => {
                return `${d.baseCurrency}/${d.quoteCurrency}`;
              },
              Cell: this.renderIcon,
            },
            {
              Header: t('price'),
              accessor: 'lastPrice',
              Cell: this.renderPrice,
            },
            {
              Header: t('change'),
              accessor: 'priceChange24h',
              Cell: this.renderPercent,
            },
            {
              Header: t('24hHigh'),
              id: 'priceHigh24h',
              accessor: 'priceHigh24h',
              Cell: this.renderPrice,
            },
            {
              Header: t('24hLow'),
              id: 'priceLow24h',
              accessor: 'priceLow24h',
              Cell: this.renderPrice,
            },
            {
              Header: t('volume'),
              accessor: 'volumeBaseCurrency24h',
              Cell: this.renderVolume,
            },
            // {
            //   Header: t('volume'),
            //   id: 'volume24',
            //   accessor: 'volume24h',
            //   Cell: ({ value, original: { baseCurrency } }) =>
            //     `${formatFiat(value)} ${baseCurrency}`,
            // },
          ]}
          getTdProps={(state, rowInfo, { id }) => ({
            className: coinTrackerStyles.tr,
            onClick: (e, original) => {
              if (id !== 'favorite' && rowInfo) {
                this.props.history.push(
                  `/trade/${rowInfo.original.baseCurrency}-${rowInfo.original.quoteCurrency}`,
                );
              }
            },
          })}
          defaultSorted={[
            {
              id: 'volumeBaseCurrency24h',
              desc: true,
            },
          ]}
          // className={cx('-striped', '-highlight', coinTrackerStyles.ReactTable)}
          showPagination={false}
          minRows={tableData.length || 10}
          pageSize={1000}
        />
      )
    );
  }
}

const mapStateToProps = (state, props) => ({
  tableData: getTradingDataByGroup(state, props),
  tradingPairSettings: state.exchangeSettings.settings.tradingPairSettings,
  tradingPairGroupSettings:
    state.exchangeSettings.settings.tradingPairGroupSettings,
  currencySettings: state.exchangeSettings.currencySettings,
});

export default withRouter(
  withNamespaces()(connect(mapStateToProps)(CoinTrackerTable)),
);
