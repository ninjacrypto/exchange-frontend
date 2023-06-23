import React from 'react';
import { connect } from 'react-redux';

import { moment } from 'i18n';
import styles from './Table.module.scss';
import { TableWrapper } from 'containers/Tables';
import { cancelOrder } from 'redux/actions/orders';
import { formatCrypto } from 'utils/numbers';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { Button } from 'components/Wrapped';

class OpenOrdersTable extends React.PureComponent {
  renderSide = t => ({ value }) => {
    const color = value === 'BUY' ? styles.bid : styles.ask;
    return <span className={color}>{t('orderSide', { side: value[0] +  
      value.slice(1).toLowerCase() })}</span>;
  };

  renderNumber({ value }) {
    return formatCrypto(value, true);
  }

  renderAction = translate => ({ original }) => {
    return (
      <Button
        color="primary"
        primary={false}
        size="xsmall"
        onClick={this.handleCancelOrder(original)}
        plain={true}
      >
        {translate('buttons.cancel')}
      </Button>
    );
  };

  handleCancelOrder = data => () => {
    this.props.cancelOrder(data);
  };

  render() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'tables.openOrdersTable');
    return (
      <TableWrapper
        data={this.props.openOrders}
        isFilterable={true}
        filterBy={['tradingPair', 'orderType']}
        exportable={[
          'date',
          'tradingPair',
          'orderType',
          'orderSide',
          'price',
          'pendingVolume',
        ]}
        fileName="open-orders"
        columns={[
          {
            Header: t('date'),
            id: 'date',
            accessor: ({ date }) => moment(date).format('YYYY-MM-DD HH:mm:ss Z'),
          minWidth: 135,
          },
          {
            Header: t('pair'),
            accessor: 'tradingPair',
          },
          {
            Header: t('type'),
            id: 'orderType',
            accessor: ({ orderType }) =>
            translate(`generics.orderTypes.${orderType}`),
          },
          {
            Header: t('side'),
            accessor: 'orderSide',
            Cell: this.renderSide(t),
          },
          {
            Header: t('price'),
            accessor: 'price',
            Cell: this.renderNumber,
          },
          {
            Header: t('stopprice'),
            accessor: 'stopPrice',
            Cell: this.renderNumber,
          },
          {
            Header: t('pending'),
            accessor: 'pendingVolume',
            Cell: this.renderNumber,
          },
          {
            Header: t('volume'),
            accessor: 'volume',
            Cell: this.renderNumber,
          },
          {
            Header: t('action'),
            id: 'action',
            accessor: data => data,
            Cell: this.renderAction(translate),
          },
        ]}
        style={{ height: '100%' }}
        defaultSorted={[
          {
            id: 'orderId',
            desc: false,
          },
        ]}
        sortable={false}
        minRows={10}
        pageSize={10}
        {...this.props.extraProps}
      />
    );
  }
}

const mapStateToProps = ({ orders }) => ({
  openOrders: orders.openOrders,
});

const mapDispatchToProps = {
  cancelOrder,
};

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(OpenOrdersTable),
);
