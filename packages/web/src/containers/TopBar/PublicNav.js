import React from 'react';
import { Link } from 'react-router-dom';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { connect } from 'react-redux';
import { Button } from 'components/Wrapped';

const PublicNav = ({ t: translate, enableLogin, sideNav = false }) => {
  const t = nestedTranslate(translate, 'navbar.links');
  const buttonProps = sideNav ? { fill: 'horizontal', margin:  { vertical: 'xsmall' } } : {};

  return (
    <React.Fragment>
      {enableLogin && (
        <React.Fragment>
          <Link to="/login">
            <Button margin={{ horizontal: 'xsmall' }} color="primary" {...buttonProps}>
              {t('login')}
            </Button>
          </Link>
          <Link to="/signup">
            <Button
              margin={{ horizontal: 'xsmall' }}
              color="primary"
              primary={false}
              {...buttonProps}
            >
              {t('signup')}
            </Button>
          </Link>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

const mapStateToProps = ({
  exchangeSettings: {
    settings: { enableLogin },
  },
}) => ({
  enableLogin,
});

export default withNamespaces()(connect(mapStateToProps)(PublicNav));
