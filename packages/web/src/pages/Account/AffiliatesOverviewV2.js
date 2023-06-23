import React from 'react';
import { isEmpty } from 'lodash';
import { withNamespaces } from 'react-i18next';
import { useQuery } from 'react-query';

import { exchangeApi } from 'api';
import { Tooltip } from 'components/Tooltip';
import {
  Box,
  Heading,
  Accordion,
  AccordionPanel,
  Text,
} from 'components/Wrapped';
import { FiatConverter } from 'containers/FiatConverter';
import {
  formatNumberToPlaces,
  handleCopyToClipboard,
  nestedTranslate,
} from 'utils';
import {
  ReferralAffiliatesTable,
  ReferralCommissionTable,
  TableWrapper,
} from 'containers/Tables';
import { CurrencyInfo } from 'components/CurrencyInfo';

const useAffiliateOverview = () => {
  return useQuery('affiliateOverview', () => exchangeApi.getAffiliateSummary());
};

const useAffiliateOverviewStats = () => {
  return useQuery('affiliateOverviewStats', () =>
    exchangeApi.getAffiliateSummaryStats(),
  );
};

const AffiliateCopyCode = ({ label, code, tooltip }) => {
  return (
    <Tooltip description={tooltip}>
      <Box pad="none" flex={false} onClick={() => handleCopyToClipboard(code)}>
        <Text>
          <Text weight="bold">{label}: </Text>
          {code}
        </Text>
      </Box>
    </Tooltip>
  );
};

const AffiliateLevel = ({ label, referrals, percent, t }) => {
  if (!percent) {
    return null;
  }

  return (
    <Box
      pad="small"
      background="background-2"
      margin="small"
      width="small"
      gap="xsmall"
    >
      <Text weight="bold">{label}</Text>
      <Text>
        {t('feeShare')}: {percent}%
      </Text>
      <Text>
        {t('referrals')}: {referrals}
      </Text>
    </Box>
  );
};

const AffiliateEarningsStat = ({ label, data = {} }) => {
  const { btcValue = 0, usdValue = 0 } = data;

  return (
    <Box
      pad="small"
      background="background-2"
      margin="small"
      width="small"
      gap="xsmall"
    >
      <Text weight="bold">{label}</Text>
      <Text>~{formatNumberToPlaces(btcValue)} BTC</Text>
      <Text>
        ~
        <FiatConverter
          isFiat={true}
          lastPrice={usdValue}
          market="USD"
          returnValue={true}
        />
      </Text>
    </Box>
  );
};

const AffiliateStatsTable = withNamespaces()(({ t: translate }) => {
  const t = nestedTranslate(translate, 'account.affiliates');
  const { data = { data: {} }, isLoading } = useAffiliateOverviewStats();
  const { earningsByCurrency } = data?.data;

  if (isLoading || isEmpty(earningsByCurrency)) {
    return null;
  }

  const tableData = Object.entries(earningsByCurrency).map(
    ([currency, data]) => ({
      currency: currency.toUpperCase(),
      '60d': data?.['60d'],
      '90d': data?.['90d'],
      '120d': data?.['120d'],
      allTime: data?.['allTime'],
    }),
  );

  const renderValue = ({ value, original: { currency } }) => {
    return `${formatNumberToPlaces(value)} ${currency}`;
  };

  return (
    <TableWrapper
      data={tableData}
      columns={[
        {
          Header: t('currency'),
          accessor: 'currency',
          Cell: ({ value }) => (
            <CurrencyInfo currency={value} onlyFullName={true} hasIcon={true} />
          ),
        },
        {
          Header: t('allTime'),
          accessor: 'allTime',
          Cell: renderValue,
        },
        {
          Header: t('60d'),
          accessor: '60d',
          Cell: renderValue,
        },
        {
          Header: t('90d'),
          accessor: '90d',
          Cell: renderValue,
        },
        {
          Header: t('120d'),
          accessor: '120d',
          Cell: renderValue,
        },
      ]}
      defaultSorted={[{
        id: 'currency'
      }]}
      pageSize={tableData.length}
      showPagination={false}
    />
  );
});

const AffiliateStats = withNamespaces()(({ t: translate }) => {
  const t = nestedTranslate(translate, 'account.affiliates');

  const { data = { data: {} } } = useAffiliateOverviewStats();

  const { totalEarnings = {} } = data?.data;

  return (
    <>
      <Box pad="none" direction="row" wrap={true} justify="center">
        {['allTime', '60d', '90d', '120d'].map(value => (
          <AffiliateEarningsStat
            key={value}
            label={t(value)}
            data={totalEarnings?.[value]}
          />
        ))}
      </Box>
    </>
  );
});

export const AffiliatesOverviewV2 = withNamespaces()(({ t: translate }) => {
  const t = nestedTranslate(translate, 'account.affiliates');
  const { data = { data: {} } } = useAffiliateOverview();

  const {
    referralID = '---',
    referralLink = '---',
    // r_Level_1 = 0,
    // r_Level_1_Perc = 0,
    // r_Level_2 = 0,
    r_Level_2_Perc = 0,
    // r_Level_3 = 0,
    r_Level_3_Perc = 0,
  } = data?.data;

  // const totalReferrals = r_Level_1 + r_Level_2 + r_Level_3;

  return (
    <Box pad="none" gap="small" flex={false}>
      <AffiliateCopyCode
        label={t('referralLink')}
        code={referralLink}
        tooltip={t('copyLink')}
      />
      <AffiliateCopyCode
        label={t('referralCode')}
        code={referralID}
        tooltip={t('copyLink')}
      />
      <Box gap="small" background="background-2">
        <Text>{t('shareLink')}</Text>
        {(r_Level_2_Perc || r_Level_3_Perc) ? (
          <Text>{t('multipleTiers')}</Text>
        ) : null}
      </Box>
      <Box pad="none" gap="small">
        <Heading level={3}>{t('tiers')}</Heading>
        <Box pad="none" direction="row" wrap={true} justify="center">
          {[1, 2, 3].map(value => (
            <AffiliateLevel
              key={value}
              label={t(`rLevel${value}`)}
              percent={data?.data?.[`r_Level_${value}_Perc`]}
              referrals={data?.data?.[`r_Level_${value}`]}
              t={t}
            />
          ))}
        </Box>
      </Box>
      <Box pad="none" gap="small">
        <Heading level={3}>{t('earnings')}</Heading>
        <AffiliateStats />
        <AffiliateStatsTable />
      </Box>
      <Accordion>
        <AccordionPanel label={t('commission')}>
          <ReferralCommissionTable />
        </AccordionPanel>
      </Accordion>
      <Accordion>
        <AccordionPanel label={t('usersReferred')}>
          <ReferralAffiliatesTable />
        </AccordionPanel>
      </Accordion>
    </Box>
  );
});
