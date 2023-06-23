import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Yup from 'yup';
import { requestGauth, enableGauth, disableGauth } from 'redux/actions/gAuth';
import { loadProfile } from 'redux/actions/profile';
import { FormContainer, TextField } from 'components/Form';
import { Box, Text, Button, Paragraph, Heading } from 'components/Wrapped';
// import QRCode from 'qrcode.react';
import { withNamespaces, Trans } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';

import { Loading } from 'components/Loading';
import { ExternalLink } from 'components/Helpers';
import { handleCopyToClipboard } from 'utils';

class SecurityOverview extends Component {
  static propTypes = {
    profile: PropTypes.object.isRequired,
    loadProfile: PropTypes.func.isRequired,
    requestGauth: PropTypes.func.isRequired,
    handle2FASubmit: PropTypes.func,
    secretKey: PropTypes.string,
    qrCode: PropTypes.string,
    gAuthEnabled: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    if (!this.props.gAuthEnabled) this.props.requestGauth();
  }

  twoFaValidationSchema = () =>
    Yup.object().shape({
      GAuth_Code: Yup.string()
        .min(6)
        .required(),
    });

  render() {
    const {
      secretKey,
      qrCode,
      enableGauth,
      disableGauth,
      gAuthEnabled,
      profile,
      t: translate,
      exchangeName,
      mfaSettings,
    } = this.props;

    const t = nestedTranslate(translate, 'account.security');
    const isValidSecretKey = secretKey && secretKey;
    const submitBtnText = !gAuthEnabled
      ? translate('buttons.enable2FA')
      : translate('buttons.disable2FA');
    const handle2FASubmit = gAuthEnabled ? disableGauth : enableGauth;
    const isGAuth = !_.get(mfaSettings, 'name').startsWith('Authy');

    const qrCodeValue =qrCode;
      // qrCode && isGAuth ? decodeURIComponent(qrCode.split('chl=')[1]) : qrCode;

    return profile ? (
      <Box pad="none" background="background-3" gap="small">
        <Heading level={3}>
          {t('twoFactorText')}{' '}
          {gAuthEnabled ? t('twoFactorEnabled') : t('twoFactorDisabled')}
        </Heading>
        {!gAuthEnabled && (
          <Box background="background-4" gap="xsmall">
            <Text size="medium" weight="bold">
              {t('boxHeading', { exchangeName })}
            </Text>
            <Paragraph>
              <Trans
                i18nKey="account.security.boxParagraphFirst"
                values={{ exchangeName }}
              >
                Two-factor authentication (2fa) greatly increases security by
                requiring both your password and another form of authentication.
                Bytedex implements 2fa utilizing
                <ExternalLink href={translate('multiFactorAuth.download')}>
                  Google Authenticator
                </ExternalLink>
                . To enable this feature simply download Google Authenticator on
                your mobile device and scan the QRCode.
              </Trans>
            </Paragraph>
            <Paragraph>{t('boxParagraphSecond', { exchangeName })}</Paragraph>
          </Box>
        )}
        <Box background="background-4" align="center" gap="medium">
          {gAuthEnabled ? (
            <Text size="medium">{t('authFormTitleDisabled')}</Text>
          ) : (
            <Fragment>
              {qrCode && isGAuth ? (
                <div>
                {/* <Box pad="small" margin="small" background="white">
                  <QRCode size={175} value={qrCodeValue} />
                </Box> */}
                                  <img
                    src={qrCodeValue}
                    style={{
                      margin: 15,
                    }}
                    alt="QR Code"
                  />
                </div>

              ) : (
                qrCode && (
                  <img
                    src={qrCodeValue}
                    style={{
                      margin: 15,
                    }}
                    alt="QR Code"
                  />
                )
              )}
              <Text size="medium">{t('authFormTitleEnabled')}</Text>
            </Fragment>
          )}
          <FormContainer
            values={{
              GAuth_Code: '',
            }}
            handleSubmit={handle2FASubmit}
            validationSchema={this.twoFaValidationSchema}
            hasButton={{
              text: submitBtnText,
            }}
          >
            <Box pad="none" width="medium" gap="small">
              {isValidSecretKey && !gAuthEnabled && (
                <Box pad="none" gap="xsmall">
                  <Text size="small" weight="bold">
                    {t('secretKey')}
                  </Text>
                  <Text size="xsmall">{t('secretKeyHelp')}</Text>
                  <Box
                    direction="row"
                    justify="between"
                    background="background-3"
                    align="center"
                    pad={{ vertical: 'xsmall', horizontal: 'small' }}
                    gap="small"
                  >
                    <Text size="xsmall" truncate={true}>
                      {isValidSecretKey}
                    </Text>
                    <Button
                      color="primary"
                      primary={true}
                      onClick={() => handleCopyToClipboard(isValidSecretKey)}
                    >
                      {translate('buttons.copy')}
                    </Button>
                  </Box>
                </Box>
              )}
              <TextField
                type="text"
                name="GAuth_Code"
                placeholder={translate(
                  'forms.enableGoogleAuth.authCode.placeholder',
                )}
                persistentPlaceholder={false}
                background="background-3"
              />
            </Box>
          </FormContainer>
        </Box>
      </Box>
    ) : (
      <Loading />
    );
  }
}

const mapStateToProps = ({
  user,
  auth,
  exchangeSettings: {
    settings: { exchangeName, mfaSettings },
  },
}) => ({
  profile: user.profile,
  secretKey: auth.gAuthSecretKey,
  qrCode: auth.gAuthQrCode,
  gAuthEnabled: auth.gAuthEnabled,
  exchangeName,
  mfaSettings,
});

export default withNamespaces()(
  connect(mapStateToProps, {
    loadProfile,
    requestGauth,
    enableGauth,
    disableGauth,
  })(SecurityOverview),
);
