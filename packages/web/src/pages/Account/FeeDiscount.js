import React from 'react';
import { connect } from 'react-redux';
import { Columns } from 'react-bulma-components';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';

import {
  loadFeeDiscountStatus,
  toggleFeeDiscountStatus,
} from 'redux/actions/profile';
import { FeeDiscountTable } from 'containers/Tables';
import { Heading, Message, Paragraph } from 'components/Wrapped';

class FeeDiscount extends React.Component {
  componentDidMount() {
    this.props.loadFeeDiscountStatus();
  }

  render() {
    const {
      feeDiscountStatus,
      toggleFeeDiscountStatus,
      t: translate,
      exchangeToken,
      enablePayInExchangeToken,
    } = this.props;
    const t = nestedTranslate(translate, 'account.feeDiscount');

    return (
      <React.Fragment>
        {enablePayInExchangeToken && (
          <Message background="background-4" margin={{ vertical: 'small' }}>
            <Columns>
              <Columns.Column>
                <Heading level={3}>
                  {t('payInToken', { exchangeToken })}
                </Heading>
              </Columns.Column>
              <Columns.Column>
                <div className="field">
                  <input
                    type="checkbox"
                    id="feeDiscountSwitch"
                    name="feeDiscountSwitch"
                    className="switch"
                    defaultChecked={feeDiscountStatus}
                    onClick={() => toggleFeeDiscountStatus(feeDiscountStatus)}
                  />
                  <label htmlFor="feeDiscountSwitch">
                    {feeDiscountStatus ? t('disenroll') : t('enroll')}
                  </label>
                </div>
              </Columns.Column>
            </Columns>
            <Paragraph>{t('details', { exchangeToken })}</Paragraph>
          </Message>
        )}
        <Message background="background-4" margin={{ vertical: 'small' }}>
          <Paragraph>{t('discountDetails', { exchangeToken })}</Paragraph>
        </Message>
        <FeeDiscountTable />
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({
  user: { feeDiscountStatus },
  exchangeSettings: {
    settings: { exchangeToken, enablePayInExchangeToken },
  },
}) => ({
  feeDiscountStatus,
  exchangeToken,
  enablePayInExchangeToken,
});

const mapDispatchToProps = {
  loadFeeDiscountStatus,
  toggleFeeDiscountStatus,
};

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(FeeDiscount),
);
