import React from 'react';
import { Heading, Box } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';
import { PageWrap } from 'components/Containers';
import { TradingRulesTable } from 'containers/Tables';

const TradingRules = ({ t }) => {
  return (
    <PageWrap>
      <Box gap="small">
        <Heading level={2}>{t('tables.tradingRules.title')}</Heading>
        <TradingRulesTable />
      </Box>
    </PageWrap>
  );
};

export default withNamespaces()(TradingRules);
