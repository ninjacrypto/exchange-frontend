import React from 'react';

import { WalletOrderHistoryTable } from 'containers/Tables';

class WalletOrderHistory extends React.Component {
  render() {
    return (
      <React.Fragment>
        <WalletOrderHistoryTable />
      </React.Fragment>
    )
  }
}

export default WalletOrderHistory;