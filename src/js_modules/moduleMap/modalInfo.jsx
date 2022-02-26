import {
  Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Link,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from '../../common/components/Text';

const ModalInfo = ({
  isOpen, onClose, actionHandler, disableHandler, title, description,
  linkInfo, link, texLink, handlerText, closeText,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>{title}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text size="l" fontWeight="500" color="gray.600">
          {description}
        </Text>

        {link && (
          <Box padding="18px 0 0 0">
            {linkInfo && (
              <Text size="l" fontWeight="bold" color="gray.600">
                {linkInfo}
              </Text>
            )}
            <Link href={link} color="blue.default" target="_blank" rel="noopener noreferrer">
              {texLink || link}
            </Link>
          </Box>
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          colorScheme="blue"
          mr={3}
          onClick={onClose}
        >
          {closeText}
        </Button>
        {!disableHandler && (
          <Button
            onClick={actionHandler}
            colorScheme="red"
          >
            {handlerText}
          </Button>
        )}
      </ModalFooter>
    </ModalContent>
  </Modal>
);

ModalInfo.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  actionHandler: PropTypes.func,
  disableHandler: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
  linkInfo: PropTypes.string,
  link: PropTypes.string,
  texLink: PropTypes.string,
  handlerText: PropTypes.string,
  closeText: PropTypes.string,
};

ModalInfo.defaultProps = {
  actionHandler: () => {},
  disableHandler: false,
  title: 'Review status',
  description: '',
  linkInfo: '',
  link: '',
  texLink: '',
  handlerText: 'Remove delivery',
  closeText: 'Close',
};

export default ModalInfo;
