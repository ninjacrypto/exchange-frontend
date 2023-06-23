import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';

import { withNamespaces } from 'react-i18next';
import { formatNumberToPlaces } from 'utils/numbers';
import { PrettyNumberTZ } from 'components/Helpers';
import { Box, Text } from 'components/Wrapped';

const CreateOrderBalance = ({
  portfolios,
  mgokx,
  markets,
  balances,
  tradingPair,
  side,
  t,
}) => {
  const currency =
    side === 'BUY' ? tradingPair.quoteCurrency : tradingPair.baseCurrency;

  let balance = _.get(portfolios, `${currency}.balance`, 0);

  if (mgokx.enabled) {
    if (markets.prices[tradingPair.quoteCurrency][tradingPair.baseCurrency].isNDWallet) {
      balances.forEach(el => {
        if (el.currency == currency) {
          balance = el.trading_balance;
        }
      });
    }
  }

  return (
    <Box
      pad="none"
      direction="row"
      justify="between"
      margin={{ vertical: 'xsmall' }}
    >
      <Text size="inherit">{t('forms.coinBalance')}</Text>
      <Text size="inherit">
        <PrettyNumberTZ number={formatNumberToPlaces(balance)} /> {currency}
      </Text>
    </Box>
  );
};

CreateOrderBalance.propTypes = {
  tradingPair: PropTypes.shape({
    baseCurrency: PropTypes.string,
    quoteCurrency: PropTypes.string,
  }).isRequired,
  side: PropTypes.oneOf(['BUY', 'SELL']),
};

const mapStateToProps = ({ portfolio, markets, NDWalletData, exchangeSettings: { settings } }) => ({
  portfolios: portfolio.portfolios,
  markets: markets,
  balances: NDWalletData.balance,
  mgokx: settings.mgokx,
});

export default withNamespaces()(connect(mapStateToProps)(CreateOrderBalance));
