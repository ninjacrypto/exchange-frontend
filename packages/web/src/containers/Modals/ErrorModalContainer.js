import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTheme } from 'styled-components';
import { connect } from 'react-redux';
// import { Modal, Section } from 'react-bulma-components';
import { withNamespaces } from 'react-i18next';

import { triggerModalClose } from 'redux/actions/ui';
import { Box, Modal } from 'components/Wrapped';

class ErrorModalContainer extends Component {
  static propTypes = {
    isModalOpen: PropTypes.bool.isRequired,
    triggerModalClose: PropTypes.func.isRequired,
    modalMessage: PropTypes.string,
    translateMessage: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    modalData: PropTypes.object,
  };

  render() {
    const {
      isModalOpen,
      triggerModalClose,
      modalMessage,
      modalData,
      children,
      translateMessage,
      t,
    } = this.props;

    return (
      <Modal show={isModalOpen} toggleModal={triggerModalClose}>
        <Box pad="none" round={false}>
          {modalMessage &&
            t(`messages.${modalMessage.replace(/[.]/g, '')}`, {
              defaultValue: modalMessage,
              ...modalData,
            })}
          {translateMessage && t(translateMessage)}
          {children}
        </Box>
      </Modal>
    );
  }
}

const mapStateToProps = ({ ui }) => ({
  isModalOpen: ui.isModalOpen,
  modalMessage: ui.modalMessage,
  modalData: ui.modalData,
  children: ui.children,
});

export default withTheme(
  withNamespaces()(
    connect(
      mapStateToProps,
      { triggerModalClose },
    )(ErrorModalContainer),
  ),
);
