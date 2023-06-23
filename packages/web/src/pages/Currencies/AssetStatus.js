import React from 'react';
import { withNamespaces } from 'react-i18next';

import { AssetStatusTable } from 'containers/Tables';
import { PageWrap } from 'components/Containers';
import { Box, Heading } from 'components/Wrapped';

const AssetStatus = ({ t }) => {
  return (
    <PageWrap>
      <Box pad="none" gap="small">
        <Heading level={2}>{t('footer.assetStatus')}</Heading>
        <AssetStatusTable />
      </Box>
    </PageWrap>
  );
};

export default withNamespaces()(AssetStatus);
