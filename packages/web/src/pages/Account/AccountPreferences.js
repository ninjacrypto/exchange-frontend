import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadProfile } from 'redux/actions/profile';
import { Columns, Heading } from 'react-bulma-components';

class SecurityOverview extends Component {
  componentDidMount() {
    this.props.loadProfile();
  }

  render() {
    const { profile } = this.props;

    return (
      <Columns>
        <Columns.Column>
          <Heading size={4}>
            Customer ID: {profile.customerID.toString()}
          </Heading>
          <p>KYC Approved By: {profile.kycApprovedBy}</p>
          <p>KYC Status: {profile.kycStatus}</p>
        </Columns.Column>
      </Columns>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  profile: user.profile,
});

SecurityOverview.propTypes = {
  profile: PropTypes.object.isRequired,
  loadProfile: PropTypes.func.isRequired,
};

export default connect(
  mapStateToProps,
  { loadProfile },
)(SecurityOverview);
