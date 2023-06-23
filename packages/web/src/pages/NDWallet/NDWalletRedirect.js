import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';

import { Loading } from 'components/Loading';
import { Message } from 'components/Wrapped';

export class NDWalletRedirect extends React.PureComponent {
  findFirstEnabledCurrency() {
    const { baseRoute, currencySettings } = this.props;
    const sortedCurrencies = _.sortBy(currencySettings, 'shortName');

    const currencyInfo = _.find(Object.values(sortedCurrencies), [`${_.trimEnd(baseRoute, 's')}Enabled`, true])

    return currencyInfo;
  }

  renderRedirectOrError() {
    const { baseRoute, t, enableCryptoFeatures } = this.props;
    let currency = baseRoute === 'deposits' ? 'ALLC' : 'ALL';

    if (!enableCryptoFeatures && baseRoute === 'deposits') {
      currency = this.findFirstEnabledCurrency().shortName;
    }

    return (
      'ALL' ?
      <Redirect to={`/NDWallet/${baseRoute}/${currency}`} /> :
      <Message background="status-error">
        {t(`NDWallet.redirect.${baseRoute}Error`)}
      </Message>
    )
  }

  render() {
    const { isLoading, currencySettings } = this.props;

    return (
      <React.Fragment>
        {!isLoading && !_.isEmpty(currencySettings) ? (
          this.renderRedirectOrError()
        ) : (
          <Loading />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ exchangeSettings: { currencySettings, isCurrencySettingsLoading, settings: { enableCryptoFeatures } } }) => ({
  isLoading: isCurrencySettingsLoading,
  currencySettings,
  enableCryptoFeatures,
});

export default withNamespaces()(connect(mapStateToProps)(NDWalletRedirect));
