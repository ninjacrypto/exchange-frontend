import React from 'react';
import _ from 'lodash';
import { withNamespaces } from 'react-i18next';
import { authenticatedInstance } from '../../api';
import { namespaceTranslate } from 'utils/strings';
import { connect } from 'react-redux';
import { checkCopyTradingEnrollmentStatus } from 'redux/actions/profile';
import { Message, Paragraph, Heading } from 'components/Wrapped';
import { Columns } from 'react-bulma-components';

class CopyTrading extends React.Component {
  constructor(props) {
    super(props);

    const { t } = this.props;

    this.t = namespaceTranslate(t, 'copy_trading');
  }

  updateEnrollment = () => async () => {
    const { isEnrolled } = this.props;

    try {
      const { data } = await authenticatedInstance({
        url: `/api/ProTrader_${isEnrolled ? 'Dis' : ''}Enrollment`,
        method: 'POST',
      });

      if (data.status === 'Success') {
        const { checkCopyTradingEnrollmentStatus } = this.props;
        checkCopyTradingEnrollmentStatus();
      }
    } catch (e) {}
  };

  render() {
    const { isEnrolled, isFollowing } = this.props;

    return (
      <React.Fragment>
        <Message background="background-5">
          <Columns>
            <Columns.Column>
              <Heading level={4}>{this.t('enrollment.link')}</Heading>
            </Columns.Column>
            <Columns.Column>
              <div className="field">
                <input
                  type="checkbox"
                  id="feeDiscountSwitch"
                  name="feeDiscountSwitch"
                  className="switch"
                  checked={isEnrolled}
                  disabled={isFollowing}
                  onClick={this.updateEnrollment()}
                  onChange={() => {}}
                />
                <label htmlFor="feeDiscountSwitch">
                  {isEnrolled
                    ? this.t('enrollment.disableEnrollment')
                    : this.t('enrollment.enableEnrollment')}
                </label>
              </div>
            </Columns.Column>
          </Columns>
          <Paragraph color="status-warning">
            {this.t('enrollment.details')}
          </Paragraph>
        </Message>
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({
  user: { copyTradingEnrollmentStatus, copyTradingFollowing },
}) => ({
  isEnrolled: copyTradingEnrollmentStatus,
  isFollowing: !_.isEmpty(copyTradingFollowing),
});

export default withNamespaces(['translations', 'copy_trading'])(
  connect(
    mapStateToProps,
    { checkCopyTradingEnrollmentStatus },
  )(CopyTrading),
);
