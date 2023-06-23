import React from 'react';
import _ from 'lodash';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';

const AppHead = ({ t, exchangeName, isLoading, faviconUrl, seo }) => {
  if (isLoading) {
    return null;
  }

  const metaTags = _.get(seo, 'meta_Tags', []);

  return (
    <Helmet
      defaultTitle={t('defaultPageTitle', { exchangeName })}
      titleTemplate={`%s | ${exchangeName}`}
    >
      <link rel="shortcut icon" href={faviconUrl} />
      {metaTags.map(({ tagName, tagContent }, i) => (
        <meta name={tagName} content={tagContent} key={i} />
      ))}
    </Helmet>
  );
};

const mapStateToProps = ({
  exchangeSettings: {
    isSettingsLoading,
    settings: { exchangeName, faviconUrl, seo },
  },
}) => ({
  exchangeName,
  isLoading: isSettingsLoading,
  faviconUrl,
  seo,
});

export default withNamespaces()(connect(mapStateToProps)(AppHead));
