import React, {Component} from 'react';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { loadIPWhitelisting } from 'redux/actions/ipwhitelisting';
import { AddIPWhitelist } from './IPWhitelistAdd';
import { IPWhitelistingTable } from 'containers/Tables';
import { Heading } from 'components/Wrapped';
import { nestedTranslate } from 'utils';

class IPWhitelisting extends Component {

    componentDidMount() {
        this.props.loadIPWhitelisting();
      }

    render() {
        const { t: translate } = this.props;
        const t = nestedTranslate(translate, 'account.ip-whitelisting');
        return (
            <React.Fragment>
                <AddIPWhitelist />
                <br />
                <Heading label={3}>{t('headingIPAddress')}</Heading>
                <IPWhitelistingTable />
            </React.Fragment>
        );
    }
}


const mapStateToProps = ({ user }) => ({
  ipwhitelisting: user.ipwhitelisting,
});

export default withNamespaces()(
    connect(mapStateToProps, {
        loadIPWhitelisting
    })(IPWhitelisting),
  );