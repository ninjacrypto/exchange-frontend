import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Loading } from 'components/Loading';
import { socket } from 'realtime';
import { DerivativesWalletTable } from 'containers/Tables';
import { withNamespaces } from 'react-i18next';
import { getDerivativesPortfolio } from 'redux/actions/portfolio';

class DerivativesOverview extends Component {
  componentDidMount() {
      this.props.getDerivativesPortfolio();
  }

  render() {
    const {
      isLoading,
    } = this.props;

    return !isLoading ? (
      <React.Fragment>
        <DerivativesWalletTable />
      </React.Fragment>
    ) : (
      <Loading />
    );
  }
}

const mapStateToProps = ({
  portfolio,
}) => ({
  isLoading: portfolio.isLoading,
});

export default withNamespaces()(connect(mapStateToProps, { getDerivativesPortfolio })(DerivativesOverview));
