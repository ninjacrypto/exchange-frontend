import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { triggerModalOpen } from 'redux/actions/ui';
import styles from './P2P.module.scss';
import { Box, Text, Heading, DateInput } from 'components/Wrapped';
import { PageWrap } from 'components/Containers';
import { P2PWalletTable } from 'containers/Tables';
import { nestedTranslate } from 'utils';

class P2PWallet extends Component {
  constructor() {
    super();

    this.state = {
      allAssets: [],
    };
  }

  componentDidMount() {}

  render() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'p2p.p2pWallet');
    return (
      <PageWrap>
        <Box pad="medium" background="background-3">
          <Heading level={3} margin={{ bottom: '15px' }}>
            {t('pageTitle')}
          </Heading>
          <P2PWalletTable />
        </Box>
      </PageWrap>
    );
  }
}
const mapStateToProps = ({ p2p: { p2pCurrencies, p2pPaymentMethods } }) => ({
  p2pCurrencies: p2pCurrencies,
  p2pPaymentMethods: p2pPaymentMethods,
});

export default withNamespaces()(
  connect(mapStateToProps, { triggerModalOpen })(P2PWallet),
);
