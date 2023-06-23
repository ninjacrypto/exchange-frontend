import React from 'react';
import { TradingDiscountTable } from 'containers/Tables';
import { TradingDiscountProgress } from 'pages/Account';
import { Message } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';

const TradingDiscount = ({ t }) => {

  return (
    <React.Fragment>
      <TradingDiscountProgress />
      <Message background="background-4" margin={{ vertical: 'small' }}>
        {t('account.tradingDiscount.description')}
      </Message>
      <TradingDiscountTable />
    </React.Fragment>
  );
};

export default withNamespaces()(TradingDiscount);
