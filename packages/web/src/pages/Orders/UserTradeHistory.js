import React from 'react';

import { UserTradeHistoryTable } from 'containers/Tables';

class UserTradeHistory extends React.Component {
  render() {
    return (
      <React.Fragment>
        <UserTradeHistoryTable />
      </React.Fragment>
    )
  }
}

export default UserTradeHistory;