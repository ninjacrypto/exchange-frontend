import React, { Component } from 'react';
import { TwoCols } from 'pages/Generics';
import { Withdrawal } from 'pages/Wallet';
import { WithdrawalHistoryTable } from 'containers/Tables';
import { withNamespaces } from 'react-i18next';

import { Box } from 'components/Wrapped';
import { BoxHeading } from 'components/Helpers';

class WithdrawalOverview extends Component {
  state = {
    currency: '',
  };

  withdrawalAddress() {
    return <Withdrawal />;
  }

  withdrawalHistory() {
    const { t } = this.props;

    return (
      <Box background="background-3" pad="none">
        <BoxHeading level={3}>{t('wallet.deposits.history')}</BoxHeading>
        <Box pad="medium">
          <WithdrawalHistoryTable />
        </Box>
      </Box>
    );
  }

  render() {
    return (
      <TwoCols
        leftCol={this.withdrawalAddress()}
        rightCol={this.withdrawalHistory()}
      />
    );
  }
}

export default withNamespaces()(WithdrawalOverview);
