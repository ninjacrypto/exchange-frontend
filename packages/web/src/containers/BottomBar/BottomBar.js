import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';

import styles from './BottomBar.module.scss';
import { Box, Text } from 'components/Wrapped';
import { Copyright } from 'containers/BottomBar';
import { nestedTranslate } from 'utils/strings';
import { Advisory } from 'containers/BottomBar';
import { ExternalLink } from 'components/Helpers';

// TODO: Use when we have dynamic links for these.
// import LinkButton from './LinkButton';
// import android from 'assets/icons/android.svg';
// import apple from 'assets/icons/apple.svg';

class BottomBar extends React.Component {
  render() {
    const {
      t: translate,
      exchangeName,
      contentPages,
      supportUrl,
      enableCryptoFeatures,
    } = this.props;
    const t = nestedTranslate(translate, 'footer');

    return (
      <Box
        background="footerBackground"
        align="center"
        round={false}
        className={styles.bottomBar}
        as="footer"
      >
        <Box width="xlarge" justify="center">
          <Copyright exchangeName={exchangeName} />
          <Text margin={{ bottom: 'small' }} size="xsmall" textAlign="center">
            {t('disclaimer', { exchangeName })}
          </Text>
          <Advisory size="xsmall" />
          <Box
            direction="row"
            justify="center"
            wrap={true}
            pad={{ horizontal: 'small' }}
          >
            {enableCryptoFeatures && (
              <Box pad="small">
                <Link to="/currencies">{t('currencies')}</Link>
              </Box>
            )}
            <Box pad="small">
              <Link to="/asset-status">{t('assetStatus')}</Link>
            </Box>
            <Box pad="small">
              <Link to="/fees">{t('fees')}</Link>
            </Box>
            <Box pad="small">
              <Link to="/trading-rules">{t('tradingRules')}</Link>
            </Box>
            <Box pad="small">
              <Link to="/exchange-documentation">{t('apiDocumentation')}</Link>
            </Box>
            {/* <Box pad="small">
              <Link to="/risk-and-advisory">{t('riskAndAdvisory')}</Link>
            </Box> */}
            {supportUrl && (
              <Box pad="small">
                <ExternalLink href={supportUrl}>{t('support')}</ExternalLink>
              </Box>
            )}
          </Box>
          <Box
            direction="row"
            justify="center"
            wrap={true}
            pad={{ horizontal: 'small' }}
          >
            {Object.values(contentPages).map(
              ({ name, url, active }) =>
                active && (
                  <Box pad="small" key={name}>
                    <Link to={url}>{t(`pages.${name}`)}</Link>
                  </Box>
                ),
            )}
          </Box>
          {/* <TabletDown>
            <LanguageToggler isUp={true} />
          </TabletDown> */}
          {/* <LinkButton to="/" text="App Store" icon={apple} />
          <LinkButton to="/" text="Android" icon={android} />
          <LinkButton to="/" text="Mobile Version" icon={mobile} /> */}
        </Box>
      </Box>
    );
  }
}

const mapStateToProps = ({
  exchangeSettings: {
    settings: { exchangeName, supportUrl, enableCryptoFeatures },
    contentPages,
  },
}) => ({
  exchangeName,
  contentPages,
  supportUrl,
  enableCryptoFeatures,
});

export default withNamespaces()(connect(mapStateToProps)(BottomBar));
