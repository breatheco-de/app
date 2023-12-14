import {
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useStyle from '../../hooks/useStyle';

function SimpleModal({ isOpen, title, children, onClose, maxWidth, bodyStyles, forceHandler, hideCloseButton, headerStyles, closeOnOverlayClick, ...rest }) {
  const { modal, borderColor2 } = useStyle();

  const closeHandler = () => {
    if (!forceHandler) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeHandler} closeOnOverlayClick={closeOnOverlayClick}>
      <ModalOverlay />
      <ModalContent
        maxWidth={maxWidth}
        background={modal.background2}
        style={{ marginTop: '10vh' }}
        {...rest}
      >
        {title && (
        <ModalHeader
          borderBottom={1}
          borderStyle="solid"
          borderColor={borderColor2}
          {...headerStyles}
        >
          {title}
        </ModalHeader>
        )}
        {(!hideCloseButton && !forceHandler) && <ModalCloseButton />}
        <ModalBody {...bodyStyles}>
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

SimpleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  maxWidth: PropTypes.string,
  bodyStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  forceHandler: PropTypes.bool,
  hideCloseButton: PropTypes.bool,
  headerStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  closeOnOverlayClick: PropTypes.bool,
};
SimpleModal.defaultProps = {
  title: '',
  maxWidth: '780px',
  bodyStyles: {},
  forceHandler: false,
  hideCloseButton: false,
  onClose: () => {},
  headerStyles: {},
  closeOnOverlayClick: true,
};

export default SimpleModal;
