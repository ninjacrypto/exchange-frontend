import React, { useState, useEffect } from 'react';
import { moment } from 'i18n';
import { apiInstance } from 'api';
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  ResponsiveContainer,
} from 'recharts';

import { Box, Text, Message } from 'components/Wrapped';
import { Loading } from 'components/Loading';
import { useDispatch } from 'react-redux';
import { FiatConverter } from '../FiatConverter';
import { useTheme } from 'styled-components';
import { normalizeColor } from 'grommet/utils';
import { withNamespaces } from 'react-i18next';

export const timeFrames = {
  // '1y': {
  //   interval: '1440',
  //   limit: 365,
  // },
  // '3m': {
  //   interval: '1440',
  //   limit: 90,
  // },
  // '1m': {
  //   interval: '1440',
  //   limit: 30,
  // },
  '7d': {
    interval: '60',
    limit: '168',
  },
  '3d': {
    interval: '60',
    limit: 72,
  },
  '1d': {
    interval: '60',
    limit: 24,
  },
};

export const PriceChartContainer = withNamespaces()(
  ({ tradingPair, color, defaultTimeFrame, sparkline = false, t }) => {
    const { baseCurrency, quoteCurrency } = tradingPair;
    const dispatch = useDispatch();
    const [timeFrame, setTimeFrame] = useState(
      defaultTimeFrame ? defaultTimeFrame : '7d',
    );
    const [chartData, setChartData] = useState([]);
    const [chartLoading, setChartLoading] = useState(true);
    const [chartError, setChartError] = useState(false);

    useEffect(() => {
      if (defaultTimeFrame) {
        setTimeFrame(defaultTimeFrame);
      }
    }, [defaultTimeFrame]);

    useEffect(() => {
      const fetchData = async () => {
        setChartLoading(true);
        setChartError(false);
        try {
          const {
            data: { data },
          } = await apiInstance({
            url: 'market/get-chart-data',
            data: {
              baseCurrency,
              quoteCurrency,
              timestamp: moment().valueOf(),
              ...timeFrames[timeFrame],
            },
          });
          setChartLoading(false);
          if (data.length >= 1) {
            setChartData(data.reverse());
          } else {
            setChartData([]);
            setChartError(true);
          }
        } catch (e) {}
      };

      fetchData();
    }, [timeFrame, baseCurrency, quoteCurrency, dispatch]);

    if (sparkline && !chartError) {
      return (
        <PriceChart
          chartLoading={chartLoading}
          chartData={chartData}
          tradingPair={tradingPair}
          color={color}
          sparkline={sparkline}
        />
      );
    }

    return (
      <Box fill={true} pad="small">
        <Box pad="none" direction="row" justify="start" align="center">
          <Box pad="none" direction="row" gap="xsmall">
            {Object.entries(timeFrames).map(([singleTimeFrame]) => (
              <Box
                pad="none"
                onClick={() => setTimeFrame(singleTimeFrame)}
                key={singleTimeFrame}
              >
                <Text
                  color={singleTimeFrame === timeFrame ? 'primary' : 'text'}
                >
                  {singleTimeFrame}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
        <Box pad="none" flex={true} justify="center" align="center">
          {!chartError ? (
            <PriceChart
              chartLoading={chartLoading}
              chartData={chartData}
              tradingPair={tradingPair}
              color={color}
            />
          ) : (
            <Message background="background-4">
              {t('priceChart.noData', { baseCurrency, quoteCurrency })}
            </Message>
          )}
        </Box>
      </Box>
    );
  },
);

const PriceChart = ({
  chartData,
  tradingPair,
  chartLoading,
  color = 'primary',
  sparkline = false,
}) => {
  const theme = useTheme();
  const colorHex = normalizeColor(color, theme);

  if (sparkline && chartLoading) {
    return null;
  }

  return (
    <Box fill={true} round={false} pad="none" overflow="visible">
      {!chartLoading ? (
        <ResponsiveContainer>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id={`color${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor={colorHex} stopOpacity={0.35} />
                <stop offset="100%" stopColor={colorHex} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              type="number"
              tickFormatter={timeStr =>
                moment
                  .utc(timeStr)
                  .local()
                  .format('l')
              }
              domain={['dataMin', 'dataMax']}
              tickLine={false}
              tick={{ fill: 'var(--defaultTextColor)' }}
              axisLine={{ stroke: 'var(--defaultTextColor)' }}
              hide={sparkline}
            />
            <YAxis
              orientation="right"
              dataKey="close"
              domain={['dataMin', 'dataMax']}
              tickLine={false}
              axisLine={{ stroke: 'var(--defaultTextColor)' }}
              tick={{ fill: 'var(--defaultTextColor)' }}
              hide={sparkline}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={colorHex}
              // fillOpacity={1}
              fill={`url(#${`color${color}`})`}
              strokeWidth={3}
              // isAnimationActive={false}
            />
            {!sparkline && (
              <Tooltip
                content={<PriceChartTooltip tradingPair={tradingPair} />}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <Loading size="75px" />
      )}
    </Box>
  );
};

const PriceChartTooltip = ({ payload, tradingPair, ...rest }) => {
  const data = payload && payload[0] ? payload[0].payload : null;

  if (!data) {
    return null;
  }

  return (
    <Box background="background">
      <Text color="textStrong" weight="bold">
        {moment(data.time).format('L LT')}
      </Text>
      <Text color="textStrong">
        {data.close} {tradingPair.quoteCurrency}
      </Text>
      <Text color="textStrong">
        ~
        <FiatConverter
          isFiat={true}
          lastPrice={data.close}
          market={tradingPair.quoteCurrency}
          returnValue={true}
        />
      </Text>
    </Box>
  );
};
