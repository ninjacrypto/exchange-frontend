import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import { Message } from 'react-bulma-components';
import classNames from 'classnames';

import { Box, Paragraph } from 'components/Wrapped';
import { nestedTranslate, formatCrypto } from 'utils';

const CustomToolTip = ({ payload, tradingPair, t: translate }) => {
  const data = payload && payload[0] ? payload[0].payload : null;
  const t = nestedTranslate(translate, 'exchange.depthChart');

  return (
    <Fragment>
      {data && (
        <Message
          size="small"
          color={data.bidTotalVolume ? 'success' : 'danger'}
        >
          <Message.Body
            className={classNames({
              'message-border-right': data.askTotalVolume,
            })}
          >
            <Paragraph>
              {t('price')}: {formatCrypto(data.price, true)}{' '}
              {tradingPair.quoteCurrency}
            </Paragraph>
            <Paragraph>
              {t('totalVolume')}:{' '}
              {data.bidTotalVolume
                ? formatCrypto(data.bidTotalVolume, true)
                : formatCrypto(data.askTotalVolume, true)}{' '}
              {tradingPair.baseCurrency}
            </Paragraph>
            <Paragraph>
              {t('volume')}: {formatCrypto(data.volume, true)}{' '}
              {tradingPair.baseCurrency}
            </Paragraph>
          </Message.Body>
        </Message>
      )}
    </Fragment>
  );
};

const DepthChartTooltip = withNamespaces()(CustomToolTip);

class DepthChart extends Component {
  render() {
    const { tradingPair, depthChartData, isActive = true } = this.props;

    if (!isActive) {
      return null;
    }

    return (
      <Box fill={true} round={false} pad="none" overflow="hidden">
        <ResponsiveContainer minWidth={undefined} minHeight={undefined}>
          {!_.isEmpty(depthChartData) ? (
            <ComposedChart
              data={depthChartData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--bidColor)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--bidColor)"
                    stopOpacity={0.2}
                  />
                </linearGradient>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--askColor)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--askColor)"
                    stopOpacity={0.2}
                  />
                </linearGradient>
              </defs>
              <XAxis dataKey="price" />
              <YAxis domain={[0, 'dataMax']} yAxisId={0} width={40} />
              <YAxis
                dataKey="volume"
                yAxisId={1}
                orientation="right"
                width={40}
              />
              <Bar
                dataKey="volume"
                fill="var(--background)"
                opacity={0.75}
                yAxisId={1}
              />
              <Area
                type="step"
                dataKey="bidTotalVolume"
                stroke="var(--bidColor)"
                fillOpacity={1}
                fill="url(#colorUv)"
                yAxisId={0}
              />
              <Area
                type="step"
                dataKey="askTotalVolume"
                stroke="var(--askColor)"
                fillOpacity={1}
                fill="url(#colorPv)"
                yAxisId={0}
              />
              <Tooltip
                content={<DepthChartTooltip tradingPair={tradingPair} />}
              />
            </ComposedChart>
          ) : (
            <div style={{ height: '100%' }}>
              <Box fill={true} justify="center" align="center">
                <Paragraph>No Data Available</Paragraph>
              </Box>
            </div>
          )}
        </ResponsiveContainer>
      </Box>
    );
  }
}

const mapStateToProps = ({ exchange: { depthChartData, tradingPair } }) => ({
  depthChartData,
  tradingPair,
});

export default connect(mapStateToProps)(DepthChart);
