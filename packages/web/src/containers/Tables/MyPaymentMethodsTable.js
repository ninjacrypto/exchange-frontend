import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Transaction } from 'grommet-icons';

import { nestedTranslate } from 'utils';
import { Box, Paragraph, Modal, Text, Button } from 'components/Wrapped';
import { TableWrapper } from 'containers/Tables';
import { triggerToast } from 'redux/actions/ui';
import instance, { authenticatedInstance } from 'api';
import { getUserPaymentMethods } from 'redux/actions/p2p';
import { StatusWarning } from 'grommet-icons';

export const MyPaymentMethodsTable = withNamespaces()(
  ({ p2pUserPaymentMethods, t: translate, getUserPaymentMethods }) => {
    const t = nestedTranslate(translate, 'tables.paymentSettings');

    const renderDelete = ({ value }) => {
      return (
        <React.Fragment>
          <OpenDeleteModal getUserPaymentMethods={getUserPaymentMethods} Id={value} />
        </React.Fragment>
      );
    };

    return (
      <Fragment>
        {_.isEmpty(p2pUserPaymentMethods) ? (
          <Box align="center" gap="small">
            <Transaction size="50px" />
            <Paragraph>{t('myPaymentMethodsNotFound')}</Paragraph>
          </Box>
        ) : (
          <TableWrapper
            data={p2pUserPaymentMethods}
            filterBy={['Currency']}
            isFilterable={true}
            fileName="my-payment-methods"
            columns={[
              {
                Header: t('currency'),
                id: 'Currency',
                accessor: 'Currency',
              },
              {
                Header: t('methodName'),
                id: 'MethodName',
                accessor: 'MethodName',
              },
              {
                Header: t('delete'),
                accessor: 'Id',
                Cell: renderDelete,
                maxWidth: 125,
              },
            ]}
            defaultSorted={[
              {
                id: 'Currency',
                desc: false,
              },
            ]}
            showPagination={true}
            minRows={10}
            pageSize={10}
            className="-highlight"
          />
        )}
      </Fragment>
    );
  },
);

export const OpenDeleteModal = withNamespaces()(
  ({ t: translate, Id, getUserPaymentMethods }) => {
    const t = nestedTranslate(translate, 'tables.paymentSettings');
    const [isOpen, setIsOpen] = useState(false);
    const [rowData, setRowData] = useState();
    const toggleModal = () => setIsOpen(!isOpen);

    return (
      <React.Fragment>
          <Button
            color="primary"
            size="xsmall"
            onClick={() => {
              setRowData({ Id: Id });
              toggleModal();
            }}
          >
            {translate('buttons.delete')}
          </Button>
          <Modal show={isOpen} toggleModal={toggleModal} heading={t('warning')}>
            <ConfirmDeletePaymentMethod
              handleSuccess={toggleModal}
              formData={rowData}
              getUserPaymentMethods={getUserPaymentMethods}
            />
          </Modal>
      </React.Fragment>
    );
  },
);

export const ConfirmDeletePaymentMethod = withNamespaces()(
  ({ t: translate, handleSuccess, formData, getUserPaymentMethods }) => {
    const t = nestedTranslate(translate, 'tables.paymentSettings');
    const [isOpen, setIsOpen] = useState(false);

    const submitDelete = async formData => {
      try {
        const response = await authenticatedInstance({
          method: 'POST',
          url: `/p2p/delete-userpayment-method/${formData.Id}`,
        });

        if (response.data.Status === 'Success') {
          triggerToast(response.data.Message, 'success', 2500);
          getUserPaymentMethods();
          if (handleSuccess) {
            handleSuccess();
          }
        } else {
          triggerToast(response.data.Message, 'error', 2500);
          if (handleSuccess) {
            handleSuccess();
          }
        }
      } catch (e) {}
    };

    const toggleModal = () => {
      handleSuccess();
      setIsOpen(!isOpen);
    };

    const confirmDelete = () => {
      submitDelete(formData);
    };

    return (
      <React.Fragment>
        <Box
          pad="none"
          margin={{ bottom: 'medium' }}
          align="center"
          gap="small"
        >
          <StatusWarning size="xlarge" color="orange" />
          <Text>{t('confirmDelete')}</Text>
        </Box>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '50%', paddingRight: '5px' }}>
            <Button
              color="primary"
              type="button"
              onClick={confirmDelete}
              style={{ width: '100%' }}
            >
              {t('delete')}
            </Button>
          </div>
          <div style={{ width: '50%', paddingLeft: '5px' }}>
            <Button
              color="primary"
              type="button"
              onClick={toggleModal}
              style={{ width: '100%' }}
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      </React.Fragment>
    );
  },
);

const mapStateToProps = ({ p2p: { p2pUserPaymentMethods } }) => ({
  p2pUserPaymentMethods: p2pUserPaymentMethods,
});

export default withNamespaces()(
  connect(mapStateToProps, { getUserPaymentMethods })(MyPaymentMethodsTable),
);
