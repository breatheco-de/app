import PropTypes from 'prop-types';
import { useState } from 'react';
import { Box, Button, Flex, Link, useToast } from '@chakra-ui/react';
// import useTranslation from 'next-translate/useTranslation';
import useTranslation from 'next-translate/useTranslation';
import SimpleModal from '../SimpleModal';
import Text from '../Text';
import useStyle from '../../hooks/useStyle';
import CodeReview from './CodeReview';
import AlertMessage from '../AlertMessage';
import Icon from '../Icon';
import FileList from './FileList';
import bc from '../../services/breathecode';

export const stages = {
  initial: 'initial',
  file_list: 'file_list',
  code_review: 'code_review',
};

function ReviewButton({ currentTask, type, onClose, updpateAssignment }) {
  const toast = useToast();
  const { t } = useTranslation('assignments');
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
      minWidth="128px"
      background={buttonColor[type]}
      _hover={{ background: buttonColor[type] }}
      onClick={() => {
        if (revisionStatus[type] !== undefined) {
          bc.todo()
            .update({
              id: currentTask.id,
              revision_status: revisionStatus[type],
              // description: comment,
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
                // description: comment,
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
      borderRadius="3px"
      fontSize="13px"
      textTransform="uppercase"
    >
      {buttonText[type]}
    </Button>
  );
}

function ReviewModal({ isOpen, defaultStage, defaultContextData, onClose, updpateAssignment, currentTask, projectLink, ...rest }) {
  const [selectedText, setSelectedText] = useState('');
  const [loaders, setLoaders] = useState({
    isFetchingCommitFiles: false,
  });
  const [contextData, setContextData] = useState(defaultContextData);
  const [stage, setStage] = useState(defaultStage);
  const { lightColor, featuredColor, hexColor } = useStyle();
  const toast = useToast();
  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;
  const taskStatus = currentTask?.task_status;
  const revisionStatus = currentTask?.revision_status;

  const handleSelectedText = () => {
    const text = window.getSelection().toString();
    if (text.length > 0) {
      setSelectedText(text);
    }
  };

  const widthSizes = {
    initial: '36rem',
    file_list: '42rem',
    code_review: '74rem',
  };

  const proceedToCommitFiles = async () => {
    setLoaders((prevState) => ({
      ...prevState,
      isFetchingCommitFiles: true,
    }));
    const response = await bc.assignments().files(currentTask.id);
    const data = await response.json();

    if (response.status >= 400) {
      toast({
        title: 'Error',
        description: data.detail,
        status: 'error',
        duration: 9000,
        position: 'top',
        isClosable: true,
      });
    }
    if (response.ok) {
      setContextData((prevState) => ({
        ...prevState,
        commitfiles: {
          task: currentTask,
          fileList: data,
        },
      }));
      setStage(stages.file_list);
    }
    setLoaders((prevState) => ({
      ...prevState,
      isFetchingCommitFiles: false,
    }));
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setStage(stages.initial);
      }}
      title={stage === stages.initial ? 'Assignment review' : 'Rigobot code review'}
      closeOnOverlayClick={false}
      maxWidth={widthSizes[stage]}
      isCentered={stage === stages.initial}
      // maxWidth="74rem"
      minHeight={stage === stages.initial ? 'auto' : '30rem'}
      bodyStyles={{
        display: 'flex',
        gridGap: '20px',
        padding: '1rem',
      }}
      headerStyles={{
        userSelect: 'none',
        textTransform: stage === stages.initial ? 'uppercase' : 'initial',
        fontSize: stage === stages.initial ? '15px' : '26px',
        textAlign: stage === stages.initial ? 'center' : 'start',
        fontWeight: 700,
      }}
      {...rest}
    >
      {stage === stages.initial && currentTask && (
        <Box maxWidth="500px" margin="0 auto">
          <AlertMessage type="warning" full message="This project needs to have at least 3 code reviews in order to be accepted or rejected." borderRadius="4px" padding="8px" mb="24px" />
          <Flex flexDirection="column" gridGap="16px">
            <Flex justifyContent="space-between">
              <Text size="14px" color={lightColor}>
                {`Student: ${fullName}`}
              </Text>
              {taskStatus === 'DONE' && revisionStatus === 'PENDING' && (
                <Box textTransform="uppercase" fontSize="13px" background="yellow.light" color="yellow.default" borderRadius="27px" padding="2px 6px" fontWeight={700} border="2px solid" borderColor="yellow.default">
                  Waiting for review
                </Box>
              )}
            </Flex>
            <Text size="14px" color={lightColor}>
              <span>
                Project Instructions:
              </span>
              {' '}
              <Link variant="default" href={projectLink}>
                {currentTask?.title}
              </Link>
            </Text>
            <Flex padding="8px" flexDirection="column" gridGap="16px" background={featuredColor} borderRadius="4px">
              <Flex alignItems="center" gridGap="10px">
                <Icon icon="code" width="18.5px" height="17px" color="#fff" />
                <Text size="14px" fontWeight={700}>
                  {`${contextData?.code_revisions?.length} code reviews`}
                </Text>
              </Flex>
              <Button height="auto" onClick={proceedToCommitFiles} isLoading={loaders.isFetchingCommitFiles} variant="link" display="flex" alignItems="center" gridGap="10px" justifyContent="start">
                Start code review
                <Icon icon="longArrowRight" width="24px" height="10px" color={hexColor.blueDefault} />
              </Button>
            </Flex>

            {contextData?.code_revisions?.length >= 3 && (
              <Flex justifyContent="space-between" pt="8px">
                {['reject', 'approve'].map((type) => (
                  <ReviewButton type={type} currentTask={currentTask} onClose={onClose} updpateAssignment={updpateAssignment} />
                ))}
              </Flex>
            )}
          </Flex>
        </Box>
      )}
      {stage === stages.file_list && !loaders.isFetchingCommitFiles && (
        <FileList data={contextData.commitfiles} setContextData={setContextData} stage={stage} stages={stages} setStage={setStage} />
      )}
      {stage === stages.code_review && contextData.commitFile?.code && (
        <CodeReview setStage={setStage} commitData={contextData.commitFile} selectedText={selectedText} handleSelectedText={handleSelectedText} />
      )}
    </SimpleModal>
  );
}

ReviewModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  projectLink: PropTypes.string,
  defaultStage: PropTypes.string,
  defaultContextData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  updpateAssignment: PropTypes.func.isRequired,
};
ReviewModal.defaultProps = {
  isOpen: false,
  onClose: () => {},
  currentTask: {},
  projectLink: '',
  defaultStage: stages.initial,
  defaultContextData: {
    commitfiles: [],
    commitFile: {},
    code_revisions: [],
  },
};

ReviewButton.propTypes = {
  type: PropTypes.string.isRequired,
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  onClose: PropTypes.func.isRequired,
  updpateAssignment: PropTypes.func.isRequired,
};

export default ReviewModal;
