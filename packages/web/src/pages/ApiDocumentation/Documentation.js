import React from 'react';

import { Box, Heading, Text } from 'components/Wrapped';
import { Route, Link } from 'react-router-dom';
import { ApiDocumentation } from 'pages/ApiDocumentation';
import { PageWrap } from '../../components/Containers';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils';

const DocumentationDirectory = withNamespaces()(({ t: translate }) => {
  const t = nestedTranslate(translate, 'documentation');
  return (
    <PageWrap>
      <Box gap="small">
        <Heading level={2}>{t('title')}</Heading>
        <ul>
          <li>
            <Text>
              <Link to="/exchange-documentation/api">{t('redoc')}</Link>
            </Text>
          </li>
          <li>
            <Text>
              <Link to="/exchange-documentation/data-stream">
                {t('dataStream')}
              </Link>
            </Text>
          </li>
        </ul>
      </Box>
    </PageWrap>
  );
});

export const DocumentationRoutes = () => {
  return (
    <React.Fragment>
      <Route
        path="/exchange-documentation"
        exact
        component={DocumentationDirectory}
      />
      <Route
        path="/exchange-documentation/api"
        render={props => <ApiDocumentation {...props} type="redoc" />}
      />
      <Route
        path="/exchange-documentation/data-stream"
        render={props => <ApiDocumentation {...props} type="dataStream" />}
      />
    </React.Fragment>
  );
};
