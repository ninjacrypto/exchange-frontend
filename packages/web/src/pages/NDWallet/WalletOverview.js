import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Loading } from 'components/Loading';
import { NDWalletTable } from 'containers/Tables';
import { withNamespaces } from 'react-i18next';
import { getNDWalletBalance } from 'redux/actions/NDWalletData';

class WalletOverview extends Component {
  componentDidMount() {
    this.props.getNDWalletBalance();
  }

  render() {
    const { isLoading } = this.props;

    return !isLoading ? (
      <React.Fragment>
        <NDWalletTable />
      </React.Fragment>
    ) : (
      <Loading />
    );
  }
}

const mapStateToProps = ({ NDWalletData }) => ({
  isLoading: NDWalletData.isBalanceLoading,
});

export default withNamespaces()(
  connect(mapStateToProps, { getNDWalletBalance })(WalletOverview),
);
