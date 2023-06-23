import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Star } from 'grommet-icons';
import styled from 'styled-components';

import styles from './CoinTracker.module.scss';
import { CryptoIcon } from 'components/CryptoIcon';
import { Loading } from 'components/Loading';
import { CoinTrackerTable } from 'containers/Tables';
import { Box, Text } from 'components/Wrapped';

const StyledStar = styled(Star)`
  height: 20px;
  width: 20px;
  margin-left: 5px;
`;

class CoinTrackerContainer extends Component {
  state = {
    currentMarket: null,
    isLoading: true,
    selectedGroupName: '',
    currentPair:''

  };

  static propTypes = {
    vhLoader: PropTypes.bool,
  };

  currentMarket = '';

  componentDidMount() {
    const { marketsByGroup, currentBaseCurrency, currentQuoteCurrency} = this.props
    let values = [];
    Object.entries(marketsByGroup).forEach(([key, value]) => {
      values = value;
      values.forEach(element => {
        if (element.includes('_')) {
          if (element ===`${currentBaseCurrency}_${currentQuoteCurrency}`) {
            this.currentMarket = key;
          }
        } else if (element === currentQuoteCurrency) {
          this.currentMarket = key;
        }
      });
    })

    if (this.props.exchangeMarkets) {
      if (this.currentMarket !== null && this.currentMarket !== ""){
        this.setState({
          currentMarket: this.currentMarket,
        });
      } else{
      this.setState({
        currentMarket: this.props.exchangeMarkets[1],
      });
    }
    }
  }

  handleActiveMarket(currentMarket) {
    this.setState({selectedGroupName: currentMarket});
    this.setState({
      currentMarket,
    });
  }

  renderIcon({ value, original: { baseCurrency } }) {
    return (
      <div className={styles.coinWrap}>
        <CryptoIcon currency={baseCurrency} className={styles.icon} />
        {value}
      </div>
    );
  }

  renderFavorite() {
    const isActive = this.state.currentMarket === 'favorites';
    const color = isActive ? 'primary' : false;

    return (
      <Box direction="row" justify="center" pad="none">
        {this.props.t('tables.coinTracker.favorites')}
        <StyledStar size="16" color={color} />
      </Box>
    );
  }

  renderMarketBox = (market, key, isActive) => {
    return (
      <div
        key={key}
        onClick={() => this.handleActiveMarket(market)}
        className="pointer"
      >
        <Box
          pad={{ horizontal: 'small', vertical: 'xsmall' }}
          border={{
            size: '1px',
            color: isActive ? 'primary' : 'border',
            side: 'all',
          }}
          align="center"
          flex={false}
        >
          <Text level={5} color={isActive ? 'primary' : null}>
            {market !== 'favorites' ? market : this.renderFavorite()}
          </Text>
        </Box>
      </div>
    );
  };

  render() {
    const { currentMarket } = this.state;
    const {
      exchangeMarkets,
      vhLoader,
      background = 'background-3',
    } = this.props;
  
    return (
      <Fragment>
        {currentMarket ? (
          <Box background={background} gap="small">
            <Box
              direction="row"
              gap="small"
              align="center"
              wrap={false}
              overflow="auto"
              pad="none"
              flex={false}
            >
              {exchangeMarkets.map((market, i) =>
                this.renderMarketBox(
                  market,
                  i,
                  (currentMarket ? currentMarket : exchangeMarkets[0]) ===
                    market,
                ),
              )}
            </Box>
            <CoinTrackerTable currentMarket={currentMarket} />
          </Box>
        ) : (
          <Loading fullVh={vhLoader} />
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = ({
  exchangeSettings: {
    settings: { exchangeMarkets, marketsByGroup },
  },
}) => ({
  exchangeMarkets,
  marketsByGroup
});

const CoinTracker = withRouter(
  withNamespaces()(connect(mapStateToProps)(CoinTrackerContainer)),
);

export default CoinTracker;
