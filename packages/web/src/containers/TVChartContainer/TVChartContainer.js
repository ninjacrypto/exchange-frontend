import * as React from 'react';
import { connect } from 'react-redux';
import { withTheme } from 'styled-components';
import _ from 'lodash';
import { widget } from '../../charting_library/charting_library.min';
import styled from 'styled-components';

import datafeed from './datafeed';
import { updatePrice } from './streamProvider';
import { isMobile } from 'components/Responsive';
import { numberParser } from 'utils';

const ChartWrapper = styled.div`
  display: flex;
  flex: 1 1 0%;

  iframe {
    flex: 1 0 auto;
    width: initial !important;
    height: initial !important;
  }
`

class TVChartContainer extends React.PureComponent {
  state = {
    isChartReady: false,
  };

  static defaultProps = {
    symbol: '/',
    interval: '60',
    containerId: 'tv_chart_container',
    libraryPath: '/charting_library/',
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
  };

  tvWidget = null;

  getOverrides() {
    const { theme } = this.props;

    // https://github.com/tradingview/charting_library/wiki/Overrides
    return {
      overrides: {
        'paneProperties.background': theme.global.colors['background-2'],
        'paneProperties.horzGridProperties.color':
          theme.global.colors['background-3'],
        'paneProperties.vertGridProperties.color':
          theme.global.colors['background-3'],

        // Candles styles
        'mainSeriesProperties.candleStyle.upColor':
          theme.global.colors.bidColor,
        'mainSeriesProperties.candleStyle.downColor':
          theme.global.colors.askColor,
        'mainSeriesProperties.candleStyle.borderUpColor':
          theme.global.colors.bidColor,
        'mainSeriesProperties.candleStyle.borderDownColor':
          theme.global.colors.askColor,

        // Hollow Candles styles
        'mainSeriesProperties.hollowCandleStyle.upColor':
          theme.global.colors.bidColor,
        'mainSeriesProperties.hollowCandleStyle.downColor':
          theme.global.colors.askColor,
        'mainSeriesProperties.hollowCandleStyle.borderUpColor':
          theme.global.colors.bidColor,
        'mainSeriesProperties.hollowCandleStyle.borderDownColor':
          theme.global.colors.askColor,

        // Heiken Ashi styles
        'mainSeriesProperties.haStyle.upColor': theme.global.colors.bidColor,
        'mainSeriesProperties.haStyle.downColor': theme.global.colors.askColor,
        'mainSeriesProperties.haStyle.borderUpColor':
          theme.global.colors.bidColor,
        'mainSeriesProperties.haStyle.borderDownColor':
          theme.global.colors.askColor,

        // Bar styles
        'mainSeriesProperties.barStyle.upColor': theme.global.colors.bidColor,
        'mainSeriesProperties.barStyle.downColor': theme.global.colors.askColor,

        // // Line styles
        // 'mainSeriesProperties.lineStyle.color': theme.global.colors.defaultTextColor,

        // // Area styles
        // 'mainSeriesProperties.areaStyle.linecolor': theme.global.colors.defaultTextColor,

        // // Baseline styles
        // 'mainSeriesProperties.baselineStyle.baselineColor': theme.global.colors.defaultTextColor,
        'mainSeriesProperties.baselineStyle.topFillColor1':
          theme.global.colors.bidColor,
        'mainSeriesProperties.baselineStyle.bottomFillColor2':
          theme.global.colors.askColor,
        'mainSeriesProperties.baselineStyle.topLineColor':
          theme.global.colors.bidColor,
        'mainSeriesProperties.baselineStyle.bottomLineColor':
          theme.global.colors.askColor,
      },

      // https://github.com/tradingview/charting_library/wiki/Studies-Overrides
      studies_overrides: {
        'volume.volume.borderColor.0': theme.global.colors.bidColor,
        'volume.volume.borderColor.1': theme.global.colors.askColor,
        'volume.volume ma.linewidth': 5,
      },
    };
  }

  initializeTradingView() {
    const { tradingPair } = this.props;
    const mobileSettings = isMobile() ? { preset: 'mobile' } : {};

    const widgetOptions = {
      symbol: `${tradingPair.baseCurrency}/${tradingPair.quoteCurrency}`,
      datafeed: datafeed,
      interval: this.props.interval,
      container_id: this.props.containerId,
      library_path: this.props.libraryPath,

      locale: this.props.language,
      disabled_features: [
        'use_localstorage_for_settings',
        'header_saveload',
        'header_compare',
        'header_undo_redo',
        'header_symbol_search',
        'go_to_date',
        'time_frames'
      ],
      enabled_features: [],
      charts_storage_url: this.props.chartsStorageUrl,
      charts_storage_api_version: this.props.chartsStorageApiVersion,
      client_id: this.props.clientId,
      user_id: this.props.userId,
      fullscreen: this.props.fullscreen,
      autosize: this.props.autosize,
      theme: this.props.theme.chartingTheme,
      numeric_formatting: { decimal_sign: numberParser.decimalSeparator },

      ...mobileSettings,

      // toolbar_bg: this.props.theme.global.colors["background-2"],

      // time_frames: [
      //   // { text: '1y', resolution: '60' },
      //   // { text: '6m', resolution: '60' },
      //   // { text: '3m', resolution: '60' },
      //   // { text: '1m', resolution: '60' },
      //   // { text: '5d', resolution: '60' },
      //   // { text: '1d', resolution: '60' },
      // ],

      ...this.getOverrides(),
    };

    const tvWidget = new widget(widgetOptions);
    this.tvWidget = tvWidget;
    window.tvWidget = tvWidget;

    tvWidget.onChartReady(() => {
      this.updateTheme();
      this.setState({ isChartReady: true });
      // const button = tvWidget
      //   .createButton()
      //   .attr('title', 'Click to show a notification popup')
      //   .addClass('apply-common-tooltip')
      //   .on('click', () =>
      //     tvWidget.showNoticeDialog({
      //       title: 'Notification',
      //       body: 'TradingView Charting Library API works correctly',
      //       callback: () => {
      //         console.log('Noticed!');
      //       },
      //     }),
      //   );
      // button[0].innerHTML = 'Check API';
    });
  }

  updateTheme() {
    const styleElement = this.tvWidget._iFrame.contentDocument.documentElement
      .style;
    const themeColors = this.props.theme.global.colors;

    const styles = {
      '--tv-color-platform-background': 'background-2',
      '--tv-color-pane-background': 'background-2',
      '--tv-color-toolbar-button-background-hover': 'background-3',
    };

    Object.entries(styles).forEach(([cssVar, color]) => {
      styleElement.setProperty(cssVar, themeColors[color]);
    });
  }

  componentDidMount() {
    const { tradingPair } = this.props;
    if (!_.isEmpty(tradingPair)) {
      this.initializeTradingView();
    }
  }

  componentWillUnmount() {
    if (this.tvWidget !== null) {
      if (this.state.isChartReady) {
        this.tvWidget.remove();
      }
      delete this.tvWidget;
    }
  }

  setTradingPair() {
    const { interval } = this.tvWidget.symbolInterval();
    const tradingPair = `${this.props.tradingPair.baseCurrency}/${this.props.tradingPair.quoteCurrency}`;
    this.tvWidget.setSymbol(tradingPair, interval);
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps.tradingPair, this.props.tradingPair)) {
      if (this.tvWidget === null) {
        this.initializeTradingView();
      } else {
        if (this.state.isChartReady) {
          this.setTradingPair();
        } else {
          this.tvWidget.onChartReady(() => {
            this.setTradingPair();
          });
        }
      }
    }

    if (
      !_.isEqual(prevProps.theme.chartingTheme, this.props.theme.chartingTheme)
    ) {
      const { overrides, studies_overrides } = this.getOverrides();
      this.tvWidget.changeTheme(this.props.theme.chartingTheme);
      this.tvWidget.applyOverrides(overrides);
      this.tvWidget.applyStudiesOverrides(studies_overrides);
      this.updateTheme();
    }

    updatePrice(this.props.lastPrice);
  }

  render() {
    return (
      <ChartWrapper
        id={this.props.containerId}
      />
    );
  }
}

const mapStateToProps = ({
  exchange: {
    tradingPair,
    tradingPairStats: { lastPrice },
  },
  exchangeSettings: { language },
}) => ({
  tradingPair,
  lastPrice,
  language
});

export default withTheme(connect(mapStateToProps)(TVChartContainer));
