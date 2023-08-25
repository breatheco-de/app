import {
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useStyle from '../../hooks/useStyle';

function SimpleModal({ isOpen, title, children, onClose, maxWidth, bodyStyles, forceHandler, hideCloseButton, ...rest }) {
  const { modal } = useStyle();

  const closeHandler = () => {
    if (!forceHandler) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeHandler}>
      <ModalOverlay />
      <ModalContent
        {...rest}
        maxWidth={maxWidth}
        background={modal.background2}
      >
        {title && <ModalHeader>{title}</ModalHeader>}
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
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
  maxWidth: PropTypes.string,
  bodyStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  forceHandler: PropTypes.bool,
  hideCloseButton: PropTypes.bool,
};
SimpleModal.defaultProps = {
  title: '',
  maxWidth: '780px',
  bodyStyles: {},
  forceHandler: false,
  hideCloseButton: false,
};

export default SimpleModal;
