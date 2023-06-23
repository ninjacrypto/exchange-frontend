import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { withNamespaces } from 'react-i18next';
import { CopyTrading, CopyTradingTrades } from 'pages/CopyTrading';

import { Authenticated } from 'components/RestrictedRoutes';
import { MenuPage } from 'pages/Generics';
import { namespaceTranslate } from 'utils';
import {
  checkCopyTradingEnrollmentStatus,
  getCopyTradingFollowing,
} from 'redux/actions/profile';
import { PageWrap } from 'components/Containers';

class CopyTradingMenu extends React.Component {
  menuArea() {
    const { t: translate } = this.props;
    const t = namespaceTranslate(translate, 'copy_trading');

    return [
      {
        children: t('copyTrading.link'),
        exact: true,
        to: '/copy-trading',
      },
      {
        children: t('trades.link'),
        to: '/copy-trading/trades',
      },
    ];
  }

  contentArea() {
    return (
      <React.Fragment>
        <Authenticated path="/copy-trading" exact component={CopyTrading} />
        <Authenticated
          path="/copy-trading/trades"
          component={CopyTradingTrades}
        />
      </React.Fragment>
    );
  }

  componentDidMount() {
    const {
      checkCopyTradingEnrollmentStatus,
      getCopyTradingFollowing,
    } = this.props;

    checkCopyTradingEnrollmentStatus();
    getCopyTradingFollowing();
  }

  render() {
    const { t: translate } = this.props;
    const t = namespaceTranslate(translate, 'copy_trading');

    return (
      <PageWrap>
        <Helmet>
          <title>{t('title')}</title>
        </Helmet>
        <MenuPage
          menuArea={this.menuArea()}
          contentArea={this.contentArea}
        />
      </PageWrap>
    );
  }
}

export default withRouter(
  withNamespaces(['translation', 'copy_trading'])(
    connect(
      null,
      { checkCopyTradingEnrollmentStatus, getCopyTradingFollowing },
    )(CopyTradingMenu),
  ),
);
