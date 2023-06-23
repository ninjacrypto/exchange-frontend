import React from 'react';

import { UserOrderHistoryTable } from 'containers/Tables';

class UserTradeHistory extends React.Component {
  render() {
    return (
      <React.Fragment>
        <UserOrderHistoryTable />
      </React.Fragment>
    )
  }
}

export default UserTradeHistory;