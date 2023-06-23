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

  export const IPWhitelistingTable = withNamespaces()(({ipwhitelisting, t: translate }) => {
    const t = nestedTranslate(translate, 'tables.ip-whitelisting');


      const [isOpen, setIsOpen] = useState(false);
      const [rowData, setRowData] = useState();
      const toggleModal = () => setIsOpen(!isOpen);

        const renderDelete = ({ value, original: { type }}) => {

          return (
            <>
            <Button
              color="primary"
              size="xsmall"
              onClick={() => {
                setRowData({ cidr: value, type: type })
                toggleModal();
              }}
            >
              {translate('buttons.delete')}
            </Button>

            <Modal show={isOpen} toggleModal={toggleModal}>
              <ConfirmIPWhitelistOptions handleSuccess={toggleModal} formData={rowData} />
            </Modal>
            </>
          );
        };

        return (
            <Fragment>
              {_.isEmpty(ipwhitelisting) ? (
                <Box align="center" gap="small">
                  <Transaction size="50px" />
                  <Paragraph>{t('noIPWhitelisted')}</Paragraph>
                </Box>
              ) : (

                <TableWrapper
                  data={ipwhitelisting}
                  filterBy={['cidr']}
                  isFilterable={true}
                  fileName="ip-whitelisting"
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
                      Header: t('cidr'),
                      id: 'cidr',
                      accessor: 'cidr',
                    },
                    {
                      Header: t('type'),
                      accessor: 'type',
                    },
                    {
                      Header: t('delete'),
                      accessor: 'cidr',
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


export const ConfirmIPWhitelistOptions = withNamespaces()(
  ({ t: translate, handleSuccess, formData }) => {
    const t = nestedTranslate(translate, 'account.ip-whitelisting');
    const [mutate] = useMutation(
      ({ cidr, type }) => {
        return exchangeApi.removeFormIPWhitelist({ cidr, type });
      },
      {
        onSuccess: response => {
          queryCache.invalidateQueries('ip-whitelisting');
          triggerToast(response.message, 'success', 2500);
          exchangeApi.getIPWhitelist();
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
    ipwhitelisting: user.ipwhitelistingInfo
  });
  
  export default withNamespaces()(
    connect(mapStateToProps, null)(IPWhitelistingTable),
  );