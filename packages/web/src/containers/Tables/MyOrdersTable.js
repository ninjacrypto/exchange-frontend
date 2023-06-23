import React, { Component, Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { TableWrapper } from 'containers/Tables';
import { moment } from 'i18n';
import { Loading } from 'components/Loading';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { Tooltip } from 'components/Tooltip';
import { Box, Button, Text } from 'components/Wrapped';
import { StatusGood, View } from 'grommet-icons';
import {
  formatCrypto,
  formatNumberToPlaces,
  numberParser,
  formatFiat,
  formatNumber,
} from 'utils/numbers';
import { withRouter } from 'react-router-dom';
import styles from './Table.module.scss';

import _ from 'lodash';

export const MyOrdersTable = withRouter(
  withNamespaces()(
    ({ myOrders, t: translate, initializeMyOrders, profile, history }) => {
      const t = nestedTranslate(translate, 'tables.myOrders');

      const renderOne = ({ value, original }) => {
        return (
          <div>
            <div>{`${original.BaseCurrency}/${original.QuoteCurrency}`}</div>
            <div>
              {moment(original.StartDate).format('YYYY-MM-DD HH:mm:ss Z')}
            </div>
          </div>
        );
      };

      const renderTwo = ({ value, original }) => {
        return (
          <div>
            <div>{`${value} ${original.BaseCurrency}`}</div>
          </div>
        );
      };

      const renderThree = ({ value, original }) => {
        return (
          <div>
            <div>{`${formatFiat(value)} ${original.QuoteCurrency}`}</div>
          </div>
        );
      };

      const renderFour = ({ value, original }) => {
        let paymentMedthod = '';
        original.UserPaymentMethod.forEach(evl => {
          if (value === evl.UserPaymentId) {
            paymentMedthod = evl.MethodName;
          }
        });

        return (
          <React.Fragment>
            {!_.isEmpty(paymentMedthod) && (
              <Box pad="none" direction="row" justify="start">
                <Box
                  pad={{ horizontal: 'small', vertical: 'xxsmall' }}
                  background="background-1"
                >
                  <Text size="xsmall">{paymentMedthod}</Text>
                </Box>
              </Box>
            )}
          </React.Fragment>
        );
      };

      const renderPaymentDate = ({ value, original }) => {
        return (
          <Box pad="none" direction="row" justify="center">
            {_.isEqual(original.TakerCid, 0) && (
              <React.Fragment>
                {!_.isEqual(original.ConfirmDate, null) && (
                  <Tooltip
                    description={moment(original.ConfirmDate).format('YYYY-MM-DD HH:mm:ss Z')}
                    position="bottom"
                  >
                    <StatusGood size="medium" color="green" />
                  </Tooltip>
                )}
              </React.Fragment>
            )}
            {!_.isEqual(original.TakerCid, 0) && (
              <React.Fragment>
                {!_.isEqual(value, null) && (
                  <Tooltip
                    description={moment(value).format('YYYY-MM-DD HH:mm:ss Z')}
                    position="bottom"
                  >
                    <StatusGood size="medium" color="green" />
                  </Tooltip>
                )}
              </React.Fragment>
            )}
          </Box>
        );
      };

      const renderConfirmDate = ({ value, original }) => {
        return (
          <Box pad="none" direction="row" justify="center">
            {_.isEqual(original.TakerCid, 0) && (
              <React.Fragment>
                {!_.isEqual(original.PaymentDate, null) && (
                  <Tooltip
                    description={moment(original.PaymentDate).format(
                      'YYYY-MM-DD HH:mm:ss Z',
                    )}
                    position="bottom"
                  >
                    <StatusGood size="medium" color="green" />
                  </Tooltip>
                )}
              </React.Fragment>
            )}
            {!_.isEqual(original.TakerCid, 0) && (
              <React.Fragment>
                {!_.isEqual(value, null) && (
                  <Tooltip
                    description={moment(value).format('YYYY-MM-DD HH:mm:ss Z')}
                    position="bottom"
                  >
                    <StatusGood size="medium" color="green" />
                  </Tooltip>
                )}
              </React.Fragment>
            )}
          </Box>
        );
      };

      const renderCancelDate = ({ value, original }) => {
        return (
          <Box pad="none" direction="row" justify="center">
            {!_.isEqual(value, null) && (
              <Tooltip
                description={moment(value).format('YYYY-MM-DD HH:mm:ss Z')}
                position="bottom"
              >
                <StatusGood size="medium" color="green" />
              </Tooltip>
            )}
          </Box>
        );
      };

      const renderView = ({ value }) => {
        return (
          <Box
            pad="none"
            className={styles.actionIconButtonGroup}
            align="center"
            justify="center"
          >
            <Button
              onClick={() => history.push(`/p2p/order-details/${value}`)}
              className={styles.actionIconButton}
            >
              <View size="small" color="primary" />
            </Button>
          </Box>
        );
      };

      const renderSide = ({ value, original }) => {
        return (
          <Box pad="none">
            {!_.isEqual(value, 0) && (
              <React.Fragment>
                {_.isEqual(original.TakerSide, 'BUY') && (
                  <Text color="green">{t(original.TakerSide.toLowerCase())}</Text>
                )}
                {_.isEqual(original.TakerSide, 'SELL') && (
                  <Text color="red">{t(original.TakerSide.toLowerCase())}</Text>
                )}
              </React.Fragment>
            )}
            {_.isEqual(value, 0) && (
              <React.Fragment>
                {_.isEqual(original.MakerSide, 'BUY') && (
                  <Text color="green">{t(original.MakerSide.toLowerCase())}</Text>
                )}
                {_.isEqual(original.MakerSide, 'SELL') && (
                  <Text color="red">{t(original.MakerSide.toLowerCase())}</Text>
                )}
              </React.Fragment>
            )}
          </Box>
        );
      };

      return (
        <Fragment>
          {myOrders ? (
            <TableWrapper
              data={myOrders}
              hideColumns={[]}
              columns={[
                {
                  Header: t('asset/fiat'),
                  accessor: 'OrderId',
                  Cell: renderOne,
                },
                {
                  Header: t('side'),
                  accessor: 'TakerCid',
                  Cell: renderSide,
                  maxWidth: 100,
                },
                {
                  Header: t('size'),
                  accessor: 'Size',
                  Cell: renderTwo,
                },
                {
                  Header: t('price'),
                  accessor: 'Price',
                  Cell: renderThree,
                },
                {
                  Header: t('paymentMethod'),
                  accessor: 'MakerPaymentMethodId',
                  Cell: renderFour,
                },
                {
                  Header: (
                    <Box pad="none" justify="center" align="center">
                      {t('youPaid')}
                    </Box>
                  ),
                  accessor: 'PaymentDate',
                  id: 'PaymentDate',
                  maxWidth: 100,
                  Cell: renderPaymentDate,
                },
                {
                  Header: (
                    <Box pad="none" justify="center" align="center">
                      {t('youReceived')}
                    </Box>
                  ),
                  accessor: 'ConfirmDate',
                  id: 'ConfirmDate',
                  maxWidth: 100,
                  Cell: renderConfirmDate,
                },
                {
                  Header: (
                    <Box pad="none" justify="center" align="center">
                      {t('cancelled')}
                    </Box>
                  ),
                  accessor: 'CancelDate',
                  id: 'CancelDate',
                  maxWidth: 100,
                  Cell: renderCancelDate,
                },
                {
                  Header: (
                    <Box pad="none" justify="center" align="center">
                      {t('view')}
                    </Box>
                  ),
                  accessor: 'OrderGuid',
                  maxWidth: 100,
                  Cell: renderView,
                },
              ]}
              defaultSorted={[
                {
                  id: 'StartDate',
                  desc: false,
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
    },
  ),
);

const mapStateToProps = ({ p2p, user: { profile } }) => ({
  myOrders: p2p.myOrders,
  profile: profile,
});

export default withNamespaces()(connect(mapStateToProps)(MyOrdersTable));
