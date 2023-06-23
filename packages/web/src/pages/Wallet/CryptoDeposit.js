import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { handleCopyToClipboard } from 'utils';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import QRCode from 'qrcode.react';
import { triggerToast } from 'redux/actions/ui';
import { generateDepositAddress } from 'redux/actions/portfolio';
import styles from './Wallet.module.scss';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';

import {
  Box,
  Button,
  Columns,
  Column,
  Tag,
  Heading,
  Text,
} from 'components/Wrapped';

const DepositRow = props => {
  const { label, address, copyLabel } = props;

  return (
    <Box fill="horizontal" pad="none">
      <Columns>
        <Column width={[1, 1, 1 / 6]}>
          <Box pad="none" align="center" justify="center" fill={true}>
            <Text className={styles.depositAddressLabel}>{label}</Text>
          </Box>
        </Column>
        <Column width={[1, 1, 2 / 3]}>
          <Tag background="background-5" className={styles.depositAddress}>
            {address}
          </Tag>
        </Column>
        <Column width={[1, 1, 1 / 6]}>
          <Button
            size="small"
            color="primary"
            onClick={() => handleCopyToClipboard(address)}
            fill="horizontal"
          >
            {copyLabel}
          </Button>
        </Column>
      </Columns>
    </Box>
  );
};

class Deposit extends Component {
  static propTypes = {
    currency: PropTypes.string.isRequired,
    currencyInfo: PropTypes.object.isRequired,
  };

  generateNewDepositAddress(currency) {
    this.props.generateDepositAddress(currency);
  }

  render() {
    const {
      addresses,
      currency,
      isGeneratingAddress,
      t: translate,
      currencyInfo,
    } = this.props;

    const hasAddressTag = !_.isEmpty(currencyInfo.addressSeparator);

    let taggedAddress = '';

    let isValidAddress = _.get(addresses, currency.toLowerCase());

    let destinationTag;

    // Destination tag is not separated when coming from BitGo
    if (hasAddressTag && isValidAddress) {
      [taggedAddress, isValidAddress] = isValidAddress.split(
        new RegExp(`\\${currencyInfo.addressSeparator}`, 'i'),
      );
      destinationTag = isValidAddress;
    }

    const t = nestedTranslate(translate, 'wallet.deposits');

    return (
      <React.Fragment>
        <Box className={styles.depositAddressWrap} align="center">
          <Heading level={3} color="primary" margin="small">
            {currencyInfo.fullName} ({currency})
          </Heading>
          {isValidAddress && (
            <Box pad="small" margin="small" background="white">
              <QRCode
                value={_.get(addresses, currency.toLowerCase())}
                size={175}
              />
            </Box>
          )}
          {isValidAddress && hasAddressTag && (
            <DepositRow
              label={t('depositAddress')}
              address={taggedAddress}
              copyLabel={translate('buttons.copy')}
            />
          )}
            {!isValidAddress &&
              currency !== (addresses && addresses[currency]) && (
                <Box pad="none" align="center" fill={true}>
                  <Button
                    color="primary"
                    className={styles.depositAddressButton}
                    onClick={() =>
                      this.generateNewDepositAddress(currency.toLowerCase())
                    }
                    disabled={isGeneratingAddress}
                    loading={isGeneratingAddress}
                  >
                    {t('button')}
                  </Button>
                </Box>
              )}
          {isValidAddress && (
            <DepositRow
              label={destinationTag ? t('destinationTag') : t('depositAddress')}
              address={isValidAddress}
              copyLabel={translate('buttons.copy')}
            />
          )}
        </Box>
        <Box>
          <ul className={styles.disclaimerList}>
            <li>{t('disclaimerFirst', { currency })}</li>
            <li>{t('disclaimerSecond', { currency })}</li>
            <li>
              {t('disclaimerThird', {
                confirmations: currencyInfo.confirmationCount,
                currencyName: currencyInfo.fullName,
              })}
            </li>
            {t(`currencyDisclaimer.${currency}`, '') && (
              <li>{t(`currencyDisclaimer.${currency}`)}</li>
            )}
          </ul>
        </Box>
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ portfolio, exchangeSettings }) => ({
  addresses: portfolio.addresses,
  isGeneratingAddress: portfolio.isGeneratingAddress,
  settings: exchangeSettings.settings,
});

export default withRouter(
  withNamespaces()(
    connect(
      mapStateToProps,
      { generateDepositAddress, triggerToast },
    )(Deposit),
  ),
);
