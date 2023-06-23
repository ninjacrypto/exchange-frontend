import React from 'react';

import { OpenOrdersTable } from 'containers/Tables';

class OpenOrders extends React.PureComponent {
  render() {
    return (
      <React.Fragment>
        <OpenOrdersTable />
      </React.Fragment>
    );
  }
}

export default OpenOrders;
