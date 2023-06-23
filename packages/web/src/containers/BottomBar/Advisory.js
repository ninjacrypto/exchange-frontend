import React from 'react';
import { withNamespaces, Trans } from 'react-i18next';

import { Text, Heading } from 'components/Wrapped';
import { nestedTranslate } from 'utils';
import { connect } from 'react-redux';
import { PageWrap } from 'components/Containers';
import { ExternalLink } from 'components/Helpers';

const AdvisoryWrapper = ({ t: translate, exchangeName, size }) => {
  const t = nestedTranslate(translate, 'footer');

  return (
    <React.Fragment>
      <Text margin={{ bottom: 'small' }} size={size}>
        <Trans i18nKey="footer.advisory">
          D
          <ExternalLink href="https://files.consumerfinance.gov/f/201408_cfpb_consumer-advisory_virtual-currencies.pdf">
            {' '}
            CFPB’s Consumer Advisory
          </ExternalLink>
          , the
          <ExternalLink href="https://www.cftc.gov/sites/default/files/idc/groups/public/@customerprotection/documents/file/customeradvisory_urvct121517.pdf">
            {' '}
            CFTC’s Customer Advisory
          </ExternalLink>
          , the
          <ExternalLink href="https://www.investor.gov/additional-resources/news-alerts/alerts-bulletins/investor-alert-bitcoin-other-virtual-currency">
            {' '}
            SEC’s Investor Alert
          </ExternalLink>
          , and
          <ExternalLink href="http://www.finra.org/investors/alerts/bitcoin-more-bit-risky">
            {' '}
            FINRA’s Investor Alert
          </ExternalLink>
          .
        </Trans>
      </Text>
      <Text margin={{ bottom: 'small' }} size={size}>
        {t('legal', { exchangeName })}
      </Text>
    </React.Fragment>
  );
};

const mapStateToProps = ({ exchangeSettings: { settings } }) => ({
  exchangeName: settings.exchangeName,
});

export const Advisory = withNamespaces()(
  connect(mapStateToProps)(AdvisoryWrapper),
);

export const AdvisoryPageWrapper = ({ t }) => (
  <PageWrap>
    <Heading level={2}>{t('footer.riskAndAdvisory')}</Heading>
    <Advisory size="small" />
  </PageWrap>
);

export const AdvisoryPage = withNamespaces()(AdvisoryPageWrapper);
