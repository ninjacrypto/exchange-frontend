import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';

import { triggerToast } from 'redux/actions/ui';
import { IconOption, IconValue } from 'components/Form';
import {
  generateDepositAddress,
  getDepositHistory,
} from 'redux/actions/portfolio';
import { ReactSelect } from 'components/Form/SelectField';

const currencyEnabled = {
  deposits: 'depositEnabled',
  withdrawals: 'withdrawalEnabled',
};

class Deposit extends React.Component {
  state = {
    selectedOption: { value: '', label: '' },
  };

  static propTypes = {
    onCurrencySelected: PropTypes.func.isRequired,
    redirectType: PropTypes.oneOf(['deposits', 'withdrawals']),
  };

  componentDidMount() {
    const {
      match: {
        params: { currency },
      },
    } = this.props;

    this.handleChange(this.getCurrencyOption(currency));
  }

  handleChange = selectedOption => {
    const currencyInfo = this.getCurrencyInfo(selectedOption.value);

    this.setState({ selectedOption });
    this.props.onCurrencySelected({ selectedOption, currencyInfo });
  };

  getCurrencyInfo(currency) {
    const { currencySettings } = this.props;
    const currencyInfo = _.get(currencySettings, currency);

    return currencyInfo;
  }

  getCurrencyOption(currency) {
    const { redirectType, t } = this.props;
    const currencyInfo = this.getCurrencyInfo(currency);
    let label;

    const enabled = _.get(
      currencyInfo,
      `${currencyEnabled}.${redirectType}`,
      true,
    );

    switch (currency) {
      case 'ALL':
        label = t('wallet.generic.all');
        break;
      case 'ALLC':
        label = t('wallet.generic.allCrypto');
        break;
      case 'ALLF':
        label = t('wallet.generic.allFiat');
        break;
      default:
        label = `${currencyInfo.fullName} (${currency})`;
        break;
    }

    return {
      value: currency,
      label,
      enabled,
    };
  }

  renderCurrencyOptions() {
    const { currencySettings, redirectType, enableCryptoFeatures } = this.props;

    const options = _.sortBy(
      Object.values(currencySettings),
      'fullName',
    ).map(({ shortName: currency }) => this.getCurrencyOption(currency));

    if (redirectType === 'deposits' && enableCryptoFeatures) {
      options.unshift(
        this.getCurrencyOption('ALLC'),
        this.getCurrencyOption('ALLF'),
      );
    } else if (redirectType === 'withdrawals') {
      options.unshift(this.getCurrencyOption('ALL'));
    }

    return _.filter(options, ['enabled', true]);
  }

  render() {
    const { selectedOption } = this.state;
    const {
      match: {
        params: { currency },
        path,
      },
      redirectType,
    } = this.props;

    return (
      <React.Fragment>
        {currency !== selectedOption.value && selectedOption.value !== '' && (
          <Redirect
            to={`/${path.split('/')[1]}/${redirectType}/${selectedOption.value}`}
            push
          />
        )}

        <ReactSelect
          options={this.renderCurrencyOptions()}
          onChange={this.handleChange}
          value={selectedOption}
          components={{ Option: IconOption, SingleValue: IconValue }}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({
  markets: { currencies },
  exchangeSettings: {
    currencySettings,
    settings: { enableCryptoFeatures },
  },
}) => ({
  currencies,
  currencySettings,
  enableCryptoFeatures,
});

export default withRouter(
  withNamespaces()(
    connect(mapStateToProps, {
      generateDepositAddress,
      getDepositHistory,
      triggerToast,
    })(Deposit),
  ),
);
