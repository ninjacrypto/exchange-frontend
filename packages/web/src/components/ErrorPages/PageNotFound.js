import React from 'react';
import { PageWrap } from 'components/Containers';
import { Heading, Message } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils';

const PageNotFound = withNamespaces() ( ({ t: translate }) => {
  const t = nestedTranslate(translate, 'errorPages');
  return (
    <PageWrap justify="center" align="center">
      <Message background="background-2">
        <Heading level={1}>
          {t('pageNotFound')}
        </Heading>
      </Message>
    </PageWrap>
  );
},
);

export default PageNotFound;
