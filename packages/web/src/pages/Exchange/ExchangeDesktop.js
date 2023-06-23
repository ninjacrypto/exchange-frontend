import * as React from 'react';
import { connect } from 'react-redux';
import { WidthProvider, Responsive } from 'react-grid-layout';

import { CreateOrder } from 'containers/CreateOrder';
import { TradeHistory } from 'containers/TradeHistory';
import { OrderBook } from 'containers/OrderBook';
import { TVChartContainer } from 'containers/TVChartContainer';
import { ExchangeWidgetContainer } from 'containers/ExchangeWidgetContainer';
import { DepthChart } from 'containers/DepthChart';
import { ControlledTabs } from 'components/Tabs';
import { OpenOrdersTable, UserTradeHistoryTable } from 'containers/Tables';
import 'react-grid-layout/css/styles.css';
import { Translate } from 'containers/Translate';
import { WalletTable } from 'containers/Tables';

const ReactGridLayout = WidthProvider(Responsive);

// These are the components that are usable in the exchange layout. Any component can be placed here.
export const components = {
  DepthChart: {
    component: DepthChart,
    title: <Translate>exchange.depthChart.title</Translate>,
  },
  OrderBook: {
    component: OrderBook,
    title: <Translate>exchange.orderBook</Translate>,
  },
  PlaceHolder: {
    component: ExchangeWidgetContainer,
    title: <Translate>exchange.placeholder</Translate>,
  },
  TradeHistory: {
    component: TradeHistory,
    title: <Translate>exchange.tradeHistory</Translate>,
  },
  TVChartContainer: {
    component: TVChartContainer,
    title: <Translate>exchange.chart</Translate>,
  },
  OpenOrders: {
    component: OpenOrdersTable,
    title: <Translate>exchange.openOrders</Translate>,
    extraProps: {
      isFilterable: false,
      exportable: false,
    },
  },
  OrderHistory: {
    component: UserTradeHistoryTable,
    title: <Translate>exchange.orderHistory</Translate>,
    extraProps: {
      isFilterable: false,
      exportable: false,
      refetchInterval: 25000,
    },
  },
  Portfolio: {
    component: WalletTable,
    title: <Translate>exchange.portfolio</Translate>,
    extraProps: {
      isFilterable: false,
      exportable: false,
      hideColumns: ['actions', 'trade'],
    },
    showBalanceToggle: false,
  },
  CreateOrder: {
    component: CreateOrder,
    title: <Translate>exchange.createOrder</Translate>,
  },
};

class ExchangeDesktop extends React.PureComponent {
  state = {
    width: 0,
    height: 0,
    currentLayout: 'lg',
    resizable: true,
  };

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  };

  renderTabs(componentList, i) {
    return (
      <ControlledTabs
        containerProps={{
          className: 'is-flex flex-column react-virtualized-container-fix',
        }}
        tabContentProps={{ className: 'react-virtualized-container-fix' }}
        tabProps={{
          marginless: true,
          fullwidth: true,
          className: 'top-border-radius',
        }}
      >
        {componentList.map((singleComponent, j) =>
          this.renderComponent(singleComponent, `${i}-${j}`),
        )}
      </ControlledTabs>
    );
  }

  renderComponent(componentName, key) {
    const { component: DynamicComponent, ...rest } = components[componentName];
    const { tradingPair } = this.props;

    return (
      <DynamicComponent
        {...rest}
        tradingPair={tradingPair}
        key={`${componentName}-${key}`}
      />
    );
  }

  renderLayout(layout) {
    return layout.map(
      ({ componentList, hasHeading: layoutHasHeading, title, ...rest }, i) => {
        const isSingleComponent = componentList.length === 1;
        const hasHeading =
          typeof layoutHasHeading !== 'undefined' ? layoutHasHeading : false;

        return (
          <div key={`${i}`} data-grid={rest}>
            <ExchangeWidgetContainer hasHeading={hasHeading} title={title}>
              {isSingleComponent
                ? this.renderComponent(...componentList, i)
                : this.renderTabs(componentList, i)}
            </ExchangeWidgetContainer>
          </div>
        );
      },
    );
  }

  handleBreakpointChange = layout => {
    this.setState({ currentLayout: layout });
  };

  render() {
    // const { exchange } = this.props;
    const { resizable } = this.state;
    this.layouts = {
      lg: [
        {
          componentList: ['TVChartContainer'],
          title: components.TVChartContainer.title,
          x: 0,
          y: 0,
          w: 6,
          h: 5,
          static: resizable,
        },
        {
          componentList: ['DepthChart'],
          hasHeading: true,
          title: components.DepthChart.title,
          x: 0,
          y: 5,
          w: 2,
          h: 3,
          static: resizable,
        },
        {
          componentList: ['OpenOrders', 'OrderHistory', 'Portfolio'],
          x: 2,
          y: 5,
          w: 4,
          h: 3,
          static: resizable,
        },
        {
          componentList: ['OrderBook'],
          hasHeading: true,
          title: components.OrderBook.title,
          x: 6,
          y: 0,
          w: 2,
          h: 4,
          static: resizable,
        },
        {
          componentList: ['TradeHistory'],
          hasHeading: true,
          title: components.TradeHistory.title,
          x: 8,
          y: 0,
          w: 2,
          h: 4,
          static: resizable,
        },
        {
          componentList: ['CreateOrder'],
          x: 6,
          y: 4,
          w: 4,
          h: 4,
          static: resizable,
        },
        // { componentList: ['PlaceHolder'], x: 8, y: 5, w: 2, h: 3, static: resizable},
      ],
      md: [
        {
          componentList: ['TVChartContainer'],
          x: 0,
          y: 0,
          w: 6,
          h: 5,
          static: resizable,
        },
        {
          componentList: ['DepthChart'],
          x: 0,
          y: 5,
          w: 2,
          h: 3,
          static: resizable,
        },
        {
          componentList: ['OpenOrders', 'OrderHistory', 'Portfolio'],
          x: 2,
          y: 5,
          w: 4,
          h: 3,
          static: resizable,
        },

        {
          componentList: ['OrderBook'],
          x: 6,
          y: 5,
          w: 2,
          h: 3,
          static: resizable,
        },
        {
          componentList: ['TradeHistory'],
          x: 8,
          y: 5,
          w: 2,
          h: 3,
          static: resizable,
        },
        {
          componentList: ['CreateOrder'],
          x: 6,
          y: 0,
          w: 4,
          h: 5,
          static: resizable,
        },
      ],
      sm: [
        {
          componentList: ['TVChartContainer', 'DepthChart'],
          x: 0,
          y: 0,
          w: 2,
          h: 4,
          static: resizable,
        },
        {
          componentList: ['OrderBook', 'TradeHistory'],
          x: 0,
          y: 4,
          w: 2,
          h: 3,
          static: resizable,
        },
        {
          componentList: ['CreateOrder'],
          x: 0,
          y: 7,
          w: 2,
          h: 3,
          static: resizable,
        },
      ],
    };

    return (
      // The " - 58" is a little hacky right now, that's the height of the navbar
      <React.Fragment>
        <ReactGridLayout
          margin={[5, 5]}
          className="layout"
          layouts={this.layouts}
          cols={{ lg: 10, md: 10, sm: 2 }}
          breakpoints={{ lg: 1024, md: 768, sm: 0 }}
          rowHeight={(this.state.height - 98) / 9 + 5}
          onBreakpointChange={this.handleBreakpointChange}
        >
          {this.renderLayout(this.layouts[this.state.currentLayout])}
        </ReactGridLayout>
        {/* <input
          type="checkbox"
          name=""
          id=""
          onClick={() => this.setState({ resizable: !this.state.resizable })}
          checked={!this.state.resizable}
        /> */}
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({
  exchange: { tradingPair },
}) => ({
  tradingPair,
});

export default connect(mapStateToProps)(ExchangeDesktop);
