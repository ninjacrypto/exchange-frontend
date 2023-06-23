import React from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';

import { Box, Button, Modal } from 'components/Wrapped';

const ConfirmModal = ({ children, confirm, onClose, show, title, t }) => {
  return (
    <Modal
      heading={title}
      show={show}
      toggleModal={onClose}
      pad="none"
      width="large"
    >
      <Box pad="large">{children}</Box>
      <Box
        direction="row"
        pad="small"
        justify="end"
        background="background-4"
        gap="small"
      >
        <Button onClick={onClose}>{t('buttons.cancel')}</Button>
        <Button color="primary" onClick={confirm}>
          {t('buttons.confirm')}
        </Button>
      </Box>
    </Modal>
    // <Modal show={show} onClose={onClose} {...modalProps}>
    //   <Modal.Card>
    //     <Modal.Card.Head onClose={onClose}>
    //       <Box background="background-3" pad="none" round={false} fill={true}>
    //         <Modal.Card.Title>{title}</Modal.Card.Title>
    //       </Box>
    //     </Modal.Card.Head>
    //     <Modal.Card.Body>
    //       <Section>
    //         <Box background="background-5" pad="none" round={false}>
    //           {children}
    //         </Box>
    //       </Section>
    //     </Modal.Card.Body>
    //     <Modal.Card.Foot>

    //     </Modal.Card.Foot>
    //   </Modal.Card>
    // </Modal>
  );
};

ConfirmModal.propTypes = {
  children: PropTypes.node.isRequired,
  show: PropTypes.bool.isRequired,
  confirm: PropTypes.func.isRequired,
  title: PropTypes.string,
};

ConfirmModal.defaultProps = {
  title: 'Confirm',
};

export default withNamespaces()(ConfirmModal);
