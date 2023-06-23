import React, { useCallback, useState, useEffect, useMemo } from 'react';
import _ from 'lodash';
import { connect, useSelector } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { triggerModalOpen } from 'redux/actions/ui';
import {
  Box,
  Button,
  Paragraph,
  Text,
  Modal,
  Message,
} from 'components/Wrapped';
import styles from './P2P.module.scss';
import { Formik, Field } from 'formik';
import { OffersTable } from 'containers/Tables';
import {
  Form,
  FormField,
  TextField,
  SelectField,
  CheckBox,
  IconOption,
  IconValue,
  NumberInputAddon,
} from 'components/Form';
import { ReactSelect } from 'components/Form/SelectField';
import instance, { authenticatedInstance } from 'api';
import { nestedTranslate } from 'utils';
import * as Yup from 'yup';
import { triggerToast } from 'redux/actions/ui';
import { PageWrap } from 'components/Containers';
import { Columns } from 'react-bulma-components';
import MediaQuery from 'react-responsive';

class Offers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      paymentMethodOptions: [],
      currentBaseCurrency: '',
      selectedQuoteCurrency: { value: '', label: '' },
      selectedpaymentMethod: { value: '', label: '' },
      selectedRefreshTime: { value: '', label: '' },
      p2pCurrencies: {},
      side: 'SELL',
      offers: [],
      Amount: '',
      intervalTime: null,
      quoteCurrencies: [],
      baseCurrencies: [],
      afterTenth: [],
      firstTenth: [],
    };

    this.handleChangeData = this.handleChangeData.bind(this);
  }

  myVar = null;

  componentDidMount() {
    const { p2pCurrencies, t: translate } = this.props;
    const t = nestedTranslate(translate, 'p2p.offers');

    let refreshTime = [
      { label: t('notNow'), value: 'notNow' },
      { label: `5s ${t('toRefresh')}`, value: '5000' },
      { label: `10s ${t('toRefresh')}`, value: '10000' },
      { label: `20s ${t('toRefresh')}`, value: '20000' },
    ];
    this.setState(
      {
        refreshOptions: refreshTime,
        selectedRefreshTime: { label: `20s ${t('toRefresh')}`, value: '20000' },
      },
      () => this.handleRefresh(this.state.selectedRefreshTime),
    );
    if (!_.isEmpty(p2pCurrencies)) {
      this.renderCurrencies();
    }
  }

  componentDidUpdate() {
    const { p2pCurrencies } = this.props;
    const { baseCurrencies } = this.state;
    if (!_.isEmpty(p2pCurrencies)) {
      if (_.isEmpty(baseCurrencies)) {
        this.renderCurrencies();
      }
    }
  }

  renderCurrencies = () => {
    const { p2pCurrencies } = this.props;

    let tempBaseCurrencies = [];
    let tempBaseCurrencies2 = [];
    let tempQuoteCurrencies = [];
    Object.entries(p2pCurrencies).map(([key, value]) => {
      if (_.isEqual(key, 'Base')) {
        if (!_.isEmpty(value)) {
          this.setState({ firstTenth: value.slice(0, 10) });

          value.map(el => {
            let tempObj = {
              label: el.AssetName,
              value: el.AssetName,
            };
            tempBaseCurrencies.push(tempObj);
          });

          value.map((element, index) => {
            if (index > 9) {
              let tempObj = {
                label: element.AssetName,
                value: element.AssetName,
              };
              tempBaseCurrencies2.push(tempObj);
            }
          });

          this.setState(
            {
              baseCurrencies: tempBaseCurrencies,
              afterTenth: tempBaseCurrencies2,
              currentBaseCurrency: tempBaseCurrencies[0].value,
            },
            () => {
              value[0].Quotes.map(el => {
                let tempObj = {
                  label: el,
                  value: el,
                };
                tempQuoteCurrencies.push(tempObj);
              });

              this.setState(
                {
                  quoteCurrencies: tempQuoteCurrencies.sort((a, b) =>
                    a.value > b.value ? 1 : -1,
                  ),
                  selectedQuoteCurrency: tempQuoteCurrencies[0],
                },
                () => {
                  this.getPaymentMethods(tempQuoteCurrencies[0].value);
                  this.getOffers();
                },
              );
            },
          );
        }
      }
    });
  };

  componentWillUnmount() {
    clearInterval(this.myVar);
  }

  handleSideChange(data) {
    this.setState({ side: data }, () => this.getOffers());
  }

  getQuoteCurrencies() {
    const { p2pCurrencies } = this.props;
    const { currentBaseCurrency } = this.state;
    let tempQuoteCurrencies = [];
    Object.entries(p2pCurrencies).map(([key, value]) => {
      if (_.isEqual(key, 'Base')) {
        if (!_.isEmpty(value)) {
          value.map(el => {
            if (_.isEqual(el.AssetName, currentBaseCurrency)) {
              el.Quotes.map(el => {
                let tempObj = {
                  label: el,
                  value: el,
                };
                tempQuoteCurrencies.push(tempObj);
              });

              this.setState(
                {
                  quoteCurrencies: tempQuoteCurrencies.sort((a, b) =>
                    a.value > b.value ? 1 : -1,
                  ),
                  selectedQuoteCurrency: tempQuoteCurrencies[0],
                },
                () => {
                  this.getPaymentMethods(tempQuoteCurrencies[0].value);
                  this.getOffers();
                },
              );
            }
          });
        }
      }
    });
  }

  async getPaymentMethods(currencies) {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'p2p.offers');

    try {
      const { data } = await instance({
        url: `/p2p/payment-methods/${currencies}`,
        method: 'GET',
      });

      if (data.Status === 'Success') {
        let paymentMethodData = [];
        data.Data.forEach(element => {
          let avi = {
            label: element.MethodName,
            value: element.Id,
          };
          paymentMethodData.push(avi);
        });

        this.setState({
          paymentMethodOptions: paymentMethodData.sort((a, b) =>
            a.label > b.label ? 1 : -1,
          ),
        });
        this.setState({
          selectedpaymentMethod: { label: t('allPayments'), value: '' },
        });
      } else {
        this.setState({
          selectedpaymentMethod: { label: t('allPayments'), value: '' },
        });
      }
    } catch (e) {}
  }

  async getOffers() {
    try {
      const {
        selectedQuoteCurrency,
        currentBaseCurrency,
        selectedpaymentMethod,
        side,
        Amount,
      } = this.state;

      let avi = {
        Base: currentBaseCurrency,
        Quote: selectedQuoteCurrency.value,
        Side: side,
        PaymentMethodId: selectedpaymentMethod.value,
        Amount: Amount,
        // OfferId: 21
      };

      if (avi.Amount === '') {
        avi.Amount = '0';
      }

      if (avi.PaymentMethodId === '') {
        avi.PaymentMethodId = 0;
      }

      const { data } = await instance({
        url: `/p2p/offers`,
        method: 'POST',
        data: avi,
      });

      if (data.Status === 'Success') {
        this.setState({ offers: data.Data });
      }
    } catch (e) {}
  }

  handleChange = selectedOption => {
    this.setState({ selectedQuoteCurrency: selectedOption }, () => {
      this.getPaymentMethods(selectedOption.value);
      this.getOffers();
    });
  };

  handlePaymentMethodChange = selectedOption => {
    this.setState({ selectedpaymentMethod: selectedOption }, () => {
      this.getOffers();
    });
  };

  handleRefresh = selectedOption => {
    this.setState(
      {
        selectedRefreshTime: selectedOption,
        intervalTime: selectedOption.value,
      },
      () => {
        if (this.state.intervalTime !== 'notNow') {
          clearInterval(this.myVar);
          this.myVar = setInterval(() => {
            this.getOffers();
          }, this.state.intervalTime);
        } else {
          clearInterval(this.myVar);
        }
      },
    );
  };

  handleAmountChange = values => {
    this.setState({ Amount: values.Amount }, () => {
      this.getOffers();
    });
  };

  P2PForm = () => {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'p2p.offers');
    return (
      <React.Fragment>
        <Formik
          initialValues={{
            Amount: '',
            paymentId: '',
          }}
          onSubmit={values => {}}
        >
          {({ values }) => (
            <Form>
              <Columns className={styles.customizedColumns}>
                <Columns.Column size="7" className={styles.customizedColumn}>
                  <Columns className={styles.customizedColumns}>
                    <Columns.Column
                      size="5"
                      className={styles.customizedColumn}
                    >
                      <Box pad="none" margin={{ bottom: 'small' }}>
                        <FormField
                          type="text"
                          name="Amount"
                          label={t('amount.label')}
                        >
                          <NumberInputAddon
                            className={styles.p2pTextBox}
                            placeholder={t('amount.placeholder')}
                            addonEnd={{
                              content: t('search'),
                              background: 'primary',
                              onClick: () => this.handleAmountChange(values),
                            }}
                            addonText={{
                              content: this.state.selectedQuoteCurrency.value,
                            }}
                            margin="none"
                          />
                        </FormField>
                      </Box>
                    </Columns.Column>
                    <Columns.Column className={styles.customizedColumn}>
                      <Box
                        pad="none"
                        width={{ min: '150px' }}
                        margin={{ bottom: 'small' }}
                      >
                        <Text className={styles.formLabel}>{t('fiat')}</Text>
                        <ReactSelect
                          name="quote"
                          margin="none"
                          options={this.state.quoteCurrencies}
                          onChange={this.handleChange}
                          value={this.state.selectedQuoteCurrency}
                          components={{
                            Option: IconOption,
                            SingleValue: IconValue,
                          }}
                          style={{ borderColor: 'rgb(230 232 234)' }}
                        />
                      </Box>
                    </Columns.Column>
                    <Columns.Column className={styles.customizedColumn}>
                      <Box
                        pad="none"
                        width={{ min: '150px' }}
                        margin={{ bottom: 'small' }}
                      >
                        <Text className={styles.formLabel}>{t('payment')}</Text>
                        <ReactSelect
                          name="paymentId"
                          margin="none"
                          options={this.state.paymentMethodOptions}
                          onChange={this.handlePaymentMethodChange}
                          value={this.state.selectedpaymentMethod}
                          style={{ borderColor: 'rgb(230 232 234)' }}
                        />
                      </Box>
                    </Columns.Column>
                  </Columns>
                </Columns.Column>
                <Columns.Column size="5" className={styles.customizedColumn}>
                  <Box
                    pad="none"
                    pad={{ bottom: 'small' }}
                    direction="row"
                    justify="end"
                    align="end"
                    fill="verical"
                  >
                    <Box pad="none" width={{ min: '150px' }}>
                      <ReactSelect
                        name="paymentId"
                        margin="none"
                        options={this.state.refreshOptions}
                        onChange={this.handleRefresh}
                        value={this.state.selectedRefreshTime}
                      />
                    </Box>
                  </Box>
                </Columns.Column>
              </Columns>
              <Box
                pad={{ top: 'small' }}
                direction="row"
                justify="between"
                wrap="true"
              >
                <Box
                  pad="none"
                  justify="start"
                  direction="row"
                  gap="small"
                  wrap="true"
                ></Box>
                <Box pad="none" justify="end"></Box>
              </Box>
            </Form>
          )}
        </Formik>
      </React.Fragment>
    );
  };

  handleChangeData = data => {
    this.setState({ currentBaseCurrency: data }, () => {
      this.getQuoteCurrencies();
      this.getOffers();
    });
  };

  handleBaseCurrencies = data => {
    this.setState({ currentBaseCurrency: data.value }, () => {
      this.getQuoteCurrencies();
      this.getOffers();
    });
  };

  render() {
    const { profile, t: translate } = this.props;
    const t = nestedTranslate(translate, 'p2p.offers');
    const { side, offers } = this.state;

    return (
      <React.Fragment>
        <PageWrap>
          <Box pad="small" background="background-3">
            <Box
              pad="none"
              background="background-2"
              margin={{ bottom: 'small' }}
            >
              <Box
                pad={{ horizontal: 'small' }}
                direction="row"
                align="center"
              >
                <Box
                  pad="none"
                  direction="row"
                  pad="xsmall"
                  border={{ size: 'xsmall', color: 'border-1' }}
                  width={{ min: 'auto' }}
                  margin={{right: "small"}}
                >
                  <Box
                    pad={{ horizontal: 'small', vertical: 'xxsmall' }}
                    background={_.isEqual(side, 'SELL') ? 'green' : 'none'}
                    width={{ min: 'xxsmall' }}
                    align="center"
                    onClick={() => this.handleSideChange('SELL')}
                  >
                    <Text size="small">{t('buy')}</Text>
                  </Box>
                  <Box
                    pad={{ horizontal: 'small', vertical: 'xxsmall' }}
                    background={_.isEqual(side, 'BUY') ? 'red' : 'none'}
                    width={{ min: 'xxsmall' }}
                    align="center"
                    onClick={() => this.handleSideChange('BUY')}
                  >
                    <Text size="small">{t('sell')}</Text>
                  </Box>
                </Box>
                <MediaQuery minWidth={1224}>
                  <Box
                    pad="none"
                    direction="row"
                    fill="horizontal"
                    justify="between"
                  >
                    <div className={styles.BaseCurrenciesTabs}>
                      {!_.isEmpty(this.state.firstTenth) &&
                        this.state.firstTenth.map(item => (
                          <div
                            key={item.AssetName}
                            className={
                              this.state.currentBaseCurrency === item.AssetName
                                ? styles.activeBaseCurrency
                                : ''
                            }
                            onClick={() =>
                              this.handleChangeData(item.AssetName)
                            }
                          >
                            {item.AssetName}
                          </div>
                        ))}
                    </div>
                    {this.state.afterTenth.length > 0 && (
                    <Box pad="none">
                      <div
                        style={{
                          width: '150px',
                          marginLeft: '10px',
                          padding: '9px 0px',
                        }}
                      >
                        <ReactSelect
                          name="baseCurreny"
                          margin="none"
                          options={this.state.afterTenth}
                          onChange={this.handleBaseCurrencies}
                          value={{
                            label: this.state.currentBaseCurrency,
                            value: this.state.currentBaseCurrency,
                          }}
                        />
                      </div>
                    </Box>
                    )}
                  </Box>
                </MediaQuery>
                <MediaQuery maxWidth={1224}>
                  <Box
                    pad="none"
                    direction="row"
                    fill="horizontal"
                    justify="end"
                  >
                    <Box pad="none">
                      <div
                        style={{
                          width: '150px',
                          padding: '9px 0px',
                        }}
                      >
                        <ReactSelect
                          name="baseCurreny"
                          margin="none"
                          options={this.state.baseCurrencies}
                          onChange={this.handleBaseCurrencies}
                          value={{
                            label: this.state.currentBaseCurrency,
                            value: this.state.currentBaseCurrency,
                          }}
                        />
                      </div>
                    </Box>
                  </Box>
                </MediaQuery>
              </Box>
            </Box>
            <Box pad="none" background="background-3">
              <Box pad="none">{this.P2PForm()}</Box>
              <OffersTable
                offers={offers}
                side={this.state.side}
                handleRefresh={this.handleRefresh}
              />
            </Box>
          </Box>
        </PageWrap>
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ p2p: { p2pCurrencies }, user }) => ({
  p2pCurrencies: p2pCurrencies,
  profile: user.profile,
});

export default withNamespaces()(
  connect(mapStateToProps, { triggerModalOpen })(Offers),
);
