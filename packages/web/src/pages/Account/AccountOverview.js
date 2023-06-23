import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Columns, Tile } from 'react-bulma-components';

import { moment } from 'i18n';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { loadProfile } from 'redux/actions/profile';
import { LoginHistoryTable } from 'containers/Tables';
import { Loading } from 'components/Loading';
import {
  Accordion,
  AccordionPanel,
  Heading,
  Tag,
  Paragraph,
} from 'components/Wrapped';
import styles from './Account.module.scss';
import { nestedTranslate } from 'utils';
import { WithdrawalLimit } from 'containers/WithdrawalLimit';
import { TradingDiscountProgress } from 'pages/Account';

class AccountOverview extends Component {
  verificationInfo({ icon, text, styledClass }) {
    return (
      <Fragment>
        {text}
        <span
          className={cx(`fas fa-${icon}`, [
            styles.verificationIcon,
            styles[styledClass],
          ])}
        />
      </Fragment>
    );
  }
  isAccountVerified() {
    const {
      profile: { kycStatus },
      t,
    } = this.props;

    switch (kycStatus) {
      case 'Approved':
        return this.verificationInfo({
          icon: 'check',
          styledClass: 'approved',
          text: t('account.accountVerification.statusApproved'),
        });
      case 'Never Submitted':
        return this.verificationInfo({
          icon: 'arrow-right',
          styledClass: 'notSubmitted',
          text: t('account.accountVerification.statusNew'),
        });
      case 'Pending':
        return this.verificationInfo({
          icon: 'exclamation',
          styledClass: 'pending',
          text: t('account.accountVerification.statusPending'),
        });
      case 'Rejected':
        return this.verificationInfo({
          icon: 'times',
          styledClass: 'rejected',
          text: t('account.accountVerification.statusRejected'),
        });
      case 'Request Info':
        return this.verificationInfo({
          icon: 'exclamation',
          styledClass: 'RequestInfo',
          text: t('account.accountVerification.statusRequestInfo'),
        });
      default:
        break;
    }
  }

  userData() {
    const {
      profile: { firstName, lastName, middleName, email, country, joinedOn, customerID },
      aeraPassEnabled,
      t: translate,
    } = this.props;

    const t = nestedTranslate(translate, 'account.overview');

    return (
      <Fragment>
        <Columns className={styles.columns}>
          <Columns.Column
            size={6}
            className={!aeraPassEnabled ? styles.leftColumn : ''}
          >
            <Heading level={4}>
              {firstName} {middleName} {lastName}
            </Heading>
            <Heading level={6}>{email}</Heading>
            <Heading level={5}>{country}</Heading>
            <Paragraph>
              {t('joinedOn')} {moment(joinedOn).format('MMMM Do YYYY')}
            </Paragraph>
            <Paragraph>
              {t('customerId')} {customerID}
            </Paragraph>
          </Columns.Column>

          {!aeraPassEnabled && (
            <Columns.Column size={6} className={styles.rightColumn}>
              <Link to="/account/account-verification">
                <Tile className={styles.accountVerificationContainer}>
                  <Tile kind="parent" paddingless={true} size={12}>
                    <Tag background="background-5" size="medium">
                      <span className={cx('fas fa-user', styles.avatarIcon)} />
                      {this.isAccountVerified()}
                    </Tag>
                  </Tile>
                </Tile>
              </Link>
              <WithdrawalLimit type="progress" />
              <TradingDiscountProgress showTitle={true} />
            </Columns.Column>
          )}
        </Columns>
      </Fragment>
    );
  }

  addtionalAccountData() {
    const { aeraPassEnabled, t } = this.props;

    return (
      !aeraPassEnabled && (
        <Accordion>
          <AccordionPanel label={t('account.overview.loginHistory')}>
            <LoginHistoryTable />
          </AccordionPanel>
        </Accordion>
      )
    );
  }

  render() {
    const {
      profile: { isProfileLoading },
    } = this.props;

    return !isProfileLoading ? (
      <Fragment>
        <Columns>
          <Columns.Column>{this.userData()}</Columns.Column>
        </Columns>
        {this.addtionalAccountData()}
      </Fragment>
    ) : (
      <Loading />
    );
  }
}

const mapStateToProps = ({
  user,
  exchangeSettings: {
    settings: { aeraPassEnabled },
  },
}) => ({
  profile: user.profile,
  isProfileLoading: user.isProfileLoading,
  aeraPassEnabled,
});

AccountOverview.propTypes = {
  profile: PropTypes.object.isRequired,
  loadProfile: PropTypes.func.isRequired,
};

export default withNamespaces()(
  connect(mapStateToProps, { loadProfile })(AccountOverview),
);
