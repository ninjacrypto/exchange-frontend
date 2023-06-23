import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  ReferralAffiliatesTable,
  ReferralCommissionTable,
} from 'containers/Tables';
import { handleCopyToClipboard } from 'utils';
import { loadAffiliatesSummary } from 'redux/actions/affiliates';
import {
  Columns,
  Tag,
  Tile,
  Section,
  Heading,
  Level,
} from 'react-bulma-components';
import { Loading } from 'components/Loading';

import styles from './Account.module.scss';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';

class AffiliatesOverview extends Component {
  componentDidMount() {
    this.props.loadAffiliatesSummary();
  }

  getEarnings() {
    const {
      summary: { r_Level_1, r_Level_2, r_Level_3 },
      t: translate,
    } = this.props;

    const t = nestedTranslate(translate, 'account.affiliates');

    return (
      <Level renderAs="nav">
        <Level.Item className={styles.levelItem}>
          <div>
            <Heading renderAs="p" heading>
              {t('rLevel1')}
            </Heading>
            <Heading renderAs="p">{r_Level_1}</Heading>
          </div>
        </Level.Item>
        <Level.Item className={styles.levelItem}>
          <div>
            <Heading renderAs="p" heading>
              {t('rLevel2')}
            </Heading>
            <Heading renderAs="p">{r_Level_2}</Heading>
          </div>
        </Level.Item>
        <Level.Item className={styles.levelItem}>
          <div>
            <Heading renderAs="p" heading>
              {t('rLevel3')}
            </Heading>
            <Heading renderAs="p">{r_Level_3}</Heading>
          </div>
        </Level.Item>
        {/* Disable total earnings feature for now -- always get back 0 */}
        {/* <Level.Item className={styles.levelItem}>
            <div>
              <Heading renderAs="p" heading>
                Total Earnings
              </Heading>
              <Heading renderAs="p">{total_Earning}</Heading>
            </div>
          </Level.Item> */}
      </Level>
    );
  }

  render() {
    const {
      summary: { referralID, referralLink },
      t: translate,
    } = this.props;

    const t = nestedTranslate(translate, 'account.affiliates');

    return (
      <React.Fragment>
        <Columns>
          <Columns.Column>
            {referralID ? (
              <Section paddingless={true} className={styles.referralContainer}>
                <Tile className={styles.referralContainer}>
                  <Tile kind="parent" paddingless={true} size={12}>
                    <Tile kind="child">
                      <p className={styles.referralId}>
                        <span>{t('myRefId')}</span>
                        {referralID}
                      </p>
                      <div className={styles.shareContainer}>
                        <Tag className={styles.referralTag}>
                          {referralLink}
                          <span
                            style={{
                              fontSize: '2.5em',
                              marginLeft: '10px',
                              cursor: 'pointer',
                            }}
                            className="fas fa-copy"
                            onClick={() => handleCopyToClipboard(referralLink)}
                          />
                        </Tag>
                        <span>{t('shareLink')}</span>
                      </div>
                    </Tile>
                  </Tile>
                </Tile>
                {this.getEarnings()}
                <Columns>
                  <Columns.Column size={6}>
                    <Heading>{t('referrals')}</Heading>
                    <ReferralAffiliatesTable />
                  </Columns.Column>
                  <Columns.Column size={6}>
                    <Heading>{t('commission')}</Heading>
                    <ReferralCommissionTable />
                  </Columns.Column>
                </Columns>
              </Section>
            ) : (
              <Loading />
            )}
          </Columns.Column>
        </Columns>
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  summary: user.affiliateInfo.summary,
});

AffiliatesOverview.propTypes = {
  summary: PropTypes.object.isRequired,
  loadAffiliatesSummary: PropTypes.func.isRequired,
};

export default withNamespaces()(
  connect(
    mapStateToProps,
    { loadAffiliatesSummary },
  )(AffiliatesOverview),
);
