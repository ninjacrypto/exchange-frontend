import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Heading } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';

import { FiatDepositManual, FiatDepositPg, FiatDepositACH } from 'pages/Wallet';
import { nestedTranslate } from '../../utils/strings';
import { ReactSelect } from 'components/Form/SelectField';
import { authenticatedInstance } from 'api';

const FIAT_MANUAL = 'Fiat-Manual';
const FIAT_PAYMENT_GATEWAY = 'Fiat-PG';
const FIAT_ACH = 'Fiat-ACH';

class Deposit extends React.Component {
  state = {
    selectedOption: { value: '', label: '' },
    isCheckbook: false,
  };

  static propTypes = {
    currency: PropTypes.string,
    currencyInfo: PropTypes.object,
  };

  async getPgList() {
    const { currency } = this.props;

    try {
      const { data } = await authenticatedInstance({
        url: `/api/Get_Fiat_PGs`,
        method: 'GET',
        data: {
          Currency: currency,
        },
      });

      if (data.data.length > 0 && data.data !== undefined && data.data !== null) {
        let isFound = false;
        data.data.forEach(element => {
          if (element.pG_Name.toLowerCase() === "checkbook") {
            this.setState({ isCheckbook: true });
            isFound = true;
          }
        });

        if (!isFound) {
          this.setState({ isCheckbook: false });
        }

      } else {
        this.setState({ isCheckbook: false });
      }


    } catch (e) {}
  }

  componentDidMount() {
    this.getPgList();
    this.setState({
      selectedOption: this.renderOptions()[0],
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.currency !== prevProps.currency) {
      this.getPgList();
    }
  }

  handleChange = selectedOption => {
    this.setState({ selectedOption });
  };

  renderOptions() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'forms.fiatDeposit');

    if (this.state.isCheckbook) {
      return [
        { value: '', label: translate('forms.common.select') },
        { value: FIAT_MANUAL, label: t('bank') },
        { value: FIAT_PAYMENT_GATEWAY, label: t('online') },
        { value: FIAT_ACH, label: t('ACH') },
      ];
    } else {
      return [
        { value: '', label: translate('forms.common.select') },
        { value: FIAT_MANUAL, label: t('bank') },
        { value: FIAT_PAYMENT_GATEWAY, label: t('online') },
      ];
    }
  }

  renderDepositComponent() {
    const {
      selectedOption: { value: paymentType },
    } = this.state;

    const { currency, currencyInfo, decimalPrecision } = this.props;

    switch (paymentType) {
      case FIAT_MANUAL:
        return (
          <FiatDepositManual
            currency={currency}
            currencyInfo={currencyInfo}
            decimalPrecision={decimalPrecision}
          />
        );
      case FIAT_PAYMENT_GATEWAY:
        return (
          <FiatDepositPg
            currency={currency}
            currencyInfo={currencyInfo}
            decimalPrecision={decimalPrecision}
          />
        );
        case FIAT_ACH:
          return (
            <FiatDepositACH
              currency={currency}
              currencyInfo={currencyInfo}
              decimalPrecision={decimalPrecision}
            />
        );
      default:
        return <></>;
    }
  }

  render() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'forms.fiatDeposit');

    return (
      <React.Fragment>
        <Heading level={6}>{t('paymentMethod')}</Heading>
        <ReactSelect
          options={this.renderOptions()}
          onChange={this.handleChange}
          value={this.state.selectedOption}
        />
        {this.renderDepositComponent()}
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({
  markets: { currencies },
  exchangeSettings: { currencySettings },
}) => ({
  currencies,
  currencySettings,
});

export default withRouter(withNamespaces()(connect(mapStateToProps)(Deposit)));
