/* eslint-disable react/no-unstable-nested-components */
import {
  Box, Button, FormLabel, Input, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Textarea, useToast, useColorModeValue, useDisclosure,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
// import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import {
  memo, useEffect, useState, useRef, Fragment,
} from 'react';
import bc from '../../common/services/breathecode';
import Icon from '../../common/components/Icon';
import useStyle from '../../common/hooks/useStyle';
import { ORIGIN_HOST } from '../../utils/variables';
// import { getStorageItem } from '../../utils';
// import Modal from './modal';

export function DetailsModal({
  currentTask, projectLink, updpateAssignment, isOpen, onClose,
}) {
  const { hexColor } = useStyle();
  const { t } = useTranslation('assignments');
  const [openUndoApproval, setOpenUndoApproval] = useState(false);
  const toast = useToast();
  // const textAreaRef = useRef(null);
  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;
  const fontColor = useColorModeValue('gra.dark', 'gray.250');
  const labelColor = useColorModeValue('gray.600', 'gray.200');
  const commonBorderColor = useColorModeValue('gray.250', 'gray.500');
  const taskIsIgnored = currentTask?.revision_status === 'IGNORED';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <ModalOverlay />
      <ModalContent borderRadius="17px" marginTop="10%">
        <ModalHeader fontSize="15px" color={labelColor} textAlign="center" letterSpacing="0.05em" borderBottom="1px solid" borderColor={commonBorderColor} fontWeight="bold" textTransform="uppercase">
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
              {currentTask.file.map((file) => {
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
              })}
            </Box>
          )}
          {currentTask?.description && (
            <Box pb={6}>
              <Text color={fontColor}>{t('review-assignment.description')}</Text>
              <Text color={fontColor}>{currentTask.description}</Text>
            </Box>
          )}
        </ModalBody>
        <ModalFooter margin="0 1.5rem" padding="1.5rem 0" justifyContent="center" borderTop="1px solid" borderColor={commonBorderColor}>
          <Button onClick={() => setOpenUndoApproval(true)} variant={taskIsIgnored ? 'default' : 'outline'} textTransform="uppercase">
            {t('task-handler.undo-approval')}
          </Button>
        </ModalFooter>
      </ModalContent>

      <Modal
          // isCentered
        isOpen={openUndoApproval}
        onClose={() => setOpenUndoApproval(false)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent borderRadius="17px" marginTop="10%">
          <ModalHeader fontSize="15px" color="gray.600" textAlign="center" letterSpacing="0.05em" borderBottom="1px solid" borderColor={commonBorderColor} fontWeight="bold" textTransform="uppercase">
            {t('deliver-assignment.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pt="2rem" pb="2rem" px={{ base: '20px', md: '15%' }}>
            <Text fontSize="22px" fontWeight="700" textAlign="center">
              {t('task-handler.confirm-undo', { student: fullName })}
            </Text>
          </ModalBody>
          <ModalFooter margin="0 1.5rem" padding="1.5rem 0" justifyContent="center" borderTop="1px solid" borderColor={commonBorderColor}>
            <Button
              onClick={() => {
                bc.todo().update({
                  id: currentTask.id,
                  revision_status: 'PENDING',
                })
                  .then(() => {
                    updpateAssignment({
                      ...currentTask,
                      id: currentTask.id,
                      revision_status: 'PENDING',
                    });
                    setOpenUndoApproval(false);
                    onClose();
                    toast({
                      position: 'top',
                      title: t('alert-message:review-assignment-updated'),
                      status: 'success',
                      duration: 5000,
                      isClosable: true,
                    });
                  })
                  .catch(() => {
                    toast({
                      position: 'top',
                      title: t('alert-message:review-assignment-error'),
                      status: 'error',
                      duration: 5000,
                      isClosable: true,
                    });
                  });
              }}
              variant={taskIsIgnored ? 'default' : 'outline'}
              textTransform="uppercase"
            >
              {t('task-handler.undo-approval')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Modal>
  );
}

export function DeliverModal({
  currentTask, projectLink, updpateAssignment, deliveryUrl, isOpen, onClose,
}) {
  const { t } = useTranslation('assignments');
  const [openIgnoreTask, setOpenIgnoreTask] = useState(false);
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const textAreaRef = useRef(null);
  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;
  const fontColor = useColorModeValue('gra.dark', 'gray.250');
  const labelColor = useColorModeValue('gray.600', 'gray.200');
  const commonBorderColor = useColorModeValue('gray.250', 'gray.500');
  const taskIsIgnored = currentTask?.revision_status === 'IGNORED';

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  }, [copied]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <ModalOverlay />
      <ModalContent borderRadius="17px" marginTop="10%">
        <ModalHeader fontSize="15px" color={labelColor} textAlign="center" letterSpacing="0.05em" borderBottom="1px solid" borderColor={commonBorderColor} fontWeight="bold" textTransform="uppercase">
          {t('deliver-assignment.title')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4} px={{ base: '10px', md: '35px' }}>
          <Box display="flex" flexDirection="column" pb={6}>
            <Text color={fontColor}>{fullName}</Text>
            <Link href={projectLink} fontWeight="700" letterSpacing="0.05em" width="fit-content" target="_blank" rel="noopener noreferrer" color="blue.default">
              {currentTask?.title}
            </Link>
          </Box>
          <FormLabel fontSize="12px" letterSpacing="0.05em" color={labelColor}>
            {t('deliver-assignment.label')}
          </FormLabel>
          <Box display="flex" flexDirection="row">
            <Input
              ref={textAreaRef}
              onClick={() => {
                textAreaRef.current.select();
                navigator.clipboard.writeText(deliveryUrl);
                setCopied(true);
              }}
              type="text"
              background={useColorModeValue('gray.250', 'featuredDark')}
              value={deliveryUrl}
              readOnly
              borderTopRightRadius="0"
              borderBottomRightRadius="0"
            />
            <Button
              variant="default"
              minWidth="auto"
              background={copied ? 'success' : 'blue.default'}
              _hover={{
                background: copied ? 'success' : 'blue.default',
              }}
              onClick={() => {
                if (copied === false) {
                  navigator.clipboard.writeText(deliveryUrl);
                  setCopied(true);
                }
              }}
              borderTopLeftRadius="0"
              borderBottomLeftRadius="0"
              textTransform="uppercase"
              fontSize="13px"
              fontWeight="700"
              p="12px 16px"
            >
              {copied ? t('deliver-assignment.copied') : t('deliver-assignment.copy')}
            </Button>
          </Box>
          <Text fontSize="12px" letterSpacing="0.05em" pt="8px" color={labelColor}>
            {t('deliver-assignment.hint')}
          </Text>
        </ModalBody>
        <ModalFooter margin="0 1.5rem" padding="1.5rem 0" justifyContent="center" borderTop="1px solid" borderColor={commonBorderColor}>
          <Button onClick={() => setOpenIgnoreTask(true)} variant={taskIsIgnored ? 'default' : 'outline'} textTransform="uppercase">
            {taskIsIgnored
              ? t('deliver-assignment.mark-as-pending')
              : t('deliver-assignment.ignore-task')}
          </Button>
        </ModalFooter>
      </ModalContent>

      <Modal
          // isCentered
        isOpen={openIgnoreTask}
        onClose={() => setOpenIgnoreTask(false)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent borderRadius="17px" marginTop="10%">
          <ModalHeader fontSize="15px" color="gray.600" textAlign="center" letterSpacing="0.05em" borderBottom="1px solid" borderColor={commonBorderColor} fontWeight="bold" textTransform="uppercase">
            {t('deliver-assignment.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pt="2rem" pb="2rem" px={{ base: '20px', md: '15%' }}>
            <Text fontSize="22px" fontWeight="700" textAlign="center">
              {t('deliver-assignment.confirm-ignore', { student: fullName })}
            </Text>
          </ModalBody>
          <ModalFooter margin="0 1.5rem" padding="1.5rem 0" justifyContent="center" borderTop="1px solid" borderColor={commonBorderColor}>
            <Button
              onClick={() => {
                bc.todo().update({
                  id: currentTask.id,
                  revision_status: taskIsIgnored ? 'PENDING' : 'IGNORED',
                })
                  .then(() => {
                    toast({
                      position: 'top',
                      title: t('alert-message:review-assignment-ignored-task'),
                      status: 'success',
                      duration: 5000,
                      isClosable: true,
                    });
                    updpateAssignment({
                      ...currentTask,
                      id: currentTask.id,
                      revision_status: taskIsIgnored ? 'PENDING' : 'IGNORED',
                    });
                    setOpenIgnoreTask(false);
                    onClose();
                  })
                  .catch(() => {
                    toast({
                      position: 'top',
                      title: t('alert-message:review-assignment-error'),
                      status: 'error',
                      duration: 5000,
                      isClosable: true,
                    });
                  });
              }}
              variant={taskIsIgnored ? 'default' : 'outline'}
              textTransform="uppercase"
            >
              {taskIsIgnored
                ? t('deliver-assignment.mark-as-pending')
                : t('deliver-assignment.ignore-task')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Modal>
  );
}

function DeliverHandler({
  currentTask, projectLink, updpateAssignment,
}) {
  const { t } = useTranslation('assignments');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const toast = useToast();
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
            .catch(() => {
              toast({
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

export function NoInfoModal({ isOpen, onClose }) {
  const { t } = useTranslation('assignments');
  const commonBorderColor = useColorModeValue('gray.250', 'gray.500');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="17px" marginTop="10%">
        <ModalHeader
          fontSize="15px"
          color="gray.600"
          textAlign="center"
          letterSpacing="0.05em"
          borderBottom="1px solid"
          borderColor={commonBorderColor}
          fontWeight="bold"
          textTransform="uppercase"
        >
          {t('review-assignment.title')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6} px={{ base: '10px', md: '35px' }}>
          <Box display="flex" flexDirection="column" pt={4} pb={5}>
            <Text>{t('no-information')}</Text>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export function ReviewModal({ currentTask, projectLink, updpateAssignment, isOpen, onClose }) {
  const { t } = useTranslation('assignments');
  const { hexColor } = useStyle();
  const toast = useToast();
  const [comment, setComment] = useState('');
  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;
  const commonBorderColor = useColorModeValue('gray.250', 'gray.500');
  const fontColor = useColorModeValue('gra.dark', 'gray.250');

  function ReviewButton({ type }) {
    const statusColor = {
      approve: 'success',
      reject: 'error',
    };
    const buttonColor = {
      approve: 'success',
      reject: 'danger',
    };
    const buttonText = {
      approve: t('review-assignment.approve'),
      reject: t('review-assignment.reject'),
    };
    const revisionStatus = {
      approve: 'APPROVED',
      reject: 'REJECTED',
    };
    const alertStatus = {
      approve: t('alert-message:review-assignment-approve'),
      reject: t('alert-message:review-assignment-reject'),
    };
    return (
      <Button
        background={buttonColor[type]}
        _hover={{ background: buttonColor[type] }}
        onClick={() => {
          if (revisionStatus[type] !== undefined) {
            bc.todo()
              .update({
                id: currentTask.id,
                revision_status: revisionStatus[type],
                description: comment,
              })
              .then(() => {
                toast({
                  position: 'top',
                  title: alertStatus[type],
                  status: statusColor[type],
                  duration: 5000,
                  isClosable: true,
                });
                updpateAssignment({
                  ...currentTask,
                  id: currentTask.id,
                  revision_status: revisionStatus[type],
                  description: comment,
                });
                onClose();
              })
              .catch(() => {
                toast({
                  position: 'top',
                  title: t('alert-message:review-assignment-error'),
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
                });
              });
          }
        }}
        color="white"
        fontSize="13px"
        textTransform="uppercase"
      >
        {buttonText[type]}
      </Button>
    );
  }

  ReviewButton.propTypes = {
    type: PropTypes.string.isRequired,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="17px" marginTop="10%">
        <ModalHeader
          fontSize="15px"
          color="gray.600"
          textAlign="center"
          letterSpacing="0.05em"
          borderBottom="1px solid"
          borderColor={commonBorderColor}
          fontWeight="bold"
          textTransform="uppercase"
        >
          {t('review-assignment.title')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6} px={{ base: '10px', md: '35px' }}>
          <Box display="flex" flexDirection="column" pt={4} pb={5}>
            <Text>{fullName}</Text>
            <Link
              href={projectLink}
              fontWeight="700"
              width="fit-content"
              letterSpacing="0.05em"
              target="_blank"
              rel="noopener noreferrer"
              color="blue.default"
            >
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
              {currentTask.file.map((file) => {
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
              })}
            </Box>
          )}
          <Textarea
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('review-assignment.comment-placeholder')}
            fontSize="14px"
            height="128px"
          />
          <Box
            pt={6}
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
          >
            {['reject', 'approve'].map((type) => (
              <Fragment key={type}>
                <ReviewButton type={type} />
              </Fragment>
            ))}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function ReviewHandler({ currentTask, projectLink, updpateAssignment }) {
  const { t } = useTranslation('assignments');
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box width="auto" height="auto">
      <Button
        variant="default"
        onClick={onOpen}
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
  currentTask, cohortSession, updpateAssignment,
}) {
  const { t } = useTranslation('assignments');
  const router = useRouter();
  const toast = useToast();
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
        <ReviewHandler currentTask={currentTask} projectLink={projectLink} cohortSession={cohortSession} updpateAssignment={updpateAssignment} />
      );
    }
    if (statusConditional.approved) {
      return (
        <Box width="auto" height="auto">
          <Button
            variant="link"
            onClick={() => {
              bc.todo().update({
                id: currentTask.id,
                revision_status: 'PENDING',
              })
                .then(() => {
                  updpateAssignment({
                    ...currentTask,
                    id: currentTask.id,
                    revision_status: 'PENDING',
                  });
                  toast({
                    position: 'top',
                    title: t('alert-message:review-assignment-updated'),
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                  });
                })
                .catch(() => {
                  toast({
                    position: 'top',
                    title: t('alert-message:review-assignment-error'),
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                  });
                });
            }}
            fontSize="15px"
            color="blue.default"
            _hover={{ textDecoration: 'none' }}
          >
            {t('task-handler.undo-approval')}
          </Button>
        </Box>
      );
    }
    if (statusConditional.rejected) {
      return (
        <Box width="auto" height="auto">
          <DeliverHandler currentTask={currentTask} projectLink={projectLink} cohortSession={cohortSession} updpateAssignment={updpateAssignment} />
        </Box>
      );
    }
  }
  return (
    <Box width="auto" height="auto">
      <DeliverHandler currentTask={currentTask} projectLink={projectLink} cohortSession={cohortSession} updpateAssignment={updpateAssignment} />
    </Box>
  );
}

ButtonHandler.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  cohortSession: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  updpateAssignment: PropTypes.func.isRequired,
};
ButtonHandler.defaultProps = {
  currentTask: null,
  cohortSession: null,
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
  updpateAssignment: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
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
};

NoInfoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

DetailsModal.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  projectLink: PropTypes.string.isRequired,
  updpateAssignment: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default memo(ButtonHandler);
