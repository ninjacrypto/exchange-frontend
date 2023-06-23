import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { moment } from 'i18n';

import { loadAffiliatesCommission } from 'redux/actions/affiliates';
import { Loading } from 'components/Loading';

import { withNamespaces } from 'react-i18next';
import { formatCrypto, nestedTranslate } from 'utils';
import { TableWrapper } from 'containers/Tables';

class ReferralCommissionTable extends React.PureComponent {
  componentDidMount() {
    this.props.loadAffiliatesCommission();
  }

  render() {
    const { commission, t: translate } = this.props;
    const t = nestedTranslate(translate, 'tables.commission');

    return (
      <Fragment>
        {commission ? (
          <TableWrapper
            data={commission}
            columns={[
              {
                Header: t('credit'),
                accessor: 'amount',
                Cell: ({ value, original: { fromCID_Paid_Curr: currency } }) =>
                  `${formatCrypto(value, true)} ${currency}`,
              },
              {
                Header: t('dot'),
                accessor: 'execDate',
                Cell: ({ value }) =>
                  moment
                    .utc(value)
                    .local()
                    .format('L HH:mm'),
              },
            ]}
            showPagination={true}
            minRows={3}
            pageSize={10}
            style={{ fontSize: '14px' }}
          />
        ) : (
          <Loading />
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  commission: user.affiliateInfo.commission,
});

export default withNamespaces()(
  connect(
    mapStateToProps,
    { loadAffiliatesCommission },
  )(ReferralCommissionTable),
);
