import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { TableWrapper } from 'containers/Tables';
import { moment } from 'i18n';

import { loadLoginHistory } from 'redux/actions/profile';
import { Loading } from 'components/Loading';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';

class LoginHistoryTable extends React.PureComponent {
  componentDidMount() {
    this.props.loadLoginHistory();
  }

  render() {
    const { loginHistory, t: translate } = this.props;

    const t = nestedTranslate(translate, 'tables.loginHistory');

    return (
      <Fragment>
        {loginHistory ? (
          <TableWrapper
            data={loginHistory}
            hideColumns={[]}
            columns={[
              {
                Header: t('startedOn'),
                accessor: 'startedOn',
                Cell: ({ value }) =>
                  moment
                    .utc(value)
                    .local()
                    .format('L HH:mm'),
              },
              {
                Header: t('ipAddress'),
                accessor: 'ip',
              },
              {
                Header: t('os'),
                accessor: 'os',
              },
              {
                Header: t('browser'),
                accessor: 'browser',
              },
              {
                Header: t('location'),
                accessor: 'location',
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
  loginHistory: user.profile.loginHistory,
});

export default withNamespaces()(
  connect(
    mapStateToProps,
    { loadLoginHistory },
  )(LoginHistoryTable),
);
