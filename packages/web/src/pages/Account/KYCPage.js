import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { Notification } from 'react-bulma-components';
import { StatusGood, StatusUnknown, More, InProgress } from 'grommet-icons';
import styled from 'styled-components';
import _ from 'lodash';
import { KYCForm } from 'pages/Account';
import { withNamespaces } from 'react-i18next';
import { Heading, Box, Text, Paragraph, Button } from 'components/Wrapped';
import { nestedTranslate } from 'utils/strings';
import { Loading } from 'components/Loading';

const KYCIFrame = React.lazy(() => import('./KYCIFrame'));
const KYCOnfido = React.lazy(() => import('./KYCOnfido'));
const APPROVED = 'Approved';
const NEVER_SUBMITTED = 'Never Submitted';
const PENDING = 'Pending';
const REJECTED = 'Rejected';
const REQUESTINFO = 'Request Info';

const StyledList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  margin-left: 0.75em;
`;

const StyledListItem = styled.li`
  ::before {
    content: '•';
    ${props => `color: ${props.color}`};
    font-weight: bold;
    width: 0.75em;
    margin-left: -0.75em;
    display: inline-block;
  }
`;

const KYCTipsMessage = ({ t: translate, status }) => {
  const t = nestedTranslate(translate, 'account.accountVerification.tips');
  const boxColor = 'background-4';
  const textColor = 'text';
  const headingColor = 'brand';

  const tipList = ['vpn', 'public', 'completed'];

  const renderTip = tip => (
    <StyledListItem key={tip} color={textColor}>
      <Text color={textColor}>{t(tip)}</Text>
    </StyledListItem>
  );

  return (
    <Box background={boxColor} margin={{ bottom: 'small' }}>
      <Heading
        color={headingColor}
        style={{ textAlign: 'center' }}
        margin={{ bottom: 'small' }}
      >
        {t(status === REJECTED ? 'headerFailed' : 'header')}
      </Heading>
      {status === REJECTED && (
        <Paragraph color={textColor} margin={{ bottom: 'xsmall' }}>
          {t('errorMessage')}
        </Paragraph>
      )}
      <StyledList color={textColor}>
        {tipList.map(singleTip => renderTip(singleTip))}
      </StyledList>
    </Box>
  );
};

class KYCPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      iskycIframe: false
    };
  }

  kycStatus() {
    const {
      profile: { kycRejectReason, kycStatus, kycApprovedLevel },
      t,
    } = this.props;

    switch (kycStatus) {
      case APPROVED:
        return <React.Fragment>{this.renderKycForm()}</React.Fragment>;
      case NEVER_SUBMITTED:
        return (
          <React.Fragment>
            {this.renderKycForm()}
          </React.Fragment>
        );
      case PENDING:
        return (
          <Box fill={true} justify="center" align="center">
            <InProgress color="status-ok" size="large" />
            <Heading fontWeight={300} level={2} margin="xsmall">
              {t('account.accountVerification.pending')}
            </Heading>
          </Box>
        );
      case REJECTED:
        return (
          <React.Fragment>
            {this.renderKycForm()}
          </React.Fragment>
        );
      case REQUESTINFO:
        return <React.Fragment>{this.renderKycForm()}</React.Fragment>;
      default:
        break;
    }
  }


  renderKycForm() {
    return <KYCForm />;
  }

  createMarkup() {
    const {
      profile: { kycRejectReason },
    } = this.props;

    return { __html: kycRejectReason };
  }

  createMarkupRequestInfo() {
    const { profile: { kycRequestInfo }, } = this.props;

    return { __html: kycRequestInfo };
  }

  kycStatusForIframe() {
    const {
      profile: { kycRejectReason, kycStatus },
      t,
    } = this.props;
    switch (kycStatus) {
      case APPROVED:
        return (
          <React.Fragment>
            <Box fill={true} justify="center" align="center">
              <StatusGood color="status-ok" size="xlarge" />
              <Heading fontWeight={300} level={2} margin="xsmall">
                {t('account.accountVerification.congratulations')}
              </Heading>
              <Text size="large" weight={300} margin={{ bottom: 'xsmall' }}>
                {t('account.accountVerification.approved')}
              </Text>
            </Box>
          </React.Fragment>
        );
      case NEVER_SUBMITTED:
        return <React.Fragment>{this.renderkycIframe()}</React.Fragment>;
      case PENDING:
        return (
          <Box fill={true} justify="center" align="center">
            <InProgress color="status-ok" size="large" />
            <Heading fontWeight={300} level={2} margin="xsmall">
              {t('account.accountVerification.pending')}
            </Heading>
          </Box>
        );
      case REJECTED:
        return (
          <React.Fragment>
            <KYCTipsMessage status={kycStatus} t={t} />
            {kycRejectReason && (
              <Notification color="danger">
                {t('account.accountVerification.rejectionReason')}
                <div dangerouslySetInnerHTML={this.createMarkup()} />
              </Notification>
            )}
            <Button
              color="primary"
              size="small"
              type="button"
              onClick={() => this.showkycIframe()}
            >
              {t('account.accountVerification.tryAgain')}
            </Button>
          </React.Fragment>
        );
      default:
        break;
    }
  }

  renderkycIframe() {
    const { kyc: { webSdkProviderName } } = this.props;
    return (
      <Suspense fallback={<Loading />}>
        {_.isEqual(webSdkProviderName.toLowerCase(), 'onfido') && <KYCOnfido />}
        {_.isEqual(webSdkProviderName.toLowerCase(), 'sumsub') || _.isEqual(webSdkProviderName.toLowerCase(), 'jumio') && <KYCIFrame />}
      </Suspense>
    );
  }

  showkycIframe() {
    this.setState({ iskycIframe: true });
  }

  render() {
    const { kyc: { isSumSubIframe } } = this.props;
    const { iskycIframe } = this.state;

    if (isSumSubIframe) {
      return (
        <React.Fragment>
          {!iskycIframe && (
            this.kycStatusForIframe()
          )}
          {iskycIframe && (
            this.renderkycIframe()
          )}
        </React.Fragment>
      );
    }

    return <React.Fragment>{this.kycStatus()}</React.Fragment>;
  }
}

const mapStateToProps = ({
  exchangeSettings: { settings },
  user: { profile },
}) => ({
  kyc: settings.kyc,
  profile,
});

export default withNamespaces()(connect(mapStateToProps)(KYCPage));
