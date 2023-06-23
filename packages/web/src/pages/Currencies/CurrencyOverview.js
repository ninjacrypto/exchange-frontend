import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Level } from 'react-bulma-components';
import { withNamespaces } from 'react-i18next';

import { Box, Heading, Image, Markdown } from 'components/Wrapped';
import { formatFiat, formatNumberToPlaces } from 'utils';
import styles from './Currencies.module.scss';
import { nestedTranslate } from 'utils/strings';
import { moment } from 'i18n';

import { FiatConverter } from 'containers/FiatConverter';
import CurrencyPriceChart from './CurrencyPriceChart';

const CurrencyOverview = ({ currencies, match, t: translate }) => {
  const { symbol } = match.params;
  const currencyInfo = currencies[symbol.toLowerCase()] || undefined;

  const t = nestedTranslate(translate, 'currencies');

  return (
    <React.Fragment>
      {currencyInfo ? (
        <Box pad="none" gap="small">
          <Box background="background-2">
            <Box direction="row" pad="none" align="center">
              <Box
                height="50px"
                width="50px"
                pad="none"
                margin={{ horizontal: 'small' }}
              >
                <Image src={currencyInfo.image} />
              </Box>
              <Heading level={3}>
                {currencyInfo.coinName} ({currencyInfo.symbol})
              </Heading>
            </Box>
            <Level textAlignment="centered">
              <Level.Item className={styles.levelItem}>
                <div>
                  <Heading level={5}>{t('price')}</Heading>
                  <Heading level={3}>
                    {currencyInfo.price ? (
                      <FiatConverter
                        currency="USD"
                        walletBalance={currencyInfo.price}
                        returnValue={true}
                      />
                    ) : (
                      '-'
                    )}
                  </Heading>
                </div>
              </Level.Item>
              <Level.Item className={styles.levelItem}>
                <div>
                  <Heading level={5}>{t('marketCap')}</Heading>
                  <Heading level={3}>
                    {currencyInfo.marketCap ? (
                      <FiatConverter
                        currency="USD"
                        walletBalance={currencyInfo.marketCap}
                        returnValue={true}
                      />
                    ) : (
                      '-'
                    )}
                  </Heading>
                </div>
              </Level.Item>
              <Level.Item className={styles.levelItem}>
                <div>
                  <Heading level={5}>{t('circulatingSupply')}</Heading>
                  <Heading level={3}>
                    {currencyInfo.circulatingSupply
                      ? `${formatNumberToPlaces(
                          currencyInfo.circulatingSupply,
                          0,
                        )} ${currencyInfo.symbol}`
                      : '-'}
                  </Heading>
                </div>
              </Level.Item>
              <Level.Item className={styles.levelItem}>
                <div>
                  <Heading level={5}>{t('issueDate')}</Heading>
                  <Heading level={3}>
                    {currencyInfo.issueDate
                      ? moment(currencyInfo.issueDate).format('L')
                      : _.get(currencyInfo, 'additionalData.issueDate', '-')}
                  </Heading>
                </div>
              </Level.Item>
              <Level.Item className={styles.levelItem}>
                <div>
                  <Heading level={5}>{t('issuePrice')}</Heading>
                  <Heading level={3}>
                    {_.get(currencyInfo, 'additionalData.issuePrice')
                      ? formatFiat(currencyInfo.additionalData.issuePrice)
                      : '-'}
                  </Heading>
                </div>
              </Level.Item>
            </Level>
            <Markdown>{currencyInfo.description}</Markdown>
          </Box>
          <CurrencyPriceChart currency={symbol} />
        </Box>
      ) : (
        <p>{t('notFound')}</p>
      )}
    </React.Fragment>
  );
};

const mapStateToProps = ({ currencyData }) => ({
  currencies: currencyData.currencies,
});

export default withNamespaces()(connect(mapStateToProps)(CurrencyOverview));
