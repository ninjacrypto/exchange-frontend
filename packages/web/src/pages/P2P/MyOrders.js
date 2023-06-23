import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { triggerModalOpen } from 'redux/actions/ui';
import styles from './P2P.module.scss';
import { Box, Text, Heading, DateInput } from 'components/Wrapped';
import { PageWrap } from 'components/Containers';
import { MyOrdersTable } from 'containers/Tables';
import { moment } from 'i18n';
import { getMyOrders } from 'redux/actions/p2p';
import { nestedTranslate } from 'utils';

class MyOrders extends Component {
  constructor() {
    super();

    this.state = {
      allAssets: [],
      sidesList: [],
      statusList: [],
      side: {value: '', label: 'All status'},
      asset: {value: '', label: 'All assets'},
      status: {value: '', label: 'All status'},
      dateTo: '',
      dateFrom: ''
    };
  }

  componentDidMount() {
    const { p2pCurrencies, t: translate } = this.props;
    const t = nestedTranslate(translate, 'p2p.myOffers');

    if (!_.isEmpty(p2pCurrencies)) {
      const currencyMarger = [];
      const tempAllCurrencies = [];
      currencyMarger.push(...p2pCurrencies.Base, ...p2pCurrencies.Quote);
      currencyMarger.map(evl => {
        let avi = {
          label: evl.AssetName,
          value: evl.AssetName,
        };
        tempAllCurrencies.push(avi);
      });
      tempAllCurrencies.unshift( { value: '', label: t('allAssets') });

      this.setState({
        allAssets: tempAllCurrencies.sort((a,b)  => a.value > b.value ? 1 : -1),
      });
    }

    this.setState({
      sidesList: [
        { value: '', label: t('allStatus') },
        { value: 'BUY', label: t('buy') },
        { value: 'SELL', label: t('sell') },
      ],
    });
    this.setState({
      statusList: [
        { value: '', label: t('allStatus') },
        { value: 'Published', label: t('published') },
        { value: 'UnPublished', label: t('unPublished') },
        { value: 'Cancelled', label: t('cancelled') },
        { value: 'Completed', label: t('completed') }
      ],
    });

    this.initializeMyOrders();
  }

  initializeMyOrders = () => {
    const { asset, side, status, dateTo, dateFrom } = this.state;
    let initilizeValues = {
      Asset: asset.value,
      Side: side.value,
      Amount: "0",
      DateFrom: dateFrom ? moment.utc(dateFrom).format('YYYY-MM-DD') : '',
      DateTo: dateTo ? moment.utc(dateTo).format('YYYY-MM-DD') : '',
      StatusText: status.value
    }

    this.props.getMyOrders();
  }

  handleDateTo = value => {
    this.setState({dateTo: value}, () => this.initializeMyOrders());
  };

  handleDateFrom = value => {
    this.setState({dateFrom: value}, () => this.initializeMyOrders());
  };

  handleChangeStatus = selection => {
    this.setState({status: selection}, () => this.initializeMyOrders());
  }

  handleChangeSide = selection => {
    this.setState({side: selection}, () => this.initializeMyOrders());
  }

  handleChangeAsset = selection => {
    this.setState({asset: selection}, () => this.initializeMyOrders());
  }
  

  render() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'p2p.myOrders');
    return (
      <PageWrap>
        <Box pad="medium" background="background-3">
          <Heading level={3} margin={{ bottom: '15px' }}>
            {t('pageTitle')}
          </Heading>
          <MyOrdersTable initializeMyOrders={this.initializeMyOrders} />
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
  connect(mapStateToProps, { triggerModalOpen, getMyOrders })(MyOrders),
);
