import {
  Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Link,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from '../../common/components/Text';

const ModalInfo = ({
  isOpen, onClose, removeDelivery, isDone,
  title, description, projectInfo, projectUrl, removeText, closeText,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>{title}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text size="l" fontWeight="500" color="gray.600">{description}</Text>
        {/* {description} */}
        {projectUrl && (
          <Box padding="18px 0 0 0">
            <Text size="l" fontWeight="bold" color="gray.600">
              {projectInfo}
            </Text>
            <Link href={projectUrl} color="blue.default" target="_blank" rel="noopener noreferrer">
              {projectUrl}
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
        {!isDone && (
          <Button
            onClick={removeDelivery}
            colorScheme="red"
          >
            {removeText}
          </Button>
        )}
      </ModalFooter>
    </ModalContent>
  </Modal>
);

ModalInfo.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  removeDelivery: PropTypes.func,
  isDone: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
  projectInfo: PropTypes.string,
  projectUrl: PropTypes.string,
  removeText: PropTypes.string,
  closeText: PropTypes.string,
};

ModalInfo.defaultProps = {
  removeDelivery: () => {},
  isDone: false,
  title: 'Review status',
  description: 'Your teacher is still reviewing your deliver and will provide feedback once it\'s done',
  projectInfo: 'Link sended to your teacher:',
  projectUrl: '',
  removeText: 'Remove delivery',
  closeText: 'Close',
};

export default ModalInfo;
