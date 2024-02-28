import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useColorModeValue, useToast } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import bc from '../services/breathecode';

function UndoApprovalModal({ isOpen, currentTask, onSuccess, onClose, updpateAssignment }) {
  const { modal, borderColor2 } = useStyle();
  const [isRequesting, setIsRequesting] = useState(false);
  const labelColor = useColorModeValue('gray.600', 'gray.200');
  const { t } = useTranslation('assignments');
  const toast = useToast();
  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;
  const taskIsIgnored = currentTask?.revision_status === 'IGNORED';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <ModalOverlay />
      <ModalContent background={modal.background2} borderRadius="md" marginTop="10%">
        <ModalHeader fontSize="15px" color={labelColor} textAlign="center" letterSpacing="0.05em" borderBottom="1px solid" borderColor={borderColor2} fontWeight="bold" textTransform="uppercase">
          {t('deliver-assignment.title')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pt="2rem" pb="2rem" px={{ base: '20px', md: '15%' }}>
          <Text fontSize="22px" fontWeight="700" textAlign="center">
            {t('task-handler.confirm-undo', { student: fullName })}
          </Text>
        </ModalBody>
        <ModalFooter margin="0 1.5rem" padding="1.5rem 0" justifyContent="center" borderTop="1px solid" borderColor={borderColor2}>
          <Button
            isLoading={isRequesting}
            onClick={() => {
              setIsRequesting(true);
              bc.todo().update({
                id: currentTask.id,
                revision_status: 'PENDING',
                description: '',
              })
                .then(() => {
                  updpateAssignment({
                    ...currentTask,
                    id: currentTask.id,
                    revision_status: 'PENDING',
                    description: '',
                  });
                  onSuccess();
                  onClose();
                  toast({
                    position: 'top',
                    title: t('alert-message:review-assignment-updated'),
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                  });
                })
                .catch((e) => {
                  console.log(e);
                  toast({
                    position: 'top',
                    title: t('alert-message:review-assignment-error'),
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                  });
                })
                .finally(() => setIsRequesting(false));
            }}
            variant={taskIsIgnored ? 'default' : 'outline'}
            textTransform="uppercase"
          >
            {t('task-handler.undo-approval')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

UndoApprovalModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  updpateAssignment: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
UndoApprovalModal.defaultProps = {
  onSuccess: () => {},
};

export default UndoApprovalModal;
