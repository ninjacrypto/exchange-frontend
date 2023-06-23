import React, { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import { TableWrapper } from 'containers/Tables';
import { TradingRequirements } from 'containers/TradingRequirements';
import { withNamespaces } from 'react-i18next';

import { nestedTranslate } from 'utils/strings';
import { Loading } from 'components/Loading';
import { Button, Heading, Modal, Box, Text } from 'components/Wrapped';
import _ from 'lodash';
import styles from './Table.module.scss';
import { withRouter } from 'react-router-dom';
import { Columns } from 'react-bulma-components';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import Loader from 'react-loader-spinner';
import {
  Form,
  FormField,
  TextField,
  SelectField,
  CheckBox,
  IconOption,
  NumberInput,
  NumberInputAddon,
} from 'components/Form';
import {
  formatCrypto,
  formatNumberToPlaces,
  numberParser,
  formatFiat,
  formatNumber,
} from 'utils/numbers';
import { triggerToast } from 'redux/actions/ui';
import instance, { authenticatedInstance } from 'api';

export const AddOrderModal = withRouter(
  withNamespaces()(({ t: translate, rowData, handleSuccess, history }) => {
    const t = nestedTranslate(translate, 'tables.offers');
    const [offerData, setOfferData] = React.useState({});
    const [counter, setCounter] = React.useState(30);
    const [refresh, setRefresh] = React.useState(false);

    const getSingleOfferUpdate = async id => {
      try {
        let value = {
          OfferId: id,
        };

        const { data } = await instance({
          url: `/p2p/offers`,
          method: 'POST',
          data: value,
        });

        if (data.Status === 'Success') {
          setOfferData(data.Data[0]);
          return true;
        }
      } catch (e) {}
    };

    useEffect(() => {
      if (_.isEmpty(offerData)) {
        setOfferData(rowData);
      }
    });

    // Third Attempts
    React.useEffect(() => {
      const timer =
        counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
      if (_.isEqual(timer, false)) {
        setRefresh(true);
        getSingleOfferUpdate(offerData.Id).then(state => {
          if (_.isEqual(state, true)) {
            setRefresh(false);
            setCounter(30);
          }
        });
      }
      return () => clearInterval(timer);
    }, [counter]);

    const validationSchema = () => {
      return Yup.object().shape({
        Pay: Yup.number()
          .required()
          .min(rowData.OrderLimit_LB)
          .max(rowData.OrderLimit_UB),
        Receive: Yup.number().required(),
      });
    };

    const handleOrderSubmit = async values => {
      let finalValues = {
        OfferId: values.OfferId,
        Size: values.Receive,
        TakerSide: values.TakerSide,
      };

      try {
        const { data } = await authenticatedInstance({
          url: '/p2p/add-order',
          method: 'POST',
          data: finalValues,
        });

        if (data.Status === 'Success') {
          triggerToast(data.Message, 'success');
          history.push(`/p2p/order-details/${data.Data.OrderGuid}`);
          if (handleSuccess) {
            handleSuccess();
          }
        } else {
          triggerToast(data.Message, 'error');
        }
      } catch (e) {
        triggerToast(e.Message, 'error');
      }
    };

    return (
      <React.Fragment>
        {!_.isEmpty(offerData) && (
          <Columns className={styles.customizedColumns}>
            <Columns.Column size={7} className={styles.customizedColumn}>
              <Box pad="none" margin={{ bottom: 'small' }}>
                <Box pad="none" direction="row" align="center">
                  <Box pad="xsmall">
                    <Text size="small" weight="bold">
                      {offerData.User.DisplayName}
                    </Text>
                  </Box>
                  <Box pad="none" direction="row">
                    <Box
                      pad={{ horizontal: 'xsmall' }}
                      border={{
                        color: 'border-1',
                        size: 'xsmall',
                        side: 'right',
                      }}
                      round="false"
                    >{`${offerData.User.OrderCompleteCount} ${t(
                      'orders',
                    )}`}</Box>
                    <Box pad={{ horizontal: 'small' }}>{`${
                      offerData.User.Rating
                    }% ${t('completion')}`}</Box>
                  </Box>
                </Box>
                <Box pad={{ vertical: 'small' }}>
                  <Columns className={styles.customizedColumns}>
                    <Columns.Column
                      size={6}
                      className={styles.customizedColumn}
                    >
                      <Box pad="xsmall">
                        <Text size="xsmall">{t('price')}</Text>
                        <Box pad="none" direction="row">
                          <Text size="small" margin={{ right: 'small' }}>
                            {`${formatNumberToPlaces(offerData.Price, 2)} ${
                              offerData.QuoteCurrency
                            }`}
                          </Text>
                          {!refresh && (
                            <Text size="xsmall">{`${counter} s`}</Text>
                          )}
                          {refresh && (
                            <Text size="xsmall">
                              <Loader
                                color="var(--primary)"
                                height="20"
                                width="20"
                                type="Oval"
                              />
                            </Text>
                          )}
                        </Box>
                      </Box>
                      <Box pad="xsmall">
                        <Text size="xsmall">{t('paymentTimeLimit')}</Text>
                        <Text size="small">
                          {`${offerData.PaymentTimeLimit} minutes`}
                        </Text>
                      </Box>
                    </Columns.Column>
                    <Columns.Column
                      size={6}
                      className={styles.customizedColumn}
                    >
                      <Box pad="xsmall">
                        <Text size="xsmall">{t('available')}</Text>
                        <Text size="small">{`${formatNumberToPlaces(
                          offerData.Size -
                            offerData.FilledSize -
                            offerData.FilledSizeInProcess,
                          8,
                        )} ${offerData.BaseCurrency}`}</Text>
                      </Box>
                      <Box pad="xsmall">
                        <Text size="xsmall">{t('paymentMethod')}</Text>
                        {offerData.UserPaymentMethod.map((evl, index) => (
                          <Text size="small" key={index}>
                            {evl.MethodName}
                          </Text>
                        ))}
                      </Box>
                    </Columns.Column>
                  </Columns>
                </Box>
                <Box pad="xsmall">
                  <Box pad={{ bottom: 'xsmall' }}>
                    <Text size="small">{t('termsAndConditions')}</Text>
                  </Box>
                  <Text size="xsmall">{t('tACWarning')}</Text>
                </Box>
              </Box>
            </Columns.Column>
            <Columns.Column size={5} className={styles.customizedColumn}>
              <Box pad="none" margin={{ bottom: 'small' }}>
                <Formik
                  initialValues={{
                    OfferId: offerData.Id,
                    Pay: '',
                    Receive: '',
                    TakerSide: _.isEqual(offerData.Side, 'SELL')
                      ? 'BUY'
                      : 'SELL',
                  }}
                  validationSchema={validationSchema()}
                  onSubmit={values => handleOrderSubmit(values)}
                >
                  {({ values, setFieldValue, validateField }) => (
                    <Form>
                      <Box pad="none" margin={{ bottom: 'small' }}>
                        <FormField
                          type="text"
                          name="Pay"
                          label={t('iWantToPay')}
                        >
                          <NumberInputAddon
                            className={styles.p2pTextBox}
                            placeholder={`${formatFiat(
                              offerData.OrderLimit_LB,
                              false,
                            )}-${formatFiat(offerData.OrderLimit_UB, false)}`}
                            addonText={{
                              content: t('all'),
                              color: 'primary',
                              // background: 'primary',
                              onClick: () => {
                                setFieldValue(
                                  'Pay',
                                  formatNumber(offerData.OrderLimit_UB, 2),
                                );
                                setFieldValue(
                                  'Receive',
                                  formatNumber(
                                    offerData.OrderLimit_UB / offerData.Price,
                                    8,
                                  ),
                                );
                              },
                            }}
                            addonEnd={{
                              content: `${offerData.QuoteCurrency}`,
                              background: 'primary',
                            }}
                            inputOnChange={e => {
                              const {
                                target: { name, value },
                              } = e;
                              const newValue = numberParser.parse(value);
                              setFieldValue(
                                'Receive',
                                formatNumber(newValue / offerData.Price, 8),
                              );
                            }}
                            precision={2}
                            margin={{ bottom: 'none' }}
                          />
                          <Text size="xsmall" color="red">{`${
                            _.isEqual(offerData.Side, 'SELL')
                              ? t('buy')
                              : t('sell')
                          } Limit:  ${offerData.OrderLimit_LB}-${
                            offerData.OrderLimit_UB
                          } ${offerData.QuoteCurrency}`}</Text>
                        </FormField>
                      </Box>
                      <FormField
                        type="text"
                        name="Receive"
                        label={t('iWillReceive')}
                      >
                        <NumberInput
                          className={styles.p2pTextBox}
                          placeholder="0.00000000"
                          addonEnd={{
                            content: `${offerData.BaseCurrency}`,
                            background: 'primary',
                          }}
                          inputOnChange={e => {
                            const {
                              target: { name, value },
                            } = e;
                            const newValue = numberParser.parse(value);
                            setFieldValue(
                              'Pay',
                              formatNumber(newValue * offerData.Price, 2),
                            );
                          }}
                          precision={8}
                        />
                      </FormField>
                      <Box pad="none" direction="row" gap="small">
                        <Box pad="none" basis="medium">
                          <Button
                            color="primary"
                            primary={false}
                            fill="horizontal"
                            onClick={() => handleSuccess()}
                          >
                            {t('cancel')}
                          </Button>
                        </Box>
                        <Box pad="none" basis="medium">
                          <Button
                            color="primary"
                            type="submit"
                            fill="horizontal"
                            disabled={
                              values.Pay < offerData.OrderLimit_LB ||
                              values.Pay > offerData.OrderLimit_UB
                            }
                          >
                            {`${
                              _.isEqual(offerData.Side, 'SELL')
                                ? t('buy')
                                : t('sell')
                            } ${offerData.BaseCurrency}`}
                          </Button>
                        </Box>
                      </Box>
                    </Form>
                  )}
                </Formik>
              </Box>
            </Columns.Column>
          </Columns>
        )}
      </React.Fragment>
    );
  }),
);

class OffersTable extends React.PureComponent {
  state = {
    isOpen: false,
    rowData: {},
    notVerified: false,
  };

  componentDidMount() {}

  toggleModal = () => {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'p2p.offers');
    this.setState({ isOpen: !this.state.isOpen }, () => {
      if (this.state.isOpen) {
        this.props.handleRefresh({ label: t('notNow'), value: 'notNow' });
      } else {
        this.props.handleRefresh({
          label: `20s ${t('toRefresh')}`,
          value: '20000',
        });
      }
    });
  };

  renderPrice({ value, original }) {
    return (
      <span>
        <span style={{ fontWeight: '600', fontSize: '20px' }}>
          {formatNumberToPlaces(value, 2)}
        </span>{' '}
        {original.QuoteCurrency}
      </span>
    );
  }

  renderAdvertiser = ({ original }) => {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'tables.offers');
    return (
      <React.Fragment>
        <Box pad="none">{original.User.DisplayName}</Box>
        <Box pad="none" direction="row">
          <Box pad="none" direction="row">
            <Box
              pad={{ vertical: 'xxsmall', horizontal: 'xsmall' }}
              background="background-3"
            >
              <Text size="xsmall">{`${original.User.OrderCompleteCount} ${t(
                'orders',
              )}`}</Text>
            </Box>
          </Box>
          <Box pad={{ horizontal: 'xsmall' }} align="center" justify="center">
            <Box pad="none" className={styles.divider}></Box>
          </Box>
          <Box pad="none" direction="row">
            <Box
              pad={{ vertical: 'xxsmall', horizontal: 'xsmall' }}
              background="background-3"
            >
              <Text size="xsmall">{`${original.User.Rating}% ${t(
                'completion',
              )}`}</Text>
            </Box>
          </Box>
        </Box>
      </React.Fragment>
    );
  };

  renderLimit = ({ value, original }) => {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'tables.offers');
    return (
      <div>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '50px', fontSize: '12px', marginRight: '10px' }}>
            {t('available')}
          </div>
          <div>
            {formatNumberToPlaces(
              value - original.FilledSize - original.FilledSizeInProcess,
              8,
            )}
            &nbsp;{original.BaseCurrency}
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '50px', fontSize: '12px', marginRight: '10px' }}>
            {t('limit')}
          </div>
          <div>
            {formatNumberToPlaces(original.OrderLimit_LB, 2)}&nbsp;
            {original.QuoteCurrency} -{' '}
            {formatNumberToPlaces(original.OrderLimit_UB, 2)}&nbsp;
            {original.QuoteCurrency}
          </div>
        </div>
      </div>
    );
  };

  handleAction = data => {
    const {
      isAuthenticated,
      kycStatus,
      isMobileVerified,
      history,
      loginName,
    } = this.props;
    if (!isAuthenticated) {
      history.push(`/login`);
      return;
    }

    if (
      _.isEqual(kycStatus.toLowerCase(), 'approved') &&
      isMobileVerified &&
      !_.isEqual(loginName, '')
    ) {
      this.setState({ rowData: data }, () => {
        this.toggleModal();
      });
    } else {
      this.setState({ notVerified: true }, () => {
        this.toggleModal();
      });
    }
  };

  renderPaymentMethod = ({ value, original }) => {
    return (
      <React.Fragment>
        <Box pad="none">
          {value.map((evl, index) => (
            <Box pad="none" direction="row" align="start" justify="start">
              <Box
                pad={{ vertical: 'xxsmall', horizontal: 'xsmall' }}
                background="background-3"
                margin={{ bottom: 'xsmall' }}
              >
                <Text size="xsmall" key={index}>
                  {evl.MethodName}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
      </React.Fragment>
    );
  };

  renderAction = ({ value, original }) => {
    const { t: translate, side, kycStatus, isMobileVerified } = this.props;
    const t = nestedTranslate(translate, 'tables.offers');

    return (
      <React.Fragment>
        <Button
          color={_.isEqual(side, 'SELL') ? 'green' : 'red'}
          primary={false}
          size="xsmall"
          onClick={() => this.handleAction(original)}
        >
          {`${_.isEqual(side, 'SELL') ? t('buy') : t('sell')} ${
            original.BaseCurrency
          }`}
        </Button>

        {!this.state.notVerified && (
          <Modal
            show={this.state.isOpen}
            toggleModal={this.toggleModal}
            width="large"
            pad="medium"
          >
            <AddOrderModal
              handleSuccess={this.toggleModal}
              rowData={this.state.rowData}
            />
          </Modal>
        )}

        {this.state.notVerified && (
          <TradingRequirements
            show={this.state.isOpen}
            p2pEligible={this.state.p2pEligible}
            handleSuccess={this.toggleModal}
          />
        )}
      </React.Fragment>
    );
  };

  render() {
    const { offers, t: translate, side } = this.props;
    const t = nestedTranslate(translate, 'tables.offers');

    return (
      <Fragment>
        {offers ? (
          <TableWrapper
            data={offers}
            columns={[
              {
                Header: t('advertisers'),
                accessor: 'User',
                Cell: this.renderAdvertiser,
                minWidth: 250,
              },
              {
                Header: t('price'),
                accessor: 'Price',
                Cell: this.renderPrice,
                minWidth: 200,
              },
              {
                Header: t('limit/available'),
                accessor: 'Size',
                Cell: this.renderLimit,
                minWidth: 300,
              },
              {
                Header: t('payment'),
                accessor: 'UserPaymentMethod',
                Cell: this.renderPaymentMethod,
                minWidth: 200,
              },
              {
                Header: t('trade'),
                accessor: 'Id',
                Cell: this.renderAction,
                minWidth: 150,
              },
            ]}
            showPagination={true}
            minRows={3}
            pageSize={10}
            style={{ fontSize: '14px' }}
          />
        ) : (
          <Loading />
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = ({
  user,
  auth: { isAuthenticated },
  user: {
    profile: { kycStatus, isMobileVerified, loginName },
    apiKeys,
  },
}) => ({
  apiKeys: apiKeys,
  isAuthenticated: isAuthenticated,
  kycStatus,
  isMobileVerified,
  loginName,
});

export default withRouter(
  withNamespaces()(connect(mapStateToProps, {})(OffersTable)),
);
