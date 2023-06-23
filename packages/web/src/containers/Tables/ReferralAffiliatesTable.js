import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { moment } from 'i18n';

import { loadAffiliatesReferrals } from 'redux/actions/affiliates';
import { Loading } from 'components/Loading';
import { TableWrapper } from 'containers/Tables';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';

class ReferralAffiliatesTable extends React.PureComponent {
  componentDidMount() {
    this.props.loadAffiliatesReferrals();
  }

  render() {
    const { affiliates, t: translate } = this.props;
    const t = nestedTranslate(translate, 'tables.referrals');

    return (
      <Fragment>
        {affiliates ? (
          <TableWrapper
            data={affiliates}
            columns={[
              {
                Header: t('joinedOn'),
                accessor: 'doj',
                Cell: ({ value }) =>
                  moment
                    .utc(value)
                    .local()
                    .format('L HH:mm'),
              },
              {
                Header: t('userId'),
                accessor: 'name',
              },
              {
                Header: t('email'),
                accessor: 'email',
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
  affiliates: user.affiliateInfo.affiliates,
});

export default withNamespaces()(
  connect(mapStateToProps, { loadAffiliatesReferrals })(
    ReferralAffiliatesTable,
  ),
);
