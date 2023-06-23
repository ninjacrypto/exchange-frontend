import React from 'react';
import _ from 'lodash'
import { connect } from 'react-redux';
import { loadTokenFeeSettings } from '../../redux/actions/exchangeSettings';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { TableWrapper } from 'containers/Tables';

class FeeDiscount extends React.Component {
  componentDidMount() {
    this.props.loadTokenFeeSettings();
  }

  render() {
    const { exchangeToken, feeDiscountTiers, t: translate } = this.props;
    const t = nestedTranslate(translate, 'tables.feeDiscount');

    return (
      !_.isEmpty(feeDiscountTiers) && <TableWrapper
        data={feeDiscountTiers}
        columns={[
          {
            Header: t('tier'),
            accessor: 'tier',
          },
          {
            Header: t('holdings'),
            accessor: 'holding',
            Cell: ({ value }) => `${value} ${exchangeToken}`,
          },
          {
            Header: t('discount'),
            accessor: 'discount',
            Cell: ({ value }) => `${value}%`,
          },
        ]}
        className="-striped -highlight"
        showPagination={false}
        pageSize={feeDiscountTiers.length}
      />
    );
  }
}

const mapStateToProps = ({ exchangeSettings }) => ({
  feeDiscountTiers: exchangeSettings.feeDiscountTiers,
  exchangeToken: exchangeSettings.settings.exchangeToken,
});

const mapDispatchToProps = {
  loadTokenFeeSettings,
};

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(FeeDiscount),
);
