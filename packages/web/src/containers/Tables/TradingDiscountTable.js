import React from 'react';
import { useSelector } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Checkmark } from 'grommet-icons';


import { TableWrapper } from 'containers/Tables';
import { nestedTranslate } from 'utils/strings';

const TradingDiscount = ({ t: translate }) => {
  const t = nestedTranslate(translate, 'tables.tradingDiscount')
  const tradingDiscountTiers = useSelector(
    ({ user: { tradingDiscountTiers } }) => tradingDiscountTiers,
  );
  const currency = tradingDiscountTiers[0].currency;

  return (
    <TableWrapper
      data={tradingDiscountTiers}
      columns={[
        {
          Header: '',
          accessor: 'isActive',
          Cell: ({ value }) => value ? <Checkmark color="green" style={{ width: 25, height: 25 }} /> : null,
          minWidth: 30,
        },
        {
          Header: t('tierHeading'),
          accessor: 'tier',
          Cell: ({value}) => t('tier', { tier: value })
        },
        {
          Header: t('tradedVolumeLimit', { currency }),
          accessor: 'tradedVolumeLimit',
          Cell: ({ value }) => `${value} ${currency}`
        },
        {
          Header: t('discount'),
          accessor: 'discount',
          Cell: ({ value }) => `${value}%`
        }
      ]}
      minRows={tradingDiscountTiers.length}
      pageSize={tradingDiscountTiers.length}
      showPagination={false}
    />
  );
};

export default withNamespaces()(TradingDiscount);
