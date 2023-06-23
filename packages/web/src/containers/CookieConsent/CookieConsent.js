import React from 'react';

import { setCookieConsent } from 'redux/actions/exchangeSettings';
import { Button, Layer, Box, Heading, Paragraph } from 'components/Wrapped';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils';
import { Link } from 'react-router-dom';

const CookieConsent = ({
  enableCookieConsent,
  hasCookieConsent,
  consentGiven,
  t: translate,
  setCookieConsent,
  exchangeName,
}) => {
  const t = nestedTranslate(translate, 'cookieConsent');
  const handleButtonClick = isEnabled => () => setCookieConsent(isEnabled);

  return exchangeName &&
    enableCookieConsent &&
    !consentGiven &&
    !hasCookieConsent ? (
    <Layer modal={false} position="bottom" full="horizontal" responsive={false}>
      <Box
        background="cookieConsentBackground"
        round={false}
        justify="center"
        align="center"
      >
        <Heading level={4}>{t('title', { exchangeName })}</Heading>
        <Paragraph>{t('description')}</Paragraph>
        <Paragraph>
          <Link to="/cookie-policy">{t('more')}</Link>
        </Paragraph>
        <Box direction="row" pad="small">
          <Button
            onClick={handleButtonClick(false)}
            margin={{ horizontal: 'small' }}
            color="primary"
            primary={false}
            style={{ color: 'unset' }}
          >
            {translate('buttons.decline')}
          </Button>
          <Button
            onClick={handleButtonClick(true)}
            margin={{ horizontal: 'small' }}
            color="primary"
          >
            {translate('buttons.accept')}
          </Button>
        </Box>
      </Box>
    </Layer>
  ) : null;
};

const mapStateToProps = ({
  exchangeSettings: {
    enableCookieConsent,
    hasCookieConsent,
    consentGiven,
    settings: { exchangeName },
  },
}) => ({
  enableCookieConsent,
  hasCookieConsent,
  exchangeName,
  consentGiven,
});

export default withNamespaces()(
  connect(
    mapStateToProps,
    { setCookieConsent },
  )(CookieConsent),
);
