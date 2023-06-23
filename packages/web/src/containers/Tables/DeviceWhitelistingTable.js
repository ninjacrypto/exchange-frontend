import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import { moment } from 'i18n';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Transaction } from 'grommet-icons';

import { nestedTranslate } from 'utils';
import { Box, Paragraph, Modal } from 'components/Wrapped';
import { TableWrapper } from 'containers/Tables';
import { useMutation, queryCache } from 'react-query';
import { Button } from 'components/Wrapped';
import { exchangeApi } from 'api';
import { triggerToast } from 'redux/actions/ui';

  export const DeviceWhitelistingTable = withNamespaces()(({devicewhitelisting, t: translate }) => {
    const t = nestedTranslate(translate, 'tables.deviceWhitelisting');


      const [isOpen, setIsOpen] = useState(false);
      const [rowData, setRowData] = useState();
      const toggleModal = () => setIsOpen(!isOpen);

        const renderDelete = ({ value, original: { deviceID } }) => {

          return (
            <>
            {deviceID !== 'this' && (
              <Button
              color="primary"
              size="xsmall"
              onClick={() => {
                setRowData({ id: value })
                toggleModal();
              }}
              >
                {translate('buttons.delete')}
              </Button>
            )}

            <Modal show={isOpen} toggleModal={toggleModal}>
              <ConfirmDeviceWhitelistOptions handleSuccess={toggleModal} formData={rowData} />
            </Modal>
            </>
          );
        };

        return (
            <Fragment>
              {_.isEmpty(devicewhitelisting) ? (
                <Box align="center" gap="small">
                  <Transaction size="50px" />
                  <Paragraph>{t('noDeviceWhitelisted')}</Paragraph>
                </Box>
              ) : (

                <TableWrapper
                  data={devicewhitelisting}
                  filterBy={['addedOn']}
                  isFilterable={true}
                  fileName="whitelisted-Devices"
                  columns={[
                    {
                      Header: t('addedOn'),
                      id: 'addedOn',
                      accessor: ({ addedOn }) =>
                        moment
                          .utc(addedOn)
                          .local()
                          .format('L HH:mm'),
                    },
                    {
                      Header: t('device'),
                      id: 'deviceID',
                      accessor: ({ deviceID }) => _.isEqual(deviceID.toLowerCase(), 'this') ?  t(`${deviceID.toLowerCase()}`) : deviceID,
                    },
                    {
                      Header: t('browser'),
                      accessor: 'browser',
                    },
                    {
                        Header: t('ip'),
                        accessor: 'ip',
                      },
                      {
                        Header: t('os'),
                        accessor: 'os',
                      },
                    {
                      Header: t('delete'),
                      accessor: 'id',
                      Cell: renderDelete,
                      maxWidth: 125,
                    },
                  ]}
                  defaultSorted={[
                    {
                      id: 'addedOn',
                      desc: true,
                    }
                  ]}
                  showPagination={true}
                  minRows={10}
                  pageSize={10}
                  className="-highlight"
                />
              )}
            </Fragment>
          );
});


export const ConfirmDeviceWhitelistOptions = withNamespaces()(
  ({ t: translate, handleSuccess, formData }) => {
    const t = nestedTranslate(translate, 'account.deviceWhitelisting');
    const [mutate] = useMutation(
      ({ id }) => {
        return exchangeApi.removeFormDeviceWhitelist({ id });
      },
      {
        onSuccess: response => {
          queryCache.invalidateQueries('deviceWhitelisting');
          triggerToast(response.message, 'success', 2500);
          exchangeApi.getDeviceWhitelist();
        },
      },
    );

    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => {
      handleSuccess();
      setIsOpen(!isOpen)
    };

    const confirmDelete = () =>{
      mutate(formData);
    }

    return (
      <React.Fragment>
        <h3>{t('warning')}</h3>
        <p>{t('warningMessage')}</p>
        <br/>
        <p>{t('warningMessageOptions')}</p>
        <br/>
        <div style={{display: "flex"}}>
          <div style={{width: "50%", paddingRight:"5px"}}>
          <Button color="primary" type="button" onClick={confirmDelete} style={{width: "100%"}}>
          {t('yes')}
            </Button>
          </div>
          <div style={{width: "50%", paddingLeft:"5px"}}>
            
            <Button color="primary" type="button" onClick={toggleModal} style={{width: "100%"}}>
            {t('no')}
            </Button>
            </div>

        </div>

      </React.Fragment>
    );
  },
);

const mapStateToProps = ({ user }) => ({
    devicewhitelisting: user.devicewhitelistingInfo
  });
  
  export default withNamespaces()(
    connect(mapStateToProps, null)(DeviceWhitelistingTable),
  );
