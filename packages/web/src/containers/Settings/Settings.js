import React from 'react';

import { FiatToggler } from 'containers/FiatConverter';
import { LanguageToggler, NumberFormatToggler } from 'components/Language';
import { ThemeToggler } from 'components/Theme';
import { Box, Heading } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';
import { PageWrap } from 'components/Containers';

const settingsTogglers = [
  {
    component: ThemeToggler,
    label: 'theme',
  },
  {
    component: LanguageToggler,
    label: 'language',
  },
  {
    component: NumberFormatToggler,
    label: 'numberFormat',
  },
  {
    component: FiatToggler,
    label: 'fiat',
  },
];

const SettingsWrapper = ({ t }) => (
  <React.Fragment>
    <Heading level={2}>{t('settings.title')}</Heading>
    {settingsTogglers.map(({ component: DynamicComponent, label }, i) => (
      <Box key={i} pad="xsmall">
        <Heading level={5}>{t(`settings.${label}`)}</Heading>
        <DynamicComponent />
      </Box>
    ))}
  </React.Fragment>
);

export const Settings = withNamespaces()(SettingsWrapper);

export const SettingsPage = () => (
  <PageWrap>
    <Settings />
  </PageWrap>
);
