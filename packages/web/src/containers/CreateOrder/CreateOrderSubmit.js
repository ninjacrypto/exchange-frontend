import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { Button, Tag } from 'components/Wrapped';
import { withNamespaces, Trans } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';

import styles from './CreateOrder.module.scss';
import { ExternalLink } from 'components/Helpers';

const CreateOrderSubmit = ({
  isAuthenticated,
  t: translate,
  side,
  tradingPair: { quoteCurrency, baseCurrency },
  enableLogin,
  aeraPassUrl,
}) => {
  const t = nestedTranslate(translate, 'forms.limitOrder');
  const loginButton = enableLogin && !aeraPassUrl ? <Link to="/login">Login</Link> : <ExternalLink href={aeraPassUrl}>Login</ExternalLink>;
  const registerButton = enableLogin && !aeraPassUrl ? <Link to="/signup">Register</Link> : <ExternalLink href={aeraPassUrl}>Register</ExternalLink>;

  return (
    <Fragment>
      {isAuthenticated ? (
        <Button
          fill="horizontal"
          className={side === 'BUY' ? styles.buyButton : styles.sellButton}
          color={side === 'BUY' ? 'bidColor' : 'askColor'}
          primary={true}
          // disabled={props.isSubmitting}
          type="submit"
        >
          {t('button', {
            side,
            quoteCurrency,
            baseCurrency,
          })}
        </Button>
      ) : (
        <Tag className={styles.signedOutButton} size="small">
          <Trans i18nKey="forms.common.loginOrRegister">
            {loginButton}
            or
            {registerButton}
            to vote
          </Trans>
        </Tag>
      )}
    </Fragment>
  );
};

const mapStateToProps = ({ exchangeSettings: { settings: { enableLogin, aeraPassUrl } }, auth: { isAuthenticated } }) => ({
  isAuthenticated,
  enableLogin,
  aeraPassUrl,
});

export default withNamespaces()(
  connect(
    mapStateToProps,
    null
  )(CreateOrderSubmit)
);
