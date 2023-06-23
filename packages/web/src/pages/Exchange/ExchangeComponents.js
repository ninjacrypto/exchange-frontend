import { CreateOrder } from 'containers/CreateOrder';
import { TradeHistory } from 'containers/TradeHistory';
import { OrderBook } from 'containers/OrderBook';
import { TVChartContainer } from 'containers/TVChartContainer';
import { ExchangeWidgetContainer } from 'containers/ExchangeWidgetContainer';
import { DepthChart } from 'containers/DepthChart';
import { OpenOrdersTable, UserTradeHistoryTable } from 'containers/Tables';
import { WalletTable } from 'containers/Tables';
import { Cryptonews } from 'containers/Cryptonews';

export const exchangeComponents = {
  DepthChart: {
    component: DepthChart,
    title: 'exchange.depthChart.title',
  },
  Cryptonews: {
    component: Cryptonews,
    title: 'exchange.cryptonews',
  },
  OrderBook: {
    component: OrderBook,
    title: 'exchange.orderBook',
  },
  PlaceHolder: {
    component: ExchangeWidgetContainer,
    title: 'exchange.placeholder',
  },
  TradeHistory: {
    component: TradeHistory,
    title: 'exchange.tradeHistory',
  },
  TVChartContainer: {
    component: TVChartContainer,
    title: 'exchange.chart',
  },
  OpenOrders: {
    component: OpenOrdersTable,
    title: 'exchange.openOrders',
    extraProps: {
      isFilterable: false,
      exportable: false,
    },
  },
  OrderHistory: {
    component: UserTradeHistoryTable,
    title: 'exchange.orderHistory',
    extraProps: {
      isFilterable: false,
      exportable: false,
      refetchInterval: 25000,
    },
  },
  Portfolio: {
    component: WalletTable,
    title: 'exchange.portfolio',
    extraProps: {
      isFilterable: false,
      exportable: false,
      hideColumns: ['actions', 'trade'],
    },
    showBalanceToggle: false,
  },
  CreateOrder: {
    component: CreateOrder,
    title: 'exchange.createOrder',
    extraProps: {
      tabProps: {
        className: 'top-border-radius draggableHandle',
      },
      tabItemProps: {
        className: 'draggableCancel',
      },
    },
  },
};
