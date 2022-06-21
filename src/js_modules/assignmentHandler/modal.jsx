/* eslint-disable max-len */
import {
  Box,
  Button, Link, FormLabel, Input, ModalBody, ModalCloseButton, ModalContent,
  ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { memo } from 'react';

const Modal = ({
  currentTask,
}) => {
  const { t } = useTranslation('assignments');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;

  return (
    <>
      <Button
        variant="outline"
        onClick={onOpen}
        padding="0 24px"
        textTransform="uppercase"
      >
        {t('task-handler.deliver')}
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="15" textTransform="uppercase" fontWeight="900">
            {t('deliver-assignment.title')}
            {' '}
            APPROVED APPROVED
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box display="flex" flexDirection="column">
              <Text>{fullName}</Text>
              <Link href="#test" color="blue.default">{currentTask.title}</Link>
            </Box>
            <FormLabel fontSize="12px">
              {t('deliver-assignment.label')}
            </FormLabel>
            <Input value={currentTask.github_url} readOnly />
            <Text>
              {t('deliver-assignment.hint')}
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" textTransform="uppercase" colorScheme="blue" mr={3}>
              {t('deliver-assignment.button')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

Modal.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.any),
  // textLink: PropTypes.string,
  // githubUrl: PropTypes.string,
  // t: PropTypes.func.isRequired,
  // t: PropTypes.func.isRequired,
};
Modal.defaultProps = {
  currentTask: {},
  // textLink: 'Project link',
  // githubUrl: '',
};

export default memo(Modal);
