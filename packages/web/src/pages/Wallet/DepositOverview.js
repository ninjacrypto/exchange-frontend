import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { TwoCols } from 'pages/Generics';
import { DepositHistoryTable } from 'containers/Tables';
import { withNamespaces } from 'react-i18next';

import { Deposit } from 'pages/Wallet';
import { Box } from 'components/Wrapped';
import { BoxHeading } from 'components/Helpers';

class DepositOverview extends Component {
  state = {
    currency: '',
  };

  depositAddress() {
    return <Deposit />;
  }

  depositHistory() {
    const { t } = this.props;

    return (
      <Box background="background-3" pad="none">
        <BoxHeading level={3}>{t('wallet.deposits.history')}</BoxHeading>
        <Box pad="medium">
          <DepositHistoryTable />
        </Box>
      </Box>
    );
  }

  render() {
    const { aeraPassEnabled } = this.props;

    return (
      <Fragment>
        <TwoCols
          hideLeftCol={aeraPassEnabled}
          leftCol={this.depositAddress()}
          rightCol={this.depositHistory()}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = ({
  exchangeSettings: {
    settings: { aeraPassEnabled },
  },
}) => ({
  aeraPassEnabled,
});

export default withNamespaces()(
  connect(mapStateToProps, null)(DepositOverview),
);
