import _ from 'lodash';
import React from 'react';
import { CryptoIcon } from 'components/CryptoIcon';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { StatusInfo } from 'grommet-icons';
import { Box, Text } from 'components/Wrapped';
import styles from './currency.module.scss';

const CurrencyInfo = ({
  currency,
  currencies,
  hasFullName,
  onlyFullName,
  hasIcon,
}) => {
  const currencyName = () => {
    const currencyName = _.get(currencies, `${currency}.fullName`);

    if (currencyName && onlyFullName) {
      return currencyName;
    }

    return hasFullName && currencyName
      ? `${currency} (${currencyName})`
      : currency;
  };

  const isFiat = _.startsWith(
    _.get(currencies[currency], 'walletType'),
    'Fiat',
  );

  const isSecurityToken =
    _.get(currencies, `${currency}.walletType`) === 'SecurityToken';

  const currencyInfo =
    !isFiat && !isSecurityToken ? (
      <Box
        pad="none"
        direction="row"
        gap="xsmall"
        align="center"
        className={styles.flxflow}
      >
        {hasIcon && <CryptoIcon currency={currency} margin="none" />}
        <Text color="text" hoverColor="primary">
          {currencyName()}
        </Text>
        <Link to={`/currencies/${currency}`}>
          <StatusInfo size="12px" />
        </Link>
      </Box>
    ) : (
      <Box
        pad="none"
        direction="row"
        gap="xsmall"
        align="center"
        className={styles.flxflow}
      >
        {hasIcon && <CryptoIcon currency={currency} margin="none" />}
        <Text>{currencyName()}</Text>
      </Box>
    );

  return currencyInfo;
};

const mapStateToProps = ({ exchangeSettings }) => ({
  currencies: exchangeSettings.currencySettings,
});

CurrencyInfo.propTypes = {
  currency: PropTypes.string.isRequired,
  currencies: PropTypes.object.isRequired,
  hasFullName: PropTypes.bool.isRequired,
  hasIcon: PropTypes.bool.isRequired,
};

CurrencyInfo.defaultProps = {
  hasIcon: false,
  hasFullName: false,
};

export default connect(mapStateToProps, null)(CurrencyInfo);
