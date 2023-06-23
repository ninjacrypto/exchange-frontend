import React from 'react';
import { connect } from 'react-redux';

import { TableWrapper } from 'containers/Tables';
import { cancelOrder } from 'redux/actions/orders';
import { formatCrypto } from 'utils/numbers';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';

import styles from 'containers/Tables/Table.module.scss';
import { Button } from 'components/Wrapped';

class CopyTradingTable extends React.PureComponent {

  render() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'tables.openOrdersTable');

    return (
      <TableWrapper
        data={this.props.data}
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
            accessor: 'date',
            minWidth: 125,
          },
          {
            Header: t('pair'),
            accessor: 'tradingPair',
          },
          {
            Header: t('type'),
            accessor: 'orderType',
            maxWidth: 75,
          },
          {
            Header: t('side'),
            accessor: 'orderSide',
            maxWidth: 75,
            Cell: ({ value }) => {
              const color = value === 'Buy' ? styles.bid : styles.ask;
              return <span className={color}>{t('orderSide', { side: value })}</span>
             }
          },
          {
            Header: t('price'),
            accessor: 'price',
            Cell: ({ value }) => formatCrypto(value),
          },
          {
            Header: t('pending'),
            accessor: 'pendingVolume',
            maxWidth: 75,
            Cell: ({ value }) => formatCrypto(value),
          },
          {
            Header: t('action'),
            id: 'action',
            accessor: d => (
              <Button
                color="primary"
                size="small"
                onClick={() => this.props.cancelOrder(d)}
              >
                {translate('buttons.cancel')}
              </Button>
            ),
          },
        ]}
        style={{ height: '100%' }}
        defaultSorted={[
          {
            id: 'date',
            desc: true,
          },
        ]}
        minRows={3}
        pageSize={10}
        {...this.props.extraProps}
      />
    );
  }
}

export default withNamespaces()(
  connect(
    null,
    { cancelOrder },
  )(CopyTradingTable),

);
