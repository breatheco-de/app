import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Flex,
  Button,
  FormLabel,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import bc from '../../services/breathecode';
import useStyle from '../../hooks/useStyle';
import Icon from '../Icon';

function DeliverModalContent({
  isStudent,
  currentTask,
  projectLink,
  updpateAssignment,
  deliveryUrl,
  onClose,
  readOnly,
  showCodeReviews,
  contextData,
  setStage,
  loaders,
  proceedToCommitFiles,
}) {
  const { t } = useTranslation('assignments');
  const { modal, borderColor2, featuredColor, hexColor } = useStyle();
  const [openIgnoreTask, setOpenIgnoreTask] = useState(false);
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const textAreaRef = useRef(null);
  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;
  const fontColor = useColorModeValue('gra.dark', 'gray.250');
  const labelColor = useColorModeValue('gray.600', 'gray.200');
  const taskIsIgnored = currentTask?.revision_status === 'IGNORED';
  const codeRevisions = contextData?.code_revisions || [];

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  }, [copied]);

  return (
    <>
      <Box px={{ base: '10px' }} width="100%">
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
        {currentTask?.description && (
          <Box marginBottom="10px">
            <Text fontSize="12px" letterSpacing="0.05em" pt="8px" color={labelColor}>
              {t('deliver-assignment.feedback')}
            </Text>
            <Text>
              {currentTask.description}
            </Text>
          </Box>
        )}
        {showCodeReviews && (
          <Flex padding="8px" flexDirection="column" gridGap="16px" background={featuredColor} borderRadius="4px">
            <Flex alignItems="center" gridGap="10px">
              <Icon icon="code" width="18.5px" height="17px" color="currentColor" />
              <Text size="14px" fontWeight={700}>
                {t('code-review.count-code-reviews', { count: codeRevisions.length || 0 })}
              </Text>
              {!isStudent && codeRevisions.length > 0 && (
                <Button height="auto" width="fit-content" onClick={() => setStage('review_code_revision')} isLoading={loaders.isFetchingCommitFiles} variant="link" display="flex" alignItems="center" gridGap="10px" justifyContent="start">
                  {t('code-review.read-code-reviews')}
                </Button>
              )}
            </Flex>
            <Button height="auto" width="fit-content" onClick={proceedToCommitFiles} isLoading={loaders.isFetchingCommitFiles} variant="link" display="flex" alignItems="center" gridGap="10px" justifyContent="start">
              {t('code-review.start-code-review')}
              <Icon icon="longArrowRight" width="24px" height="10px" color={hexColor.blueDefault} />
            </Button>
          </Flex>
        )}
        {!readOnly && (
          <ModalFooter mt="10px" paddingTop="1.5rem" justifyContent="center" borderTop="1px solid" borderColor={borderColor2}>
            <Button onClick={() => setOpenIgnoreTask(true)} variant={taskIsIgnored ? 'default' : 'outline'} textTransform="uppercase">
              {taskIsIgnored
                ? t('deliver-assignment.mark-as-pending')
                : t('deliver-assignment.ignore-task')}
            </Button>
          </ModalFooter>
        )}
      </Box>

      <Modal
          // isCentered
        isOpen={openIgnoreTask}
        onClose={() => setOpenIgnoreTask(false)}
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
              {t('deliver-assignment.confirm-ignore', { student: fullName })}
            </Text>
          </ModalBody>
          <ModalFooter margin="0 1.5rem" padding="1.5rem 0" justifyContent="center" borderTop="1px solid" borderColor={borderColor2}>
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
                  .catch((e) => {
                    console.log(e);
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
    </>
  );
}

DeliverModalContent.propTypes = {
  isStudent: PropTypes.bool,
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  projectLink: PropTypes.string.isRequired,
  deliveryUrl: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  updpateAssignment: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  showCodeReviews: PropTypes.bool,
  contextData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  setStage: PropTypes.func,
  loaders: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  proceedToCommitFiles: PropTypes.func,
};
DeliverModalContent.defaultProps = {
  isStudent: false,
  readOnly: false,
  showCodeReviews: false,
  contextData: {},
  setStage: () => {},
  loaders: {},
  proceedToCommitFiles: () => {},
};

export default DeliverModalContent;
