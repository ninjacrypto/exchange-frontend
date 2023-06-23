import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';

import { WithdrawalHeadingValue } from 'pages/Wallet/Withdrawal';
import { getWithdrawalLimits } from 'redux/actions/portfolio';
import { Box, Meter } from 'components/Wrapped';
import { formatNumberToPlaces } from 'utils/numbers';
import { nestedTranslate } from 'utils/strings';

const TEXT = 'text';
const PROGRESS = 'progress';

class WithdrawalLimit extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf([TEXT, PROGRESS]),
    background: PropTypes.string,
  };

  static defaultProps = {
    type: TEXT,
    background: 'background-4',
  };

  componentDidMount() {
    this.props.getWithdrawalLimits();
  }

  renderTextLimit() {
    const { withdrawalLimit, t: translate } = this.props;
    const t = nestedTranslate(translate, 'wallet.withdrawals');
    return (
      !_.isEmpty(withdrawalLimit) && (
        <WithdrawalHeadingValue
        heading={t('withdrawalLimit')}
          value={`${formatNumberToPlaces(withdrawalLimit.limit) } ${withdrawalLimit.currency}`}
        />
      )
    );
  }

  renderProgressBar() {
    const { withdrawalLimit, background, t: translate } = this.props;
    const t = nestedTranslate(translate, 'wallet.withdrawals');

    return (
      !_.isEmpty(withdrawalLimit) && (
        <Box pad="small" background={background} margin={{ bottom: 'small' }}>
          <WithdrawalHeadingValue
            heading={t('withdrawalLimitStatus')}
            value={`${formatNumberToPlaces(withdrawalLimit.withdrawn)} / ${formatNumberToPlaces(withdrawalLimit.limit)} ${withdrawalLimit.currency}`}
          />
          <Meter
            size="full"
            values={[
              {
                value: (withdrawalLimit.withdrawn / withdrawalLimit.limit) * 100,
                color: 'primary'
              }
            ]} />
        </Box>
      )
    );
  }

  renderOptionType() {
    const { type } = this.props;

    switch (type) {
      case TEXT:
        return this.renderTextLimit();
      case PROGRESS:
        return this.renderProgressBar();
      default:
        return;
    }
  }

  render() {
    return this.renderOptionType();
  }
}

const mapStateToProps = ({ portfolio: { withdrawalLimit } }) => ({
  withdrawalLimit,
});

export default withNamespaces()(connect(mapStateToProps, { getWithdrawalLimits })(WithdrawalLimit));
