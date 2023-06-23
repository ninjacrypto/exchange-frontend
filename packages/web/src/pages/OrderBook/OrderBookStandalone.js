import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Table, Column, AutoSizer } from 'react-virtualized';
import { colorStyle } from 'grommet-styles';
import styled from 'styled-components';

import styles from 'containers/OrderBook/OrderBook.module.scss';
import { getSingleTradingPairSettings } from 'redux/selectors/settings';
import { Box, Text, Heading, Select } from 'components/Wrapped';
import { formatNumberToPlaces, nestedTranslate } from 'utils';
import { useMediaQuery } from 'react-responsive';
import { useState } from 'react';
import { ControlledTabs } from 'components/Tabs';

const DepthBar = styled.div`
  height: 95%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  opacity: 0.15;

  ${props =>
    props.background &&
    colorStyle('background-color', props.background, props.theme)}
`;

const OrderBookSide = withNamespaces()(
  ({
    data,
    numItems,
    side,
    baseCurrency,
    quoteCurrency,
    displayTitle = true,
    t: translate,
  }) => {
    const t = nestedTranslate(translate, 'orderBook');
    const tableData = data.slice(0, numItems);
    const maxVolume = _.get(_.maxBy(tableData, 'volume') || {}, 'volume');
    const rowGetter = ({ index }) => _.get(tableData, `[${index}]`, {});

    const cellRenderer = ({ cellData }) => {
      if (!cellData) {
        return '-';
      }

      return <Text size="small">{cellData}</Text>;
    };

    const renderTotal = ({ rowData: { volume, price } }) => {
      const cellData =
        volume && price ? formatNumberToPlaces(volume * price) : null;

      return cellRenderer({ cellData });
    };

    const renderVolumeBar = ({ width }) => ({ cellData }) => {
      if (!cellData) {
        return null;
      }

      return (
        <DepthBar
          style={{ width: (cellData / maxVolume) * width }}
          background={side === 'bid' ? 'bidColor' : 'askColor'}
        />
      );
    };

    return (
      <Box pad="none" gap="small">
        {displayTitle && <Heading level={3}>{t(side)}</Heading>}
        <AutoSizer disableHeight={true}>
          {({ width }) => (
            <React.Fragment>
              <Table
                height={20 * numItems + 30}
                rowHeight={20}
                headerHeight={30}
                rowCount={numItems}
                rowGetter={rowGetter}
                width={width}
              >
                <Column
                  label={t('price', { quoteCurrency })}
                  flexGrow={1}
                  dataKey="price"
                  width={100}
                  cellRenderer={cellRenderer}
                />
                <Column
                  label={t('volume', { baseCurrency })}
                  flexGrow={1}
                  dataKey="volume"
                  width={100}
                  cellRenderer={cellRenderer}
                />
                <Column
                  label={t('total', { quoteCurrency })}
                  flexGrow={1}
                  dataKey="total"
                  width={100}
                  cellRenderer={renderTotal}
                />
                <Column
                  flexGrow={0}
                  width={0}
                  className={styles.depthContainer}
                  dataKey="volume"
                  cellRenderer={renderVolumeBar({
                    width,
                  })}
                />
              </Table>
            </React.Fragment>
          )}
        </AutoSizer>
      </Box>
    );
  },
);

const OrderBookStandalone = ({
  orderBookAsk,
  orderBookBid,
  tradingPair: { baseCurrency = '---', quoteCurrency = '---' },
  t,
}) => {
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1365 });
  const [numItems, setNumItems] = useState(25);
  const containerProps = isTabletOrMobile ? {} : { pad: 'large' };
  const topAreaProps = isTabletOrMobile
    ? {}
    : { direction: 'row', justify: 'between', align: 'center' };
  const orderBookContainerProps = isTabletOrMobile
    ? {}
    : { direction: 'row', justify: 'between', gap: 'large' };
  const orderBookProps = { numItems, baseCurrency, quoteCurrency };

  return (
    <Box {...containerProps} gap="medium">
      <Box pad="none" {...topAreaProps}>
        <Box pad="none" direction="row" gap="small" align="center">
          <Heading level={1}>{t('orderBook.title')}</Heading>
          <Text weight="bold">—</Text>
          <Text size="medium">
            {baseCurrency}/{quoteCurrency}
          </Text>
        </Box>
        <Box pad="none" gap="xsmall" flex={false}>
          <Text size="xsmall">{t('orderBook.depth')}</Text>
          <Select
            options={[10, 25, 50]}
            onChange={value => setNumItems(value)}
            defaultValue={numItems}
            background="background-2"
          />
        </Box>
      </Box>
      {isTabletOrMobile ? (
        <ControlledTabs tabProps={{ marginless: true, fullwidth: true }}>
          <OrderBookSide
            title={t('orderBook.bid')}
            side="bid"
            data={orderBookBid}
            displayTitle={false}
            {...orderBookProps}
          />
          <OrderBookSide
            title={t('orderBook.ask')}
            side="ask"
            data={orderBookAsk}
            displayTitle={false}
            {...orderBookProps}
          />
        </ControlledTabs>
      ) : (
        <Box pad="none" flex={false} round={false} {...orderBookContainerProps}>
          <Box pad="none" flex={true} round={false}>
            <OrderBookSide side="bid" data={orderBookBid} {...orderBookProps}  />
          </Box>
          <Box pad="none" flex={true} round={false}>
            <OrderBookSide side="ask" data={orderBookAsk} {...orderBookProps} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

const mapStateToProps = state => ({
  tradingPairSettings: getSingleTradingPairSettings(state, {
    tradingPair: state.exchange.tradingPair,
  }),
  orderBookAsk: state.exchange.orderBookAsk,
  orderBookBid: state.exchange.orderBookBid,
  tradingPair: state.exchange.tradingPair,
  lastPrice: state.exchange.tradingPairStats.lastPrice,
  maxVolumeAsk: state.exchange.orderBookAskMaxVolume,
  maxVolumeBid: state.exchange.orderBookBidMaxVolume,
});

export default withNamespaces()(connect(mapStateToProps)(OrderBookStandalone));
