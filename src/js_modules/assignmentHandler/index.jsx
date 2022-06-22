/* eslint-disable max-len */
import {
  Box, Button, FormLabel, Input, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Textarea, useToast, useColorModeValue, useDisclosure,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
// import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import {
  memo, useEffect, useState, useRef,
} from 'react';
import { useCookies } from 'react-cookie';
import bc from '../../common/services/breathecode';
// import Modal from './modal';

const DeliverModal = ({
  currentTask, projectLink, cohortSession, updpateAssignment,
}) => {
  const { t } = useTranslation('assignments');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [cookies] = useCookies();
  const [openIgnoreTask, setOpenIgnoreTask] = useState(false);
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const textAreaRef = useRef(null);
  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;
  const fontColor = useColorModeValue('gra.dark', 'gray.250');
  const labelColor = useColorModeValue('gray.600', 'gray.200');
  const commonBorderColor = useColorModeValue('#DADADA', 'gray.500');

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
        onClick={async () => {
          setIsLoading(true);
          const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/assignment/task/${currentTask.id}/deliver`, {
            headers: {
              Authorization: `Token ${cookies.accessToken}`,
              academy: cohortSession.academy.id,
            },
          });
          const data = await resp.json();
          setDeliveryUrl(data.delivery_url);

          if (data) {
            onOpen();
            setIsLoading(false);
          }
        }}
        fontSize="15px"
        padding="0 24px"
      >
        {t('task-handler.deliver')}
      </Button>

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
                {currentTask.title}
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
            <Button onClick={() => setOpenIgnoreTask(true)} variant="outline" textTransform="uppercase">
              {t('deliver-assignment.button')}
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
                {`Are you sure you want to ignore this task for ${fullName}?`}
              </Text>
            </ModalBody>
            <ModalFooter margin="0 1.5rem" padding="1.5rem 0" justifyContent="center" borderTop="1px solid" borderColor={commonBorderColor}>
              <Button
                onClick={() => {
                  bc.todo().update({
                    id: currentTask.id,
                    revision_status: 'IGNORED',
                  })
                    .then(() => {
                      updpateAssignment({
                        ...currentTask,
                        id: currentTask.id,
                        revision_status: 'IGNORED',
                      });
                    })
                    .catch(() => {
                      toast({
                        title: t('alert-message:review-assignment-error'),
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                      });
                    });
                }}
                variant="outline"
                textTransform="uppercase"
              >
                {t('deliver-assignment.button')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Modal>

    </Box>
  );
};

const ReviewModal = ({ currentTask, projectLink, updpateAssignment }) => {
  const { t } = useTranslation('assignments');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [comment, setComment] = useState('');
  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;
  const commonBorderColor = useColorModeValue('#DADADA', 'gray.500');

  const ReviewButton = ({ type }) => {
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
        onClick={async () => {
          if (revisionStatus[type] !== undefined) {
            await bc.todo().update({
              id: currentTask.id,
              revision_status: revisionStatus[type],
              description: comment,
            })
              .then(() => {
                toast({
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
  };

  ReviewButton.propTypes = {
    type: PropTypes.string.isRequired,
  };

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

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent borderRadius="17px" marginTop="10%">
          <ModalHeader fontSize="15px" color="gray.600" textAlign="center" letterSpacing="0.05em" borderBottom="1px solid" borderColor={commonBorderColor} fontWeight="bold" textTransform="uppercase">
            {t('review-assignment.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} px={{ base: '10px', md: '35px' }}>
            <Box display="flex" flexDirection="column" pt={4} pb={5}>
              <Text>{fullName}</Text>
              <Link href={projectLink} fontWeight="700" width="fit-content" letterSpacing="0.05em" target="_blank" rel="noopener noreferrer" color="blue.default">
                {currentTask.title}
              </Link>
            </Box>
            <Textarea onChange={(e) => setComment(e.target.value)} placeholder={t('review-assignment.comment-placeholder')} fontSize="14px" height="128px" />
            <Box pt={6} display="flex" flexDirection="row" justifyContent="space-between">
              {['reject', 'approve'].map((type) => (
                <ReviewButton type={type} />
              ))}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const ButtonHandler = ({
  currentTask, cohortSession, contextState, setContextState,
}) => {
  const { t } = useTranslation('assignments');
  const router = useRouter();
  const toast = useToast();
  const lang = {
    es: '/es/',
    en: '/',
  };
  const projectLink = `https://4geeks.com${lang[router.locale]}project/${currentTask.associated_slug}`;

  const updpateAssignment = async (taskUpdated) => {
    const keyIndex = contextState.allTasks.findIndex((x) => x.id === taskUpdated.id);
    await setContextState({
      allTasks: [
        ...contextState.allTasks.slice(0, keyIndex), // before keyIndex (inclusive)
        taskUpdated, // key item (updated)
        ...contextState.allTasks.slice(keyIndex + 1), // after keyIndex (exclusive)
      ],
    });
  };

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
        <ReviewModal currentTask={currentTask} projectLink={projectLink} cohortSession={cohortSession} updpateAssignment={updpateAssignment} />
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
                    title: t('alert-message:review-assignment-updated'),
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                  });
                })
                .catch(() => {
                  toast({
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
          <DeliverModal currentTask={currentTask} projectLink={projectLink} cohortSession={cohortSession} updpateAssignment={updpateAssignment} />
        </Box>
      );
    }
  }
  return (
    <Box width="auto" height="auto">
      <DeliverModal currentTask={currentTask} projectLink={projectLink} cohortSession={cohortSession} updpateAssignment={updpateAssignment} />
    </Box>
  );
};

ButtonHandler.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.any),
  cohortSession: PropTypes.objectOf(PropTypes.any),
  contextState: PropTypes.objectOf(PropTypes.any).isRequired,
  setContextState: PropTypes.func.isRequired,
};
ButtonHandler.defaultProps = {
  currentTask: null,
  cohortSession: null,
};
DeliverModal.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.any).isRequired,
  projectLink: PropTypes.string.isRequired,
  cohortSession: PropTypes.objectOf(PropTypes.any).isRequired,
  updpateAssignment: PropTypes.func.isRequired,
};
ReviewModal.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.any).isRequired,
  projectLink: PropTypes.string.isRequired,
  updpateAssignment: PropTypes.func.isRequired,
};

export default memo(ButtonHandler);
