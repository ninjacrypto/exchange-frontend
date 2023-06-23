import React from 'react';
import { useSelector } from 'react-redux';
import { ControlledTabs } from 'components/Tabs';
import { ExchangeWidgetContainer } from 'containers/ExchangeWidgetContainer';
import { components } from './ExchangeDesktop';
import { Grid } from 'components/Wrapped';
import { useValueFromBreakpoint } from 'utils/hooks';

const layouts = [
  {
    rows: ['300px', 'flex', 'flex'],
    columns: ['300px', 'flex', 'flex'],
    gap: 'small',
    areas: [
      {
        name: 'chart',
        componentList: ['TVChartContainer'],
        hasHeading: true,
        start: [0, 0],
        end: [0, 0],
      },
      {
        name: 'bottomTabs',
        componentList: ['OpenOrders','TradeHistory'],
        start: [1, 0],
        end: [2, 2],
      },
    ],
  },
];

const ExchangeGrid = () => {
  const tradingPair = useSelector(
    ({ exchange: { tradingPair } }) => tradingPair,
  );
  const layout = useValueFromBreakpoint({ values: layouts });
  // console.log(layout);

  const renderTabs = (componentList, i) => {
    return (
      <ControlledTabs
        containerProps={{
          className: 'is-flex flex-column react-virtualized-container-fix',
          align: 'left',
        }}
        tabContentProps={{ className: 'react-virtualized-container-fix' }}
        tabProps={{
          marginless: true,
          // fullwidth: true,
          className: 'top-border-radius',
        }}
      >
        {componentList.map((singleComponent, j) =>
          renderComponent(singleComponent, `${i}-${j}`),
        )}
      </ControlledTabs>
    );
  };

  const renderComponent = (componentName, key) => {
    const { component: DynamicComponent, ...rest } = components[componentName];

    return (
      <DynamicComponent
        {...rest}
        tradingPair={tradingPair}
        key={`${componentName}-${key}`}
      />
    );
  };

  const renderLayout = () => {
    return layout.areas.map(
      (
        {
          name,
          componentList,
          hasHeading: layoutHasHeading,
          title,
          ...rest
        },
        i,
      ) => {
        const isSingleComponent = componentList.length === 1;
        const hasHeading =
          typeof layoutHasHeading !== 'undefined' ? layoutHasHeading : false;

        return (
          <ExchangeWidgetContainer
            hasHeading={hasHeading}
            title={title}
            gridArea={name}
            key={name}
          >
            {isSingleComponent
              ? renderComponent(...componentList, i)
              : renderTabs(componentList, i)}
          </ExchangeWidgetContainer>
        );
      },
    );
  };

  return (
    <Grid
      rows={layout.rows}
      columns={layout.columns}
      gap={layout.gap}
      areas={layout.areas}
      style={{ height: '100%' }}
    >
      {renderLayout()}
    </Grid>
  );
};

export default ExchangeGrid;
