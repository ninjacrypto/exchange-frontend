import * as React from 'react';
import { RedocStandalone } from 'redoc';
import { connect } from 'react-redux';
import styled from 'styled-components';

import documentation from 'assets/documentation.json';
import { withNamespaces } from 'react-i18next';
import { backendUrl } from 'setup';
// import { MarkdownDocumentation } from 'pages/ApiDocumentation';
import { SignalrDocumentation } from 'pages/ApiDocumentation';
import { Box, Text } from 'components/Wrapped';
import { Link } from 'react-router-dom';

documentation.servers[0].url = backendUrl;

const RedocWrapper = styled.div`
  background-color: white;

  .tag,
  .number {
    display: inline;
    padding: inherit;
    font-size: inherit;
    line-height: inherit;
    text-align: inherit;
    vertical-align: inherit;
    border-radius: inherit;
    font-weight: inherit;
    white-space: inherit;
    background: inherit;
    margin: inherit;
  }

  th {
    color: inherit;
  }
`;

const ApiDocumentation = ({ exchangeName, type = 'redoc', t, theme }) => {

  const getDocumentation = () => {
    documentation.servers[0].url = backendUrl;

    let documentationString = JSON.stringify(documentation);

    documentationString = documentationString.replace(
      'Bytedex-Exchange-',
      `${exchangeName} `,
    );
    documentationString = documentationString.replace(
      /Bytedex Exchange/g,
      exchangeName,
    );
    documentationString = documentationString.replace(
      'http://demo.bytedex.io',
      window.location.origin,
    );

    return JSON.parse(documentationString);
  };

  return (
    <React.Fragment>
      <Box pad="small" direction="row" gap="small">
        <Text>
          <Link to="/exchange-documentation">{t('documentation.title')}</Link>
        </Text>
        <Text weight="bold">{t(`documentation.${type}`)}</Text>
      </Box>
      {type === 'redoc' ? (
        <RedocWrapper>
          <RedocStandalone spec={getDocumentation()} />
        </RedocWrapper>
      ) : (
        <SignalrDocumentation />
      )}
    </React.Fragment>
  );
};

const mapStateToProps = ({
  exchangeSettings: {
    settings: { exchangeName },
  },
  ui: { theme }
}) => ({
  exchangeName,
  theme: theme
});

export default withNamespaces()(connect(mapStateToProps)(ApiDocumentation));
