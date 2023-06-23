import * as React from 'react';
import { Route, withRouter } from 'react-router-dom';

import { PageWrap } from 'components/Containers';
import { CurrencyOverview } from 'pages/Currencies';
import { CurrenciesTable } from 'containers/Tables';

class Currencies extends React.Component {
  render() {
    return (
      <PageWrap>
        <Route path="/currencies/" exact component={CurrenciesTable} />
        <Route path="/currencies/:symbol" component={CurrencyOverview} />
      </PageWrap>
    );
  }
}

export default withRouter(Currencies);
