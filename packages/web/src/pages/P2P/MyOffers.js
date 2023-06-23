import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { triggerModalOpen } from 'redux/actions/ui';
import styles from './P2P.module.scss';
import { Box, Text, Heading, DateInput, Button } from 'components/Wrapped';
import { PageWrap } from 'components/Containers';
import { MyOffersTable } from 'containers/Tables';
import { ReactSelect } from 'components/Form/SelectField';
import { moment } from 'i18n';
import { getMyOffers } from 'redux/actions/p2p';
import { Link } from 'react-router-dom';
import { nestedTranslate } from 'utils/strings';
import { Columns } from 'react-bulma-components';

class MyOffers extends Component {
  constructor() {
    super();

    this.state = {
      allAssets: [],
      sidesList: [],
      statusList: [],
      side: { value: '', label: 'All status' },
      asset: { value: '', label: 'All assets' },
      status: { value: '', label: 'All status' },
      dateTo: '',
      dateFrom: '',
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
      tempAllCurrencies.unshift({ value: '', label: t('allAssets') });

      this.setState({
        allAssets: tempAllCurrencies.sort((a, b) =>
          a.value > b.value ? 1 : -1,
        ),
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
        { value: 'Completed', label: t('completed') },
      ],
    });

    this.initializeMyOffers();
  }

  initializeMyOffers = () => {
    const { asset, side, status, dateTo, dateFrom } = this.state;
    let initilizeValues = {
      Asset: asset.value,
      Side: side.value,
      Amount: '0',
      DateFrom: dateFrom ? moment.utc(dateFrom).format('YYYY-MM-DD') : '',
      DateTo: dateTo ? moment.utc(dateTo).format('YYYY-MM-DD') : '',
      StatusText: status.value,
    };

    this.props.getMyOffers(initilizeValues);
  };

  handleDateTo = value => {
    this.setState({ dateTo: value }, () => this.initializeMyOffers());
  };

  handleDateFrom = value => {
    this.setState({ dateFrom: value }, () => this.initializeMyOffers());
  };

  handleChangeStatus = selection => {
    this.setState({ status: selection }, () => this.initializeMyOffers());
  };

  handleChangeSide = selection => {
    this.setState({ side: selection }, () => this.initializeMyOffers());
  };

  handleChangeAsset = selection => {
    this.setState({ asset: selection }, () => this.initializeMyOffers());
  };

  render() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'p2p.myOffers');
    return (
      <PageWrap>
        <Box pad="medium" background="background-3">
          <Heading level={3} margin={{ bottom: '15px' }}>
            {t('pageTitle')}
          </Heading>
          <Columns className={styles.customizedColumns}>
            <Columns.Column size="8" className={styles.customizedColumn}>
              <Columns className={styles.customizedColumns}>
                <Columns.Column className={styles.customizedColumn}>
                  <Box
                    pad="none"
                    width={{ min: '150px' }}
                  >
                    <Text className={styles.formLabel}>{t('assetType')}</Text>
                    <ReactSelect
                      name="Base"
                      margin="none"
                      options={this.state.allAssets}
                      onChange={this.handleChangeAsset}
                      value={this.state.asset}
                      margin={{ bottom: '20px' }}
                    />
                  </Box>
                </Columns.Column>
                <Columns.Column className={styles.customizedColumn}>
                  <Box
                    pad="none"
                    width={{ min: '150px' }}
                  >
                    <Text className={styles.formLabel}>{t('type')}</Text>
                    <ReactSelect
                      name="Base"
                      margin="none"
                      options={this.state.sidesList}
                      onChange={this.handleChangeSide}
                      value={this.state.side}
                      margin={{ bottom: '20px' }}
                    />
                  </Box>
                </Columns.Column>
                <Columns.Column className={styles.customizedColumn}>
                  <Box
                    pad="none"
                    width={{ min: '150px' }}
                  >
                    <Text className={styles.formLabel}>{t('status')}</Text>
                    <ReactSelect
                      name="Base"
                      margin="none"
                      options={this.state.statusList}
                      onChange={this.handleChangeStatus}
                      value={this.state.status}
                      margin={{ bottom: '20px' }}
                    />
                  </Box>
                </Columns.Column>
                <Columns.Column className={styles.customizedColumn}>
                  <Box
                    pad="none"
                    width={{ min: '150px' }}
                  >
                    <Box pad="none" margin={{ bottom: '20px' }}>
                      <Text className={styles.formLabel}>{t('dateFrom')}</Text>
                      <DateInput onChange={this.handleDateFrom} />
                    </Box>
                  </Box>
                </Columns.Column>
                <Columns.Column className={styles.customizedColumn}>
                  <Box
                    pad="none"
                    width={{ min: '150px' }}
                  >
                    <Box pad="none" margin={{ bottom: '20px' }}>
                      <Text className={styles.formLabel}>{t('dateTo')}</Text>
                      <DateInput onChange={this.handleDateTo} />
                    </Box>
                  </Box>
                </Columns.Column>
              </Columns>
            </Columns.Column>
            <Columns.Column size="4" className={styles.customizedColumn}>
              <Box pad="none" pad={{ bottom: '20px' }} direction="row" justify="end" align="end" fill="verical">
                <Link to="/p2p/post-offer">
                  <Button
                    color="primary"
                    primary={false}
                    size="small"
                  >
                    {t('postNewOffer')}
                  </Button>
                </Link>
              </Box>
            </Columns.Column>
          </Columns>
          <MyOffersTable initializeMyOffers={this.initializeMyOffers} />
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
  connect(mapStateToProps, { triggerModalOpen, getMyOffers })(MyOffers),
);
