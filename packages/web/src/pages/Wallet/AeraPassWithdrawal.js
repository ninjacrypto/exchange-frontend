import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import { FormField, NumberInput, TextField } from 'components/Form';
import {
  getWithdrawalHistory,
  aeraPassWithdrawalRequest,
} from 'redux/actions/portfolio';
import { formatCrypto } from 'utils';
import { ConfirmModal } from 'containers/Modals';
import { nestedTranslate } from 'utils/strings';
import { withNamespaces } from 'react-i18next';
import { WithdrawalHeadingValue } from './Withdrawal';
import { Button } from 'components/Wrapped';

class AeraPassWithdrawal extends Component {
  static propTypes = {
    currency: PropTypes.string.isRequired,
    currencyInfo: PropTypes.object.isRequired,
  };

  state = {
    modalOpen: false,
  };

  closeModal = () => {
    this.setState({
      modalOpen: false,
    });
  };

  confirmWithdrawal = (values, resetForm) => {
    this.props.aeraPassWithdrawalRequest(
      { ...values },
      { cb: () => resetForm() },
    );
    this.closeModal();
  };

  validationSchema = () => {
    const { currencyInfo } = this.props;

    return Yup.object().shape({
      amount: Yup.number()
        .min(currencyInfo.minWithdrawalLimit)
        .required(),
      gauth_code: Yup.string()
        .required()
        .min(6),
    });
  };

  render() {
    const {
      match: {
        params: { currency },
      },
      portfolios,
      currencyInfo,
      calculateServiceCharge,
      decimalPrecision,
      t: translate,
    } = this.props;

    const t = nestedTranslate(translate, 'forms.walletWithdrawal');

    const balance = _.get(portfolios, `${currency}.balance`, 0);

    return (
      <React.Fragment>
        {!_.isEmpty(currencyInfo) ? (
          <Formik
            validationSchema={this.validationSchema()}
            initialValues={{
              amount: '',
              gauth_code: '',
            }}
            onSubmit={(values, actions) => {
              this.setState({
                modalOpen: true,
              });
            }}
          >
            {({ values, setFieldValue, resetForm }) => {
              const {
                serviceCharge,
                balanceAfter,
                willReceive,
              } = calculateServiceCharge(balance, values.amount);

              return (
                <Form>
                  <FormField name="amount" label={t('amount.placeholder')}>
                    <NumberInput
                      type="text"
                      addonEnd={{
                        content: `${formatCrypto(balance, true)} ${currency}`,
                        onClick: () => setFieldValue('amount', balance),
                        background: 'primary',
                      }}
                      precision={decimalPrecision}
                    />
                  </FormField>

                  <FormField
                    name="gauth_code"
                    label={translate('forms.common.gAuth')}
                  >
                    <TextField
                      type="text"
                      placeholder={translate('forms.common.gAuth')}
                    />
                  </FormField>
                  <WithdrawalHeadingValue
                    heading={translate('wallet.withdrawals.serviceCharge')}
                    value={formatCrypto(serviceCharge)}
                  />

                  <WithdrawalHeadingValue
                    heading={translate('wallet.withdrawals.willReceive')}
                    value={formatCrypto(willReceive)}
                  />

                  <WithdrawalHeadingValue
                    heading={translate('wallet.withdrawals.balanceAfter')}
                    value={`${formatCrypto(balanceAfter)}
                        ${currency}`}
                  />

                  <Button fill="horizontal" color="primary" type="submit">
                    {translate('buttons.submit')}
                  </Button>

                  <ConfirmModal
                    show={this.state.modalOpen}
                    onClose={this.closeModal}
                    confirm={() =>
                      this.confirmWithdrawal(
                        {
                          ...values,
                          amount: willReceive,
                          currency,
                        },
                        resetForm,
                      )
                    }
                    title={t('confirmWithdrawal')}
                  >
                    <WithdrawalHeadingValue
                      heading={translate(
                        'wallet.withdrawals.withdrawalAddress',
                      )}
                      value={values.address}
                    />

                    {this.hasAddressTag && (
                      <WithdrawalHeadingValue
                        heading={translate('wallet.withdrawals.withdrawalTag')}
                        value={values.addressTag}
                      />
                    )}

                    <WithdrawalHeadingValue
                      heading={translate('wallet.withdrawals.withdrawalAmount')}
                      value={`${values.amount} ${currency}`}
                    />

                    <WithdrawalHeadingValue
                      heading={translate('wallet.withdrawals.serviceCharge')}
                      value={formatCrypto(serviceCharge)}
                    />

                    <WithdrawalHeadingValue
                      heading={translate('wallet.withdrawals.willReceive')}
                      value={formatCrypto(willReceive)}
                    />

                    <WithdrawalHeadingValue
                      heading={translate('wallet.withdrawals.balanceAfter')}
                      value={`${formatCrypto(balanceAfter)}
                        ${currency}`}
                    />
                  </ConfirmModal>
                </Form>
              );
            }}
          </Formik>
        ) : null}
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ markets, portfolio, exchangeSettings }) => ({
  coins: markets.currencies,
  addresses: portfolio.addresses,
  portfolios: portfolio.portfolios,
});

export default withRouter(
  withNamespaces()(
    connect(mapStateToProps, {
      getWithdrawalHistory,
      aeraPassWithdrawalRequest,
    })(AeraPassWithdrawal),
  ),
);
