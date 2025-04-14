/* eslint-disable react/no-unstable-nested-components */
import {
  Box, Button, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useColorModeValue, useDisclosure,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import {
  memo, useEffect, useState,
} from 'react';
import bc from '../../services/breathecode';
import Icon from '../Icon';
import Text from '../Text';
import SimpleModal from '../SimpleModal';
import useStyle from '../../hooks/useStyle';
import { ORIGIN_HOST } from '../../utils/variables';
import ReviewModalComponent from '../ReviewModal';
import UndoApprovalModal from '../UndoApprovalModal';
import useCustomToast from '../../hooks/useCustomToast';

export function DetailsModal({
  currentTask, projectLink, updpateAssignment, isOpen, onClose, readOnly,
}) {
  const { modal, hexColor, borderColor2 } = useStyle();
  const { t } = useTranslation('assignments');
  const [openUndoApproval, setOpenUndoApproval] = useState(false);
  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;
  const fontColor = useColorModeValue('gray.dark', 'gray.250');
  const labelColor = useColorModeValue('gray.600', 'gray.200');
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
          {t('review-assignment.title')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4} px={{ base: '10px', md: '35px' }}>
          <Box display="flex" flexDirection="column" pb={6}>
            <Text color={fontColor}>{fullName}</Text>
            <Link href={projectLink} fontWeight="700" letterSpacing="0.05em" width="fit-content" target="_blank" rel="noopener noreferrer" color="blue.default">
              {currentTask?.title}
            </Link>
          </Box>
          {currentTask?.github_url && (
            <Box pb={6}>
              <Text color={fontColor}>{t('review-assignment.github-url')}</Text>
              <Link
                variant="default"
                width="100%"
                href={currentTask.github_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {currentTask.github_url}
              </Link>

            </Box>
          )}
          {currentTask?.file && Array.isArray(currentTask.file) && (
            <Box pb={6}>
              <Text color={fontColor}>{t('review-assignment.files')}</Text>
              {currentTask.file.length > 0 ? currentTask.file.map((file) => {
                const extension = file.name.split('.').pop();
                return (
                  <Link
                    variant="default"
                    width="100%"
                    // justifyContent="space-between"
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                                // margin="0 0 0 10px"
                    display="flex"
                    gridGap="8px"
                  >
                    <Text size="l" withLimit={file.name.length > 28}>
                      {file.name}
                    </Text>
                    {extension && (
                      <Icon icon="download" width="16px" height="16px" color={hexColor.blueDefault} />
                    )}
                  </Link>
                );
              }) : (
                <Text fontSize="14px">
                  Empty
                </Text>
              )}
            </Box>
          )}
          {currentTask?.description && (
            <Box pb={6}>
              <Text color={fontColor}>{t('review-assignment.description')}</Text>
              <Text color={fontColor}>{currentTask.description}</Text>
            </Box>
          )}
        </ModalBody>
        {!readOnly && (
          <ModalFooter margin="0 1.5rem" padding="1.5rem 0" justifyContent="center" borderTop="1px solid" borderColor={borderColor2}>
            <Button onClick={() => setOpenUndoApproval(true)} variant={taskIsIgnored ? 'default' : 'outline'} textTransform="uppercase">
              {t('task-handler.undo-approval')}
            </Button>
          </ModalFooter>
        )}
      </ModalContent>

      <UndoApprovalModal
        isOpen={openUndoApproval}
        onClose={() => setOpenUndoApproval(false)}
        onSuccess={onClose}
        currentTask={currentTask}
        updpateAssignment={updpateAssignment}
      />
    </Modal>
  );
}

export function DeliverModal({
  currentTask, projectLink, updpateAssignment, deliveryUrl, isOpen, onClose, readOnly,
}) {
  return (
    <ReviewModalComponent
      defaultStage="deliver_assignment"
      isOpen={isOpen}
      onClose={onClose}
      currentTask={currentTask}
      projectLink={projectLink}
      updpateAssignment={updpateAssignment}
      deliveryUrl={deliveryUrl}
      readOnly={readOnly}
      disableLiking
    />
  );
}

function DeliverHandler({
  currentTask, projectLink, updpateAssignment,
}) {
  const { t } = useTranslation('assignments');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const { createToast } = useCustomToast({ toastId: 'index-review-error' });
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { academy } = router.query;

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  }, [copied]);

  return (
    <Box width="auto" height="auto">
      <Button
        variant="outline"
        isLoading={isLoading}
        onClick={() => {
          setIsLoading(true);
          bc.todo().deliver({
            id: currentTask.id,
            academy,
          })
            .then(({ data }) => {
              setDeliveryUrl(data.delivery_url);
              onOpen();
              setIsLoading(false);
            })
            .catch((e) => {
              console.log(e);
              createToast({
                position: 'top',
                title: t('alert-message:review-url-error'),
                status: 'error',
                duration: 6000,
                isClosable: true,
              });
            });
        }}
        fontSize="15px"
        padding="0 24px"
      >
        {t('task-handler.deliver')}
      </Button>

      <DeliverModal
        currentTask={currentTask}
        deliveryUrl={deliveryUrl}
        isOpen={isOpen}
        onClose={onClose}
        projectLink={projectLink}
        updpateAssignment={updpateAssignment}
      />
    </Box>
  );
}

export function NoInfoModal({ isOpen, onClose, selectedCohort }) {
  const { t } = useTranslation('assignments');
  const { createToast } = useCustomToast({ toastId: 'success-msg-error' });
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const { hexColor } = useStyle();
  const borderColor2 = useColorModeValue('gray.250', 'gray.500');

  const syncCohort = async () => {
    try {
      const resp = await bc.assignments().syncCohort(selectedCohort.id);
      if (resp.status >= 400) throw new Error('Sync error');

      const { message } = resp.data;

      createToast({
        position: 'top',
        title: 'Success',
        description: message,
        status: 'success',
        duration: 5000,
      });
    } catch (e) {
      console.log(e);
      createToast({
        position: 'top',
        title: t('error-msg'),
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setIsSyncOpen(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="17px" marginTop="10%">
        <ModalHeader
          fontSize="15px"
          color={hexColor.fontColor2}
          textAlign="center"
          letterSpacing="0.05em"
          borderBottom="1px solid"
          borderColor={borderColor2}
          fontWeight="bold"
          textTransform="uppercase"
        >
          {t('review-assignment.title')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6} px={{ base: '10px', md: '35px' }}>
          <Box display="flex" flexDirection="column" pt={4} pb={5} gap="20px">
            <Text size="md">{t('no-information')}</Text>
            {selectedCohort && (
              <>
                <Text size="md" textAlign="center">{t('sync-cohort')}</Text>
                <Button variant="default" width="50%" margin="auto" onClick={() => setIsSyncOpen(true)}>
                  {t('sync')}
                </Button>
              </>
            )}
            <SimpleModal
              maxWidth="500px"
              isOpen={isSyncOpen}
              onClose={setIsSyncOpen}
              headerStyles={{ textAlign: 'center' }}
              title={t('sync-cohort-title')}
            >
              <Text mt="20px" size="md" textAlign="center">{t('sync-warning')}</Text>
              <Box mt="20px" display="flex" gap="15px" width="100%">
                <Button fontSize="13px" width="100%" onClick={() => setIsSyncOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button variant="default" width="100%" onClick={syncCohort}>
                  {t('sync')}
                </Button>
              </Box>
            </SimpleModal>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// eslint-disable-next-line no-unused-vars
export function ReviewModal({ currentTask, projectLink, externalFile, updpateAssignment, isOpen, onClose }) {
  return (
    <ReviewModalComponent
      isOpen={isOpen}
      onClose={onClose}
      currentTask={currentTask}
      externalFiles={externalFile}
      projectLink={projectLink}
      updpateAssignment={updpateAssignment}
      disableLiking
    />
  );
}

function ReviewHandler({ currentTask, projectLink, updpateAssignment }) {
  const { t } = useTranslation('assignments');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleOpen = () => {
    onOpen();
  };

  return (
    <Box width="auto" height="auto">
      <Button
        variant="default"
        onClick={handleOpen}
        fontSize="15px"
        padding="0 24px"
      >
        {t('task-handler.review')}
      </Button>

      <ReviewModal
        currentTask={currentTask}
        projectLink={projectLink}
        updpateAssignment={updpateAssignment}
        isOpen={isOpen}
        onClose={onClose}
      />
    </Box>
  );
}

function ButtonHandler({
  currentTask, updpateAssignment,
}) {
  const [openUndoApproval, setOpenUndoApproval] = useState(false);
  const { t } = useTranslation('assignments');
  const router = useRouter();
  const lang = {
    es: '/es/',
    en: '/',
  };
  const projectLink = `${ORIGIN_HOST}${lang[router.locale]}project/${currentTask.associated_slug}`;

  // const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;

  if (currentTask && currentTask.task_type) {
    const taskStatus = currentTask.task_status;
    const revisionStatus = currentTask.revision_status;

    const statusConditional = {
      delivered: taskStatus === 'DONE' && revisionStatus === 'PENDING',
      approved: revisionStatus === 'APPROVED',
      rejected: revisionStatus === 'REJECTED',
      undelivered: taskStatus === 'PENDING' && revisionStatus === 'PENDING',
    };

    if (statusConditional.delivered) {
      return (
        <ReviewHandler currentTask={currentTask} projectLink={projectLink} updpateAssignment={updpateAssignment} />
      );
    }
    if (statusConditional.approved) {
      return (
        <>
          <Box width="auto" height="auto">
            <Button
              variant="link"
              onClick={() => setOpenUndoApproval(true)}
              fontSize="15px"
              color="blue.default"
              _hover={{ textDecoration: 'none' }}
            >
              {t('task-handler.undo-approval')}
            </Button>
          </Box>
          <UndoApprovalModal
            isOpen={openUndoApproval}
            onClose={() => setOpenUndoApproval(false)}
            updpateAssignment={updpateAssignment}
            currentTask={currentTask}
          />
        </>
      );
    }
    if (statusConditional.rejected) {
      return (
        <Box width="auto" height="auto">
          <DeliverHandler currentTask={currentTask} projectLink={projectLink} updpateAssignment={updpateAssignment} />
        </Box>
      );
    }
  }
  return (
    <Box width="auto" height="auto">
      <DeliverHandler currentTask={currentTask} projectLink={projectLink} updpateAssignment={updpateAssignment} />
    </Box>
  );
}

ButtonHandler.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  updpateAssignment: PropTypes.func.isRequired,
};
ButtonHandler.defaultProps = {
  currentTask: null,
};
DeliverHandler.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  projectLink: PropTypes.string.isRequired,
  updpateAssignment: PropTypes.func.isRequired,
};
DeliverModal.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  projectLink: PropTypes.string.isRequired,
  deliveryUrl: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  updpateAssignment: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
DeliverModal.defaultProps = {
  readOnly: false,
};
ReviewHandler.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  projectLink: PropTypes.string.isRequired,
  updpateAssignment: PropTypes.func.isRequired,
};

ReviewModal.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  projectLink: PropTypes.string.isRequired,
  updpateAssignment: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  externalFile: PropTypes.oneOfType([PropTypes.any]),
};
ReviewModal.defaultProps = {
  externalFile: null,
};

NoInfoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedCohort: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

NoInfoModal.defaultProps = {
  selectedCohort: null,
};

DetailsModal.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  projectLink: PropTypes.string.isRequired,
  updpateAssignment: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

DetailsModal.defaultProps = {
  readOnly: false,
};

export default memo(ButtonHandler);
