import {
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useStyle from '../../hooks/useStyle';

function SimpleModal({ isOpen, title, children, onClose, maxWidth, ...rest }) {
  const { modal } = useStyle();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        {...rest}
        maxWidth={maxWidth}
        background={modal.background2}
      >
        {title && <ModalHeader>{title}</ModalHeader>}
        <ModalCloseButton />
        <ModalBody>
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
};
SimpleModal.defaultProps = {
  title: '',
  maxWidth: '780px',
};

export default SimpleModal;
