import React, { Component, Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { TableWrapper } from 'containers/Tables';
import { moment } from 'i18n';
import { Columns } from 'react-bulma-components';
import { Loading } from 'components/Loading';
import { Tooltip } from 'components/Tooltip';
import * as Yup from 'yup';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import {
  Close,
  FormEdit,
  CloudUpload,
  CloudDownload,
  StatusWarning,
} from 'grommet-icons';
import styles from './Table.module.scss';
import { Link } from 'react-router-dom';
import {
  Box,
  Modal,
  Button,
  Text,
  CheckBox,
  RadioButtonGroup,
} from 'components/Wrapped';
import instance, { authenticatedInstance } from 'api';
import { triggerToast } from 'redux/actions/ui';
import _ from 'lodash';

export const ActionModal = withNamespaces()(
  ({
    t: translate,
    handleSuccess,
    type,
    rowData,
    callBackInitializeMyOffers,
    profile,
  }) => {
    const t = nestedTranslate(translate, 'tables.myOffers');

    const submitDelete = async rowData => {
      try {
        const data = await authenticatedInstance({
          method: 'POST',
          url: `/p2p/cancel-offer/${rowData.Id}`,
        });

        if (data.data.Status === 'Success') {
          triggerToast(data.data.Message, 'success', 2500);
          callBackInitializeMyOffers();
          if (handleSuccess) {
            handleSuccess();
          }
        } else {
          triggerToast(data.data.Message, 'error', 2500);
        }
      } catch (e) {}
    };

    const confirmDelete = () => {
      submitDelete(rowData);
    };

    const confirmChanges = async () => {
      let values = {};
      values['offerId'] = rowData.Id;
      values['IsActive'] = rowData.IsActive ? false : true;

      try {
        const data = await authenticatedInstance({
          method: 'POST',
          url: `/p2p/update-offer-status`,
          data: values,
        });

        if (data.data.Status === 'Success') {
          triggerToast(data.data.Message, 'success', 2500);
          callBackInitializeMyOffers();
          if (handleSuccess) {
            handleSuccess();
          }
        } else {
          triggerToast(data.data.Message, 'error', 2500);
        }
      } catch (e) {}
    };

    return (
      <React.Fragment>
        {_.isEqual(type, 'CloseOffer') && (
          <React.Fragment>
            <Box pad="none" margin={{ bottom: 'medium' }} align="center">
              <Box pad="none" margin={{ bottom: 'medium' }} align="center">
                <StatusWarning size="xlarge" color="primary" />
              </Box>
              <Box pad="none" margin={{ bottom: 'medium' }} align="center">
                <Text size="medium">{t('confirmClose')}</Text>
                <Text size="small">{t('confirmCloseMSG')}</Text>
              </Box>
            </Box>
            <Columns className={styles.customizedColumns} breakpoint="mobile">
              <Columns.Column size={6} className={styles.customizedColumn}>
                <Button
                  color="primary"
                  primary={false}
                  type="button"
                  onClick={() => handleSuccess()}
                  fill="horizontal"
                  margin={{ bottom: '20px' }}
                >
                  {t('cancel')}
                </Button>
              </Columns.Column>
              <Columns.Column size={6} className={styles.customizedColumn}>
                <Button
                  color="primary"
                  type="button"
                  onClick={confirmDelete}
                  fill="horizontal"
                  margin={{ bottom: '20px' }}
                >
                  {t('close')}
                </Button>
              </Columns.Column>
            </Columns>
          </React.Fragment>
        )}
        {_.isEqual(type, 'PublishAndUnPublish') && (
          <React.Fragment>
            <Box pad="none" margin={{ bottom: 'medium' }} align="center">
              <Box pad="none" margin={{ bottom: 'medium' }} align="center">
                <StatusWarning size="xlarge" color="primary" />
              </Box>
              <Box pad="none" margin={{ bottom: 'medium' }} align="center">
                <Text size="medium">
                  {t(
                    `confirm${
                      _.isEqual(rowData.IsActive, true)
                        ? 'UnPublishing'
                        : 'Publishing'
                    }theOffer?`,
                  )}
                </Text>
              </Box>
            </Box>
            <Columns className={styles.customizedColumns} breakpoint="mobile">
              <Columns.Column size={6} className={styles.customizedColumn}>
                <Button
                  color="primary"
                  primary={false}
                  type="button"
                  onClick={() => handleSuccess()}
                  fill="horizontal"
                  margin={{ bottom: '20px' }}
                >
                  {t('cancel')}
                </Button>
              </Columns.Column>
              <Columns.Column size={6} className={styles.customizedColumn}>
                <Button
                  color="primary"
                  type="button"
                  onClick={confirmChanges}
                  fill="horizontal"
                  margin={{ bottom: '20px' }}
                >
                  {_.isEqual(rowData.IsActive, true)
                    ? t('unpublish')
                    : t('publish')}
                </Button>
              </Columns.Column>
            </Columns>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  },
);

export const MyOffersTable = withNamespaces()(
  ({ myOffers, t: translate, initializeMyOffers, profile, history }) => {
    const t = nestedTranslate(translate, 'tables.myOffers');
    const [isOpen, setIsOpen] = useState(false);
    const [actionType, setActionType] = useState('');
    const [rowData, setRowData] = useState();

    const toggleModal = () => setIsOpen(!isOpen);

    const renderOne = ({ value, original }) => {
      return (
        <div>
          <div>{value}</div>
          <div>{original.Side}</div>
          <div>{`${original.BaseCurrency} / ${original.QuoteCurrency}`}</div>
        </div>
      );
    };

    const renderTwo = ({ value, original }) => {
      return (
        <div>
          <div>{value}</div>
          <div>{original.FilledSize}</div>
          <div>{`${original.OrderLimit_LB} ~ ${original.OrderLimit_UB} ${original.QuoteCurrency}`}</div>
        </div>
      );
    };

    const renderThree = ({ value, original }) => {
      return (
        <div>
          <div>{value}</div>
        </div>
      );
    };

    const renderFour = ({ value, original }) => {
      return (
        <div>
          <div>
            {value.map((evl, index) => (
              <div key={index}>{evl.MethodName}</div>
            ))}
          </div>
        </div>
      );
    };

    const renderFive = ({ value, original }) => {
      return (
        <div>
          {original.LastUpdate && (
            <div>
              {moment(original.LastUpdate).format('YYYY-MM-DD HH:mm:ss Z')}
            </div>
          )}
          <div>{moment(value).format('YYYY-MM-DD HH:mm:ss Z')}</div>
        </div>
      );
    };

    const renderStatus = ({ value: status }) => {
      return <Box pad="none">{t(`${status.toLowerCase()}`)}</Box>;
    };

    const renderActions = ({ value, original }) => {
      return (
        <React.Fragment>
          {_.isEqual(original.Status, false) && (
            <div className={styles.actionIconButtonGroup}>
              <Tooltip
                description={
                  _.isEqual(original.IsActive, true)
                    ? t('unpublish')
                    : t('publish')
                }
                position="top"
              >
                <Button
                  className={styles.actionIconButton}
                  onClick={() => {
                    setActionType('PublishAndUnPublish');
                    setRowData(original);
                    toggleModal();
                  }}
                >
                  {original.IsActive && (
                    <CloudDownload size="medium" color="primary" />
                  )}
                  {!original.IsActive && (
                    <CloudUpload size="medium" color="primary" />
                  )}
                </Button>
              </Tooltip>
              <Tooltip
                description={t('edit')}
                position="top"
              >
                <Link to={`/p2p/offer-edit/${original.Id}`}>
                  <Button className={styles.actionIconButton}>
                    <FormEdit size="medium" color="primary" />
                  </Button>
                </Link>
              </Tooltip>
              <Tooltip
                description={t('close')}
                position="top"
              >
              <Button
                className={styles.actionIconButton}
                onClick={() => {
                  setActionType('CloseOffer');
                  setRowData(original);
                  toggleModal();
                }}
              >
                <Close size="medium" color="primary" />
              </Button>
              </Tooltip>
            </div>
          )}
          <Modal
            show={isOpen}
            toggleModal={toggleModal}
            width={_.isEqual(actionType, 'EditOffer') ? 'large' : 'medium'}
            pad="medium"
            heading={
              _.isEqual(actionType, 'CloseOffer')
                ? t('closeMyOffer')
                : _.isEqual(actionType, 'PublishAndUnPublish') &&
                  _.isEqual(rowData.IsActive, true)
                ? t('unPublishMyOffer')
                : t('publishMyOffer')
            }
          >
            <ActionModal
              handleSuccess={toggleModal}
              type={actionType}
              rowData={rowData}
              callBackInitializeMyOffers={callBackInitializeMyOffers}
              profile={profile}
            />
          </Modal>
        </React.Fragment>
      );
    };

    const callBackInitializeMyOffers = () => {
      initializeMyOffers();
    };

    return (
      <Fragment>
        {myOffers ? (
          <TableWrapper
            data={myOffers}
            hideColumns={[]}
            columns={[
              {
                Header: (
                  <React.Fragment>
                    <div>{t('postId')}</div>
                    <div>{t('type')}</div>
                    <div>{t('asset&Fiat')}</div>
                  </React.Fragment>
                ),
                accessor: 'Id',
                Cell: renderOne,
                minWidth: 200,
              },
              {
                Header: (
                  <React.Fragment>
                    <div>{t('totalAmount')}</div>
                    <div>{t('completedTradeQTY')}</div>
                    <div>{t('limit')}</div>
                  </React.Fragment>
                ),
                accessor: 'Size',
                Cell: renderTwo,
                minWidth: 200,
              },
              {
                Header: (
                  <React.Fragment>
                    <div>{t('price')}</div>
                    <div>{t('exchangeRate')}</div>
                  </React.Fragment>
                ),
                accessor: 'Price',
                Cell: renderThree,
                minWidth: 200,
              },
              {
                Header: (
                  <React.Fragment>
                    <div>{t('paymentMethod')}</div>
                  </React.Fragment>
                ),
                accessor: 'UserPaymentMethod',
                Cell: renderFour,
                minWidth: 200,
              },
              {
                Header: (
                  <React.Fragment>
                    <div>{t('lastUpdated')}</div>
                    <div>{t('createTime')}</div>
                  </React.Fragment>
                ),
                accessor: 'OrderDate',
                Cell: renderFive,
                minWidth: 300,
              },
              {
                Header: t('status'),
                accessor: 'StatusText',
                Cell: renderStatus,
                minWidth: 200,
              },
              {
                Header: t('actions'),
                accessor: 'Id',
                Cell: renderActions,
                minWidth: 200,
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
);

const mapStateToProps = ({ p2p, user: { profile } }) => ({
  myOffers: p2p.myOffers,
  profile: profile,
});

export default withNamespaces()(connect(mapStateToProps)(MyOffersTable));
