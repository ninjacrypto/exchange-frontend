import _ from 'lodash';
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { TableWrapper } from 'containers/Tables';

import { Loading } from 'components/Loading';
import { Button, Box, Text, CheckBox } from 'components/Wrapped';

import { withNamespaces, Trans } from 'react-i18next';
import { nestedTranslate, formatCrypto } from 'utils';

class ConvertFundsTable extends PureComponent {
  state = {
    currenciesToConvert: [],
  };

  calculateConvertedFunds() {
    const { currencies } = this.props;
    const { currenciesToConvert } = this.state;

    const convertedFunds = currencies
      .filter(({ currency }) => currenciesToConvert.includes(currency))
      .reduce(
        (currentBalance, { balanceInEXT: nextBalance }) =>
          currentBalance + nextBalance,
        0,
      );

    return convertedFunds;
  }

  convertFunds = () => {
    const { convertFunds } = this.props;
    const { currenciesToConvert } = this.state;

    convertFunds(currenciesToConvert);
    this.setState({ currenciesToConvert: [] });
  };

  renderValidData() {
    const { currencies } = this.props;

    return currencies.filter(({ balanceInEXT }) => balanceInEXT !== 0);
  }

  renderCheckBox = ({ original: { currency, balanceInEXT } }) => {
    const { currenciesToConvert } = this.state;
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'tables.convertFunds');

    const addCurrency = currency =>
      this.setState({
        currenciesToConvert: [...currenciesToConvert, currency],
      });

    const removeCurrency = currency =>
      this.setState({
        currenciesToConvert: currenciesToConvert.filter(
          curr => currency !== curr,
        ),
      });

    return (
      <CheckBox
        label={t('checkBoxLabel')}
        name={currency}
        disabled={!!!balanceInEXT}
        onChange={checked =>
          checked ? addCurrency(currency) : removeCurrency(currency)
        }
      />
    );
  };

  render() {
    const { currenciesToConvert } = this.state;
    const { t: translate, exchangeToken } = this.props;
    const t = nestedTranslate(translate, 'tables.convertFunds');

    const currencies = this.renderValidData();
    const numCurrencies = currenciesToConvert.length;
    const numFunds = formatCrypto(this.calculateConvertedFunds());
    const token = exchangeToken;

    return (
      <Fragment>
        {currencies ? (
          <Fragment>
            <TableWrapper
              data={currencies}
              columns={[
                {
                  Header: t('selectChoices'),
                  accessor: 'Checkbox',
                  Cell: this.renderCheckBox,
                },
                {
                  Header: t('coin'),
                  accessor: 'currency',
                },
                {
                  Header: t('availableBalance'),
                  accessor: 'balance',
                  Cell: ({ value }) => formatCrypto(value),
                },
                {
                  Header: t('btcValue'),
                  accessor: 'balanceInBTC',
                  Cell: ({ value }) => formatCrypto(value),
                },
                {
                  Header: t('extValue', { token }),
                  accessor: 'balanceInEXT',
                  Cell: ({ value }) => formatCrypto(value),
                },
              ]}
              showPagination={true}
              minRows={3}
              pageSize={10}
              style={{ fontSize: '14px' }}
            />
            <Box>
              <Text margin={{ bottom: 'small' }}>
                {!_.isEmpty(currencies) ? (
                  <Trans
                    i18nKey={'wallet.convertFunds.message'}
                    values={{
                      numCurrencies,
                      numFunds,
                      token,
                    }}
                  >
                    L<strong>M</strong>
                    <strong>O</strong>.
                  </Trans>
                ) : (
                  t('noCurrencies')
                )}
              </Text>
              <Button
                onClick={this.convertFunds}
                disabled={currencies.length === 0}
              >
                {t('button')}
              </Button>
            </Box>
          </Fragment>
        ) : (
          <Loading />
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = ({
  exchangeSettings: {
    settings: { exchangeToken },
  },
}) => ({
  exchangeToken,
});

export default withNamespaces()(
  connect(
    mapStateToProps,
    null,
  )(ConvertFundsTable),
);
