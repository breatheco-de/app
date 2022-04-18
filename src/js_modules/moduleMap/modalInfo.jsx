import {
  Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Link, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Text from '../../common/components/Text';

const ModalInfo = ({
  isOpen, onClose, actionHandler, rejectHandler, forceHandler, disableHandler, title, description,
  teacherFeedback, linkInfo, link, texLink, handlerText, closeText, handlerColorButton, rejectData,
}) => {
  const router = useRouter();
  const [confirmRejection, setConfirmRejection] = useState(false);
  const commonBorderColor = useColorModeValue('gray.200', 'gray.500');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  const rejectFunction = () => {
    if (forceHandler) {
      setConfirmRejection(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Modal closeOnOverlayClick={!forceHandler} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            borderBottom={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
          >
            {title}
          </ModalHeader>

          {!forceHandler && <ModalCloseButton />}
          <ModalBody>
            <Text
              size="l"
              fontWeight="400"
              color={commonTextColor}
              margin="10px 0 0 0"
            >
              {description}
            </Text>
            {teacherFeedback && (
              <Box padding="15px 0 0 0">
                <Text size="l" fontWeight="700" color={useColorModeValue('gray.800', 'gray.light')}>
                  {`${router.locale === 'es' ? 'Comentario del profesor:' : 'Teacher feedback:'}`}
                </Text>
                <Text
                  size="l"
                  fontWeight="500"
                  color={commonTextColor}
                  padding="6px 6px 6px 12px"
                  margin="10px 0 0 0"
                  borderLeft={4}
                  opacity={0.8}
                  borderStyle="solid"
                  borderColor={commonBorderColor}
                  _hover={{
                    opacity: 1,
                    transition: 'opacity 0.2s ease-in-out',
                  }}
                >
                  {teacherFeedback}
                </Text>
              </Box>
            )}

            {link && (
              <Box padding="18px 0 0 0">
                {linkInfo && (
                  <Text size="l" fontWeight="bold" color={commonTextColor}>
                    {linkInfo}
                  </Text>
                )}
                <Link href={link} color={useColorModeValue('blue.default', 'blue.300')} target="_blank" rel="noopener noreferrer">
                  {texLink || link}
                </Link>
              </Box>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => rejectFunction()}
            >
              {closeText}
            </Button>
            {!disableHandler && (
              <Button
                onClick={actionHandler}
                colorScheme={handlerColorButton}
              >
                {handlerText}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {confirmRejection && (
        <Modal isOpen={confirmRejection} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              borderBottom={1}
              borderStyle="solid"
              borderColor={commonBorderColor}
            >
              {/* Please confirm your action to reject all unsynced tasks */}
              {rejectData.title}
            </ModalHeader>
            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => setConfirmRejection(false)}
              >
                {rejectData.closeText}
              </Button>
              {!disableHandler && (
                <Button
                  colorScheme="red"
                  onClick={() => {
                    rejectHandler();
                    setConfirmRejection(false);
                  }}
                >
                  {rejectData.handlerText}
                  {/* confirm */}
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

ModalInfo.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  actionHandler: PropTypes.func,
  rejectHandler: PropTypes.func,
  forceHandler: PropTypes.bool,
  disableHandler: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
  teacherFeedback: PropTypes.string,
  linkInfo: PropTypes.string,
  link: PropTypes.string,
  texLink: PropTypes.string,
  handlerText: PropTypes.string,
  closeText: PropTypes.string,
  handlerColorButton: PropTypes.string,
  rejectData: PropTypes.objectOf(PropTypes.string),
};

ModalInfo.defaultProps = {
  actionHandler: () => {},
  rejectHandler: () => {},
  forceHandler: false,
  disableHandler: false,
  title: 'Review status',
  description: '',
  teacherFeedback: '',
  linkInfo: '',
  link: '',
  texLink: '',
  handlerText: 'Remove delivery',
  closeText: 'Close',
  handlerColorButton: 'red',
  rejectData: {},
};

export default ModalInfo;
