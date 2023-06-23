import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Box, Heading, Button } from 'components/Wrapped';

const RequiresKYC = ({ kycStatus, t, children }) => (
  <Fragment>
    {kycStatus === 'Approved' ? (
      children
    ) : (
      <Box align="center" justify="center" height="medium">
            <Heading level={3} size="medium">
              {t('account.accountVerification.requiresKyc')}
            </Heading>
            <Link to="/account/account-verification">
              <Button color="primary">
                {t('buttons.enableKyc')}
                <span
                  style={{
                    fontSize: '1.25em',
                    marginLeft: '10px',
                    cursor: 'pointer',
                  }}
                  className="fas fa-shield-alt"
                />
              </Button>
            </Link>
      </Box>
    )}
  </Fragment>
);

const mapStateToProps = ({ user: { profile: { kycStatus } } }) => ({
  kycStatus,
});

RequiresKYC.propTypes = {
  children: PropTypes.node.isRequired,
};

export default withNamespaces()(connect(mapStateToProps)(RequiresKYC));
