import _ from 'lodash';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import qs from 'qs';

import { SimplexOrder } from 'pages/Simplex';
import { Authenticated } from 'components/RestrictedRoutes';
import { MenuPage } from 'pages/Generics';

import { Helmet } from 'react-helmet';

import { withNamespaces } from 'react-i18next';
import { namespaceTranslate } from 'utils/strings';
import { triggerModalOpen } from 'redux/actions/ui';

class Simplex extends React.PureComponent {
  menuArea() {
    const { t: translate } = this.props;
    const t = namespaceTranslate(translate, 'simplex');

    return [
      {
        children: t('navigation.link'),
        to: '/credit-card',
        title: t('form.title'),
      },
    ];
  }

  contentArea() {
    return (
      <React.Fragment>
        <Authenticated path="/credit-card" exact component={SimplexOrder} />
      </React.Fragment>
    );
  }

  componentDidMount() {
    const { t, triggerModalOpen } = this.props;
    const { search } = window.location;

    const params = qs.parse(search, { ignoreQueryPrefix: true });

    if (_.get(params, 'payment')) {
      triggerModalOpen(t('navigation.simplexPaymentSuccess'));
    }
  }

  render() {
    const { t: translate } = this.props;
    const t = namespaceTranslate(translate, 'simplex');

    return (
      <React.Fragment>
        <Helmet>
          <title>{t('navigation.pageTitle')}</title>
        </Helmet>
        <MenuPage
          menuArea={this.menuArea()}
          contentArea={this.contentArea}
        />
      </React.Fragment>
    );
  }
}

export default withRouter(
  withNamespaces(['simplex'])(
    connect(
      null,
      { triggerModalOpen },
    )(Simplex),
  ),
);
