import React, { useMemo, useState } from 'react';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { WidthProvider, Responsive } from 'react-grid-layout';
import { colorStyle } from 'grommet-styles';
import styled from 'styled-components';

import { exchangeComponents } from './ExchangeComponents';
import { ControlledTabs } from 'components/Tabs';
import { ExchangeWidgetContainer } from 'containers/ExchangeWidgetContainer';
import { updateExchangeLayouts } from 'redux/actions/userSettings';
import defaultLayouts from './defaultLayouts';

const ReactGridLayout = WidthProvider(Responsive);

const StyledReactGridLayout = styled(ReactGridLayout)`
  .react-grid-item > .react-resizable-handle::after {
    ${props => colorStyle('border-color', 'handleColor', props.theme)}
  }
`;

const getUpdatedLayout = (layout, breakpoint) => {
  const layoutsWithData = layout.map(singleLayoutItem => {
    const { h, w, x, y, i } = singleLayoutItem;
    const componentList = JSON.parse(i);

    const originalData =
      find(defaultLayouts[breakpoint], item => {
        return isEqual(item.componentList, componentList);
      }) || {};

    const { title, hasHeading, static: isStatic } = originalData;

    return {
      i,
      h,
      w,
      x,
      y,
      componentList,
      ...(title && { title }),
      ...(hasHeading && { hasHeading }),
      ...(isStatic && { static: true }),
    };
  });

  return layoutsWithData;
};

const fixInitialLayouts = layouts => {
  const updatedLayouts = {};

  Object.entries(layouts).forEach(([singleBreakpoint, singleLayout]) => {
    const updatedLayout = singleLayout.map(layoutItem => {
      const extraData = {};

      if (!layoutItem.i) {
        extraData.i = JSON.stringify(layoutItem.componentList);
      }

      return {
        ...layoutItem,
        ...extraData,
      };
    });

    updatedLayouts[singleBreakpoint] = updatedLayout;
  });

  return updatedLayouts;
};

export const ExchangeLayoutContainer = ({
  t,
  tradingPair,
  exchangeLayouts,
  updateExchangeLayouts,
}) => {
  const [breakpoint, setBreakpoint] = useState('lg');
  let currentLayouts = !isEmpty(exchangeLayouts)
    ? { ...exchangeLayouts }
    : { ...defaultLayouts };

  currentLayouts = fixInitialLayouts(currentLayouts);

  const handleBreakpointChange = newBreakpoint => {
    setBreakpoint(newBreakpoint);
  };

  const handleLayoutChange = (_, newLayouts) => {
    const layoutWithExtras = getUpdatedLayout(
      newLayouts[breakpoint],
      breakpoint,
    );

    if (breakpoint !== 'sm') {
      updateExchangeLayouts({
        ...currentLayouts,
        [breakpoint]: layoutWithExtras,
      });
    }
  };

  const renderComponent = componentName => {
    const {
      component: DynamicComponent,
      title = '---',
      ...rest
    } = exchangeComponents[componentName];

    return (
      <DynamicComponent
        {...rest}
        title={t(title)}
        key={componentName}
        tradingPair={tradingPair}
      />
    );
  };

  const renderTab = componentList => {
    return (
      <ControlledTabs
        containerProps={{
          className: 'is-flex flex-column react-virtualized-container-fix',
        }}
        tabContentProps={{ className: 'react-virtualized-container-fix' }}
        tabProps={{
          className: 'top-border-radius draggableHandle',
        }}
        tabItemProps={{
          className: 'draggableCancel',
        }}
      >
        {componentList.map(componentName => renderComponent(componentName))}
      </ControlledTabs>
    );
  };

  const currentLayout = useMemo(() => {
    const breakpointLayout = get(
      currentLayouts,
      breakpoint,
      defaultLayouts[breakpoint],
    );

    return breakpointLayout.map(
      ({ componentList, hasHeading: layoutHasHeading, title, i, ...rest }) => {
        const isSingleComponent = componentList.length === 1;
        const hasHeading =
          typeof layoutHasHeading !== 'undefined' ? layoutHasHeading : false;

        return (
          <div key={i} data-grid={rest}>
            <ExchangeWidgetContainer hasHeading={hasHeading} title={t(title)}>
              {isSingleComponent
                ? renderComponent(componentList[0])
                : renderTab(componentList)}
            </ExchangeWidgetContainer>
          </div>
        );
      },
    );
  }, [currentLayouts, breakpoint]);

  return (
    <StyledReactGridLayout
      margin={[10, 5]}
      className="layout"
      layouts={currentLayouts}
      breakpoints={{ lg: 1439, md: 767, sm: 0 }}
      cols={{ lg: 12, md: 12, sm: 1 }}
      rowHeight={5}
      onBreakpointChange={handleBreakpointChange}
      onLayoutChange={handleLayoutChange}
      draggableHandle=".draggableHandle"
      draggableCancel=".draggableCancel"
    >
      {currentLayout}
    </StyledReactGridLayout>
  );
};

const mapStateToProps = ({
  exchange: { tradingPair },
  userSettings: { exchangeLayouts },
}) => ({
  tradingPair,
  exchangeLayouts,
});

export const ExchangeLayout = withNamespaces()(
  connect(mapStateToProps, {
    updateExchangeLayouts,
  })(ExchangeLayoutContainer),
);
