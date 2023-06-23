import React from 'react';
import { Tab, Tabs } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';
import { PageWrap } from 'components/Containers';
import { TradingFeesTable, WithdrawalFeesTable } from 'containers/Tables';

const Fees = ({ t }) => {
  return (
    <PageWrap>
      <Tabs justify="start">
        <Tab title={t('tables.fees.tradingFeesTitle')}>
          <TradingFeesTable />
        </Tab>
        <Tab title={t('tables.fees.withdrawalFeesTitle')}>
          <WithdrawalFeesTable />
        </Tab>
      </Tabs>
    </PageWrap>
  );
};

export default withNamespaces()(Fees);
