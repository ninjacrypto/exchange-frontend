import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Authenticated } from 'components/RestrictedRoutes';
import { MenuPage } from 'pages/Generics';
import { DerivativesOverview } from 'pages/Derivatives';
import { loadProfile } from 'redux/actions/profile';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';

class Derivatives extends React.Component {
  componentDidMount() {

  }

  menuArea() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'derivatives');

    return [
      {
        children: t('overview.link'),
        exact: true,
        to: '/derivatives',
      }
    ];
  }

  contentArea = () => {
    return (
      <React.Fragment>
        <Authenticated path="/derivatives/" exact component={DerivativesOverview} />
      </React.Fragment>
    );
  };

  render() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'derivatives');

    return (
      <React.Fragment>
        <Helmet>
          <title>{t('pageTitle')}</title>
        </Helmet>
        <MenuPage
          menuArea={this.menuArea()}
          contentArea={this.contentArea}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ user: { tradingDiscountTiers }, exchangeSettings: { settings } }) => ({
  tradingDiscountTiers,
  exchangeSettings: settings,
});

const DerivativesContainer = withRouter(
  withNamespaces()(
    connect(
      mapStateToProps,
      {
        loadProfile,
      },
    )(Derivatives),
  ),
);

export default DerivativesContainer;