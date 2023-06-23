import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Box, Tag, Paragraph, Heading } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';

import { FiatWithdrawalManual, FiatWithdrawalACH } from 'pages/Wallet';
import { nestedTranslate } from '../../utils/strings';
import { ReactSelect } from 'components/Form/SelectField';
import { authenticatedInstance } from 'api';

import { Requires2FA } from 'containers/Requires2FA';
import { ConditionalWrapper } from 'components/Helpers';

import {
  formatNumberToPlaces,
  trimNumber,
} from 'utils';

const FIAT_MANUAL = 'Fiat-Manual';
const FIAT_PAYMENT_GATEWAY = 'Fiat-PG';
const FIAT_ACH = 'Fiat-ACH';
const FIXED = 'Fixed';
const PERCENTAGE = 'Percentage';

class Withdrawal extends React.Component {

  constructor(props) {
    super(props);
    this.changePaymentMethod = this.changePaymentMethod.bind(this);
  }

  state = {
    selectedOption: { value: '', label: '' },
    isCheckbook: false,
    currencyInfo: {},
  };

  static propTypes = {
    currency: PropTypes.string,
    currencyInfo: PropTypes.object,
  };

  isFiat() {
    const { currencyInfo } = this.state;
    const walletType = _.get(currencyInfo, 'walletType');

    return walletType ? _.includes(walletType, 'Fiat') : false;
  }

  async getPgList() {
    const { currency } = this.props;

    try {
      const { data } = await authenticatedInstance({
        url: `/api/Get_Fiat_PGs`,
        method: 'GET',
        data: {
          Currency: currency,
          Method: 'withdraw'
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
        { value: FIAT_ACH, label: t('ACH') },
      ];
    } else {
      return [
        { value: '', label: translate('forms.common.select') },
        { value: FIAT_MANUAL, label: t('bank') },
      ];
    }
  }

  // renderWithdrawalServiceCharge() {
  //   const {
  //     currencyInfo,
  //     selectedOption: { value: currency },
  //   } = this.state;
  //   const withdrawalServiceChargeType = _.get(
  //     currencyInfo,
  //     'withdrawalServiceChargeType',
  //   );
  //   const withdrawalServiceCharge = formatNumberToPlaces(
  //     _.get(currencyInfo, 'withdrawalServiceCharge'),
  //   );

  //   switch (withdrawalServiceChargeType) {
  //     case FIXED:
  //       return `${withdrawalServiceCharge} ${currency}`;
  //     case PERCENTAGE:
  //       return `${withdrawalServiceCharge}%`;
  //     default:
  //       return '';
  //   }
  // }

  renderWithdrawalComponent() {
    const {
      selectedOption: { value: paymentType },
    } = this.state;

    const { calculateServiceCharge, currency, currencyInfo, balanceInfo, decimalPrecision } = this.props;


    switch (paymentType) {
      case FIAT_MANUAL:
        return (
          <FiatWithdrawalManual
            calculateServiceCharge={calculateServiceCharge}
            currency={currency}
            currencyInfo={currencyInfo}
            decimalPrecision={decimalPrecision}
            balanceInfo={balanceInfo}
            changePaymentMethod={this.changePaymentMethod}
          />
        );
      case FIAT_ACH:
        return (
          <FiatWithdrawalACH
            calculateServiceCharge={calculateServiceCharge}
            currency={currency}
            currencyInfo={currencyInfo}
            decimalPrecision={decimalPrecision}
            balanceInfo={balanceInfo}
          />
      );
      default:
        return <></>;
    }
  }

  changePaymentMethod() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'forms.fiatDeposit');

    let options = [
      { value: '', label: translate('forms.common.select') },
      { value: FIAT_MANUAL, label: t('bank') },
      { value: FIAT_ACH, label: t('ACH') },
    ];

    this.setState({
      selectedOption: options[0],
    });
  }

  render() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'forms.fiatWithdrawalManual');

    return (
      <React.Fragment>
        <Heading level={6}>{t('paymentMethod')}</Heading>
        <ReactSelect
          options={this.renderOptions()}
          onChange={this.handleChange}
          value={this.state.selectedOption}
        />
        {this.renderWithdrawalComponent()}
      </React.Fragment>
    );
  }
}

export const WithdrawalHeadingValue = ({ heading, value }) => (
  <p>
    {`${heading}: `}
    <strong>{value}</strong>
  </p>
);

const mapStateToProps = ({
  markets: { currencies },
  exchangeSettings: { currencySettings },
}) => ({
  currencies,
  currencySettings,
});

export default withRouter(withNamespaces()(connect(mapStateToProps)(Withdrawal)));
