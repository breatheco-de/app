import {
  Box,
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useStyle from '../../hooks/useStyle';

function SimpleModal({ isOpen, title, size, leftButton, isCentered, children, onClose, bodyStyles, forceHandler, hideCloseButton, headerStyles, closeOnOverlayClick, onMouseUp, closeButtonStyles, ...rest }) {
  const { modal, borderColor2 } = useStyle();

  const closeHandler = () => {
    if (!forceHandler) {
      onClose();
    }
  };

  return (
    <Modal size={size} isOpen={isOpen} isCentered={isCentered} onClose={closeHandler} closeOnOverlayClick={closeOnOverlayClick}>
      <ModalOverlay />
      <Box onMouseUp={onMouseUp}>
        <ModalContent
          background={modal.background2}
          style={{ marginTop: isCentered ? '' : '10vh' }}
          {...rest}
        >
          {leftButton && leftButton}
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
          {(!hideCloseButton && !forceHandler) && <ModalCloseButton {...closeButtonStyles} />}
          <ModalBody {...bodyStyles}>
            {children}
          </ModalBody>
        </ModalContent>
      </Box>
    </Modal>
  );
}

SimpleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  size: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  bodyStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  forceHandler: PropTypes.bool,
  hideCloseButton: PropTypes.bool,
  headerStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  closeOnOverlayClick: PropTypes.bool,
  onMouseUp: PropTypes.func,
  isCentered: PropTypes.bool,
  leftButton: PropTypes.node,
  closeButtonStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
};
SimpleModal.defaultProps = {
  title: '',
  size: null,
  bodyStyles: {},
  forceHandler: false,
  hideCloseButton: false,
  onClose: () => {},
  headerStyles: {},
  closeOnOverlayClick: true,
  onMouseUp: () => {},
  isCentered: false,
  leftButton: null,
  closeButtonStyles: {},
};

export default SimpleModal;
