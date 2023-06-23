import React, {Component} from 'react';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { loadDeviceWhitelisting } from 'redux/actions/ipwhitelisting';
import { DeviceWhitelistingTable } from 'containers/Tables';

class DeviceWhitelisting extends Component {

    componentDidMount() {
        this.props.loadDeviceWhitelisting();
      }

    render() {
        return (
            <React.Fragment>
                <DeviceWhitelistingTable />
            </React.Fragment>
        );
    }
}


const mapStateToProps = ({ user }) => ({
  ipwhitelisting: user.ipwhitelisting,
});

export default withNamespaces()(
    connect(mapStateToProps, {
        loadDeviceWhitelisting
    })(DeviceWhitelisting),
  );