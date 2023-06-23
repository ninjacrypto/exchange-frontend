import React from 'react';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { withNamespaces } from 'react-i18next';

import { Box, Meter, Text } from 'components/Wrapped';
import { nestedTranslate } from 'utils/strings';

const TradingDiscountProgress = ({ t: translate, showTitle = false }) => {
  const t = nestedTranslate(translate, 'account.tradingDiscount');
  const tradingDiscountTiers = useSelector(
    ({ user: { tradingDiscountTiers } }) => tradingDiscountTiers,
  );

  if (tradingDiscountTiers.length === 0) {
    return null;
  }

  const currentTierIndex = _.findIndex(tradingDiscountTiers, 'isActive');
  const hasMaxTier = currentTierIndex === tradingDiscountTiers.length - 1;
  const currentTier = tradingDiscountTiers[currentTierIndex];
  const showTier = hasMaxTier
    ? tradingDiscountTiers[currentTierIndex - 1]
    : tradingDiscountTiers[currentTierIndex + 1];

  return (
    <Box pad="small" background="background-4" margin={{ bottom: 'small' }}>
      {showTitle && <Text weight="bold">{t('title')}</Text>}
      <Box direction="row" pad="none" justify="between" align="end">
        <Text>
          {`${currentTier.tradedVolume} ${currentTier.currency}`}
          <Text margin={{ left: 'xsmall' }}>
            ({t('discountValue', { percent: currentTier.discount })})
          </Text>
        </Text>
        <Text>
          {`${
            hasMaxTier
              ? currentTier.tradedVolumeLimit
              : showTier.tradedVolumeLimit
          } ${currentTier.currency}`}
        </Text>
      </Box>
      <Meter
        size="full"
        values={[
          {
            value: (showTier.tradedVolume / showTier.tradedVolumeLimit) * 100,
            color: 'primary',
          },
        ]}
      />
      <Box direction="row" pad="none" justify="between">
        {hasMaxTier ? (
          <React.Fragment>
            <Text>{t('tier', { tier: showTier.tier })}</Text>
            <Text>{t('tier', { tier: currentTier.tier })}</Text>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Text>{t('tier', { tier: currentTier.tier })}</Text>
            <Text>{t('tier', { tier: showTier.tier })}</Text>
          </React.Fragment>
        )}
      </Box>
    </Box>
  );
};

export default withNamespaces()(TradingDiscountProgress);
