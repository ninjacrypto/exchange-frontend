import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Box, Button, Stack, Text } from 'components/Wrapped';

const Requires2FA = ({ gAuthEnabled, t, children, pad = 'none' }) => (
  <Fragment>
    {gAuthEnabled ? (
      children
    ) : (
      <Stack fill={true}>
        {children}
        <Box
          fill={true}
          align="center"
          justify="center"
          gap="small"
          pad={pad}
          background={{ color: 'background-1', opacity: 'strong' }}
        >
          <Text size="large" textAlign="center">
            {t('account.apiKeys.mustEnableGauth')}
          </Text>
          <Link to="/account/security">
            <Button color="primary">
              {t('buttons.enable2FA')}
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
      </Stack>
    )}
  </Fragment>
);

const mapStateToProps = ({ auth }) => ({
  gAuthEnabled: auth.gAuthEnabled,
});

Requires2FA.propTypes = {
  children: PropTypes.node.isRequired,
};

export default withNamespaces()(connect(mapStateToProps)(Requires2FA));
