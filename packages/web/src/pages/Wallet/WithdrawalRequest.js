import React, { Component } from 'react';
import _ from 'lodash';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { authenticatedInstance } from 'api';
import { triggerToast } from 'redux/actions/ui';
import { PageWrap } from 'components/Containers';
import { triggerModalOpen } from '../../redux/actions/ui';
import { any } from 'prop-types';

class WithdrawalRequest extends Component {
  state = {
    withdrawalComplete: false,
    withdrawalMsg: any,
  };

  async confirmWithdrawal(token) {
    const { triggerToast, triggerModalOpen } = this.props;

    try {
      const response = await authenticatedInstance({
        url: '/api/RequestWithdrawConfirmation',
        method: 'POST',
        data: {
          EmailToken: token,
        },
      });

      if (_.get(response, 'data.status')) {
        if (response.data.status === 'Success') {
          triggerToast(response.data.message, 'success');
          this.setState({
            withdrawalMsg: response.data.message,
          });
        } else {
          triggerToast(response.data.message, 'error');
          this.setState({
            withdrawalMsg: response.data.message,
          });
          // console.log('response.data.message', response.data.message);
        }
      } else {
        triggerModalOpen(_.get(response.data, 'Message'));
        this.setState({
          withdrawalMsg: _.get(response.data, 'Message'),
        });
      }
    } catch (e) {
      console.log(e);
    }

    this.setState({
      withdrawalComplete: true,
    });
  }

  componentDidMount() {
    const { match } = this.props;
    // console.log(match)
    this.confirmWithdrawal(match.params.token);
  }

  render() {
    return (
      <PageWrap>
        {this.state.withdrawalComplete && <Redirect to={{
            pathname: '/withdrawal-response',
            state: { msg: this.state.withdrawalMsg }
        }}
        />}
      </PageWrap>
    );
  }
}

const mapStateToProps = ({ ui, user }) => ({
  passwordResetCompleted: user.passwordResetCompleted,
  isModalOpen: ui.isModalOpen,
});

export default connect(
  mapStateToProps,
  { triggerToast, triggerModalOpen },
)(WithdrawalRequest);
