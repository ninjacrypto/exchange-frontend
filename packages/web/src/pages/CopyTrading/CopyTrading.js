import React from 'react';
import { Form, Formik } from 'formik';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import * as Yup from 'yup';

import { namespaceTranslate } from 'utils/strings';
import { authenticatedInstance } from 'api';
import { TableWrapper } from 'containers/Tables';
import { Loading } from 'components/Loading';
import { PrettyPercent } from 'components/Helpers';
import { Box, Button, Message, Modal, Paragraph } from 'components/Wrapped';
import { getCopyTradingFollowing } from 'redux/actions/profile';
import { Select, FormField, TextField } from 'components/Form';
import { triggerToast } from 'redux/actions/ui';
import { CopyTradingEnrollment } from 'pages/CopyTrading';

class CopyTrading extends React.Component {
  constructor(props) {
    super(props);

    const { t } = this.props;

    this.t = namespaceTranslate(t, 'copy_trading');
    this.tableFollowButton = this.tableFollowButton.bind(this);
  }

  state = {
    isLoading: true,
    proTraders: [],
    isModalVisible: false,
    followUserId: '',
  };

  componentDidMount() {
    this.getTraderProfiles();
    this.setState({
      isLoading: false,
    });
  }

  getTraderProfiles = async () => {
    try {
      const { data } = await authenticatedInstance({
        url: '/api/ProTrader_Profiles',
        method: 'GET',
      });

      if (data.status === 'Success') {
        this.setState({
          proTraders: data.data,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  followUser = ({ isFollowing, userId, extraData = {} }) => async () => {
    try {
      const { data } = await authenticatedInstance({
        url: `/api/ProTrader_${isFollowing ? 'Un' : ''}Follow`,
        method: 'POST',
        data: {
          UserID: userId,
          ...extraData,
        },
      });

      if (data.status === 'Success') {
        const { getCopyTradingFollowing, triggerToast } = this.props;
        if (!isFollowing) {
          this.toggleModal();
        }
        triggerToast(data.message, 'success', 3000);
        getCopyTradingFollowing();
      }
    } catch (e) {}
  };

  tableFollowButton({ value }) {
    const {
      following: { proTraderUserID = '' },
      isEnrolled,
    } = this.props;
    const isFollowing = value === proTraderUserID;

    return (
      <Button
        disabled={isEnrolled}
        onClick={
          isFollowing
            ? this.followUser({ isFollowing, userId: value })
            : this.openModal(value)
        }
        label={isFollowing ? this.t('table.unfollow') : this.t('table.follow')}
      />
    );
  }

  openModal = userId => () => {
    this.toggleModal();
    this.setState({
      followUserId: userId.toString(),
    });
  };

  toggleModal = () => {
    const { isModalVisible } = this.state;

    this.setState({ isModalVisible: !isModalVisible });
  };

  renderModal() {
    const { isModalVisible } = this.state;
    const { t } = this.props;

    return (
      <Modal show={isModalVisible} toggleModal={this.toggleModal}>
        <Message background="background-5">
          {this.t('copyTrading.details')}
          {/* <Paragraph>{this.t('copyTrading.noEnrollMessage')}</Paragraph> */}
          <Paragraph color="status-warning">
            {this.t('copyTrading.warning')}
          </Paragraph>
        </Message>
        <Formik
          initialValues={{
            FollowRatio: '',
            CopyOpenPositions: false,
          }}
          validationSchema={Yup.object().shape({
            FollowRatio: Yup.number()
              .required()
              .min(1)
              .max(100),
            CopyOpenPositions: Yup.bool().required(),
          })}
          onSubmit={({ FollowRatio, CopyOpenPositions }) => {
            this.followUser({
              userId: this.state.followUserId,
              extraData: {
                FollowRatio: FollowRatio.toString(),
                CopyOpenPositions,
              },
            })();
          }}
        >
          {() => (
            <Form>
              <Box background="background-4" width="large">
                <FormField
                  label={this.t('form.ratio.label')}
                  name="FollowRatio"
                >
                  <TextField
                    placeholder={this.t('form.ratio.placeholder')}
                    type="number"
                    addonEnd={{ content: '%' }}
                  />
                </FormField>
                <FormField
                  label={this.t('form.copy.label')}
                  name="CopyOpenPositions"
                >
                  <Select
                    name="CopyOpenPositions"
                    options={[
                      { label: t('forms.common.yes'), value: true },
                      { label: t('forms.common.no'), value: false },
                    ]}
                    labelKey="label"
                    valueKey="value"
                  />
                </FormField>
                <Box direction="row" justify="between">
                  <Button onClick={this.toggleModal} color="status-unknown">
                    {t('buttons.cancel')}
                  </Button>
                  <Button type="submit">{t('buttons.submit')}</Button>
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </Modal>
    );
  }

  render() {
    return (
      <React.Fragment>
        <CopyTradingEnrollment />
        {this.renderModal()}
        {!this.state.isLoading ? (
          <TableWrapper
            data={this.state.proTraders}
            columns={[
              {
                Header: this.t('table.name'),
                accessor: 'name',
              },
              {
                Header: this.t('table.country'),
                accessor: 'country',
              },
              {
                Header: this.t('table.roi'),
                accessor: 'roi',
                Cell: ({ value }) => <PrettyPercent value={value} />,
              },
              {
                Header: this.t('table.actions'),
                accessor: 'userID',
                Cell: this.tableFollowButton,
              },
            ]}
            defaultSorted={[
              {
                id: 'roi',
                desc: true,
              },
            ]}
          />
        ) : (
          <Loading />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({
  user: { copyTradingEnrollmentStatus, copyTradingFollowing },
}) => ({
  isEnrolled: copyTradingEnrollmentStatus,
  following: copyTradingFollowing,
});

export default withNamespaces(['translation', 'copy_trading'])(
  connect(
    mapStateToProps,
    { getCopyTradingFollowing, triggerToast },
  )(CopyTrading),
);
