import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';

import { triggerToast } from 'redux/actions/ui';
import { triggerModalOpen } from '../../redux/actions/ui';
import { withNamespaces } from 'react-i18next';
import { PageWrap } from 'components/Containers';
import { Heading, Message } from 'components/Wrapped';
import { nestedTranslate } from 'utils/strings';

class WithdrawalResponse extends Component {
  state = {
    withdrawalComplete: false,
  };

  render() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'messages');
    return (
      <PageWrap justify="center" align="center">
      <Message background="background-2">
        <Heading level={1}>
          {t(this.props.location.state.msg)}
        </Heading>
      </Message>
    </PageWrap>
    );
  }
}

const mapStateToProps = ({ ui, user }) => ({
  passwordResetCompleted: user.passwordResetCompleted,
  isModalOpen: ui.isModalOpen,
});

export default withNamespaces()(connect(
  mapStateToProps,
  { triggerToast, triggerModalOpen },
)(WithdrawalResponse));