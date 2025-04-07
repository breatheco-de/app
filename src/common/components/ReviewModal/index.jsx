/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Box, Button, Flex, Textarea, useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import SimpleModal from '../SimpleModal';
import Text from '../Text';
import useStyle from '../../hooks/useStyle';
import CodeReview from './CodeReview';
import DeliverModalContent from './DeliverModalContent';
import Icon from '../Icon';
import FileList from './FileList';
import bc from '../../services/breathecode';
import ReviewCodeRevision from './ReviewCodeRevision';
import useAuth from '../../hooks/useAuth';
import { error } from '../../../utils/logging';
import { reportDatalayer } from '../../../utils/requests';
import { getBrowserInfo } from '../../../utils';
import AssignmentReview from './AssignmentReview';
import PendingActivities from './PendingActivities';

export const stages = {
  initial: 'initial',
  file_list: 'file_list',
  code_review: 'code_review',
  approve_or_reject_code_revision: 'approve_or_reject_code_revision',
  review_code_revision: 'review_code_revision',
  deliver_assignment: 'deliver_assignment',
  pending_activities: 'pending_activities',
};

const statusList = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};
const { APPROVED, REJECTED } = statusList;
const inputLimit = 450;

function ReviewModal({
  isExternal, externalFiles, isOpen, isStudent, externalData, defaultStage,
  fixedStage, onClose, updpateAssignment, currentTask, cohortSlug,
  projectLink, disableRate, disableLiking, ...rest }) {
  const { t } = useTranslation('assignments');
  const { isAuthenticated, isAuthenticatedWithRigobot, user } = useAuth();
  const toast = useToast();
  const [selectedText, setSelectedText] = useState('');
  const [loaders, setLoaders] = useState({
    isFetchingCommitFiles: false,
    isFetchingCodeReviews: false,
    isApprovingOrRejecting: false,
  });
  const [comment, setComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [contextData, setContextData] = useState({
    commitFiles: {
      task: {},
      fileList: [],
    },
    commitFile: {},
    code_revisions: [],
    my_revisions: [],
    revision_content: {},
  });

  const initialStage = {
    current: defaultStage,
    previous: {},
  };

  const [stageHistory, setStageHistory] = useState(initialStage);
  const { hexColor } = useStyle();
  const revisionStatus = currentTask?.revision_status;
  const hasBeenApproved = revisionStatus === APPROVED;
  const noFilesToReview = !hasBeenApproved && (contextData?.commitFiles?.fileList?.length === 0 || !('commitFiles' in contextData));
  const hasFilesToReview = contextData?.code_revisions?.length > 0 || !isStudent; // Used to show rigobot files content
  const stage = stageHistory?.current;

  const isStageWithDefaultStyles = hasBeenApproved || (stage === stages.initial || stage === stages.approve_or_reject_code_revision || noFilesToReview);
  const showGoBackButton = Object.keys(stageHistory.previous).length > 1;

  const revisionStatusUpperCase = {
    approve: APPROVED,
    reject: REJECTED,
  };
  const reviewHint = {
    approve: t('code-review.why-approve'),
    reject: t('code-review.why-reject'),
  };
  const alertStatus = {
    approve: t('alert-message:review-assignment-approve'),
    reject: t('alert-message:review-assignment-reject'),
  };

  const setStage = (newStage, type = 'next') => {
    setStageHistory((prevState) => {
      if (type === 'next') {
        const newPrevious = { ...prevState?.previous, [prevState?.current]: true };
        return {
          current: newStage,
          previous: newPrevious,
        };
      }
      if (type === 'back') {
        const keys = Object.keys(prevState.previous);
        const lastKey = keys[keys.length - 1];
        const newCurrent = lastKey || defaultStage;
        const { [lastKey]: _, ...newPrevious } = prevState.previous;
        return {
          current: newCurrent,
          previous: newPrevious,
        };
      }
      return prevState;
    });
  };

  const rejectOrApprove = (status) => {
    reportDatalayer({
      dataLayer: {
        event: 'feedback_reject_or_approve',
        action_type: status,
        task_id: currentTask?.id,
        user_id: user.id,
        agent: getBrowserInfo(),
      },
    });
    setStage(stages.approve_or_reject_code_revision);
    setReviewStatus(status);
  };
  const getRepoFiles = async () => {
    try {
      if (!isAuthenticatedWithRigobot || !currentTask.github_url) return;
      const response = isStudent
        ? await bc.assignments().personalFiles(currentTask.id)
        : await bc.assignments().files(currentTask.id);
      const data = await response.json();

      if (response.ok) {
        setContextData((prevState) => ({
          ...prevState,
          commitFiles: {
            task: currentTask,
            fileList: data,
          },
        }));
      } else {
        setContextData((prevState) => ({
          ...prevState,
          commitFiles: {
            task: currentTask,
            fileList: [],
          },
        }));
      }
    } catch (errorMsg) {
      error('Error fetching repo files:', errorMsg);
    }
  };
  const getCodeRevisions = async () => {
    try {
      if (!isAuthenticatedWithRigobot || !currentTask.github_url) return;
      const response = isStudent
        ? await bc.assignments().getPersonalCodeRevisionsByTask(currentTask.id)
        : await bc.assignments().getCodeRevisions(currentTask.id);
      const data = await response.json();

      if (response.ok) {
        const codeRevisionsSortedByDate = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setContextData((prev) => ({
          ...prev,
          code_revisions: codeRevisionsSortedByDate,
          my_revisions: data.filter((revision) => revision?.reviewer?.username === user?.email),
        }));
      } else {
        toast({
          title: t('alert-message:something-went-wrong'),
          description: `Cannot get code revisions: ${data?.detail}`,
          status: 'error',
          duration: 5000,
          position: 'top',
          isClosable: true,
        });
      }
    } catch (errorMsg) {
      error('Error fetching code revisions:', errorMsg);
    } finally {
      setLoaders((prevState) => ({
        ...prevState,
        isFetchingCodeReviews: false,
      }));
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated && user?.id) {
      const revisionData = contextData?.revision_content;
      const dataToReport = revisionData?.id ? {
        event: 'review_modal_open',
        feedback_type: isStudent ? 'read_code_review' : 'write_code_review',
        feedback_id: revisionData?.id,
        language: revisionData?.language,
        reviewer: revisionData?.reviewer,
        comment: revisionData?.revision_rating_comments,
        user_id: user.id,
        updated_at: revisionData?.updated_at,
        created_at: revisionData?.created_at,
      } : {
        event: 'review_modal_open',
        feedback_type: 'project_task_review',
        task_id: currentTask?.id,
        task_slug: currentTask?.associated_slug,
        task_mandatory: currentTask?.mandatory,
        task_type: currentTask?.task_type,
        task_status: currentTask?.task_status,
        task_github_url: currentTask?.github_url,
        user_id: user.id,
      };
      reportDatalayer({
        dataLayer: {
          ...dataToReport,
          agent: getBrowserInfo(),
        },
      });
    }
  }, [isOpen, isAuthenticated, contextData]);

  useEffect(() => {
    if (externalData) {
      setContextData(() => ({
        ...externalData,
      }));
    }
  }, [isOpen, externalData]);
  useEffect(() => {
    if (defaultStage) {
      setStage(defaultStage);
    }
    if (isOpen && currentTask?.id > 0 && !externalData) {
      setLoaders((prevState) => ({
        ...prevState,
        isFetchingCodeReviews: true,
      }));
      getRepoFiles();
      getCodeRevisions();
    }
  }, [isOpen, currentTask?.id, externalData]);

  const onChangeComment = (e) => {
    setComment(e.target.value);
  };

  const handleResetFlow = () => {
    setContextData((prevState) => ({
      ...prevState,
      commitFile: {},
    }));
    setSelectedText('');
  };

  const resetState = () => {
    setContextData({});
    setStage(stages.initial);
    setStageHistory(initialStage);
    setReviewStatus('');
    setSelectedText('');
  };

  const approveOrRejectProject = () => {
    reportDatalayer({
      dataLayer: {
        event: 'feedback_action',
        comment,
        action_type: reviewStatus,
        task_id: currentTask?.id,
        user_id: user.id,
        agent: getBrowserInfo(),
      },
    });

    if (revisionStatusUpperCase[reviewStatus] !== undefined) {
      setLoaders((prevState) => ({
        ...prevState,
        isApprovingOrRejecting: true,
      }));
      bc.todo()
        .update({
          id: currentTask.id,
          revision_status: revisionStatusUpperCase[reviewStatus],
          description: comment,
        })
        .then(() => {
          toast({
            position: 'top',
            title: alertStatus[reviewStatus],
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          updpateAssignment({
            ...currentTask,
            id: currentTask.id,
            revision_status: revisionStatusUpperCase[reviewStatus],
            description: comment,
          });
          resetState();
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
        })
        .finally(() => {
          setLoaders((prevState) => ({
            ...prevState,
            isApprovingOrRejecting: false,
          }));
        });
    }
  };

  const handleSelectedText = () => {
    const text = window.getSelection().toString();
    if (text.length > 0) {
      setSelectedText(text);
    }
  };

  const widthSizes = {
    initial: (!isAuthenticatedWithRigobot || !noFilesToReview) && hasFilesToReview ? '36rem' : '28rem',
    approve_or_reject_code_revision: '36rem',
    file_list: '42rem',
    code_review: '74rem',
    review_code_revision: '56rem',
    pending_activities: '2xl',
  };

  const handleCommitFilesStage = () => {
    if (isStudent) {
      setStage(stages.review_code_revision);
    } else {
      setStage(stages.file_list);
    }
  };

  const proceedToCommitFiles = async () => {
    setLoaders((prevState) => ({
      ...prevState,
      isFetchingCommitFiles: true,
    }));
    handleCommitFilesStage();
    setLoaders((prevState) => ({
      ...prevState,
      isFetchingCommitFiles: false,
    }));
  };

  const getTitle = () => {
    if (stage === stages.initial) {
      return t('code-review.assignment-review');
    }
    if (stage === stages.approve_or_reject_code_revision) {
      return t('code-review.write-feedback');
    }
    if (stage === stages.deliver_assignment) {
      return t('deliver-assignment.title');
    }
    if (stage === stages.pending_activities) {
      return t('dashboard:mandatoryProjects.title');
    }

    return (
      <Flex alignItems="center" justifyContent="center">
        <Icon icon="rigobot-avatar-tiny" width="24px" height="24px" mr="8px" />
        {t('code-review.rigobot-code-review')}
      </Flex>
    );
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetState();
      }}
      title={getTitle()}
      closeOnOverlayClick={false}
      maxWidth={widthSizes[stage]}
      minWidth={stage === stages.code_review && '83vw'}
      minHeight={isStageWithDefaultStyles ? 'auto' : '30rem'}
      overflow={stages.initial ? 'initial' : 'auto'}
      margin="0 10px"
      bodyStyles={{
        display: 'flex',
        gridGap: '20px',
        padding: '1rem 1.5rem',
      }}
      headerStyles={{
        userSelect: 'none',
        textTransform: isStageWithDefaultStyles ? 'uppercase' : 'initial',
        fontSize: isStageWithDefaultStyles ? '15px' : '26px',
        textAlign: 'center',
        fontWeight: 700,
      }}
      closeButtonStyles={{
        top: isStageWithDefaultStyles ? 2 : 5,
      }}
      leftButton={showGoBackButton && (
        <Button
          position="absolute"
          variant="unstyled"
          top={isStageWithDefaultStyles ? 2 : 4}
          left={5}
          onClick={() => {
            setStage('', 'back');
            handleResetFlow();
          }}
          aria-label={t('common:go-back')}
        >
          <Icon icon="arrowLeft2" width="26px" height="15px" color={hexColor.black} />
        </Button>
      )}
      {...rest}
    >
      {stage === stages.initial && currentTask && (
        <AssignmentReview
          currentTask={currentTask}
          loaders={loaders}
          hasFilesToReview={hasFilesToReview}
          isStudent={isStudent}
          externalFiles={externalFiles}
          noFilesToReview={noFilesToReview}
          disableRate={disableRate}
          contextData={contextData}
          setStage={setStage}
          rejectOrApprove={rejectOrApprove}
          updpateAssignment={updpateAssignment}
          onClose={onClose}
          resetState={resetState}
          setLoaders={setLoaders}
        />
      )}

      {stage === stages.approve_or_reject_code_revision && (
        <Flex flexDirection="column" maxWidth="500px" margin="0 auto" gridGap="15px" width="100%">
          <Box position="relative">
            <Text fontSize="14px" fontWeight={700} mb="18px">
              {reviewHint[reviewStatus]}
            </Text>
            <Textarea aria-label="feedback input" fontSize="12px" onChange={onChangeComment} minHeight="134" placeholder={t('code-review.start-review-here')} />
            <Box position="absolute" bottom={1.5} right={3} color={comment.length < 10 ? '#EB5757' : 'currentColor'}>
              {`${comment.length} / ${inputLimit}`}
            </Box>
          </Box>
          <Button onClick={approveOrRejectProject} isLoading={loaders.isApprovingOrRejecting} variant="default" alignSelf="flex-end" isDisabled={comment.length < 10 || revisionStatusUpperCase[reviewStatus] === undefined}>
            {t('code-review.send-feedback')}
          </Button>
        </Flex>
      )}

      {stage === stages.file_list && !loaders.isFetchingCommitFiles && (
        <FileList isStudent={isStudent} contextData={contextData} setContextData={setContextData} currentTask={currentTask} updpateAssignment={updpateAssignment} stage={stage} stages={stages} setStage={setStage} setReviewStatus={setReviewStatus} />
      )}
      {stage === stages.code_review && (contextData.commitFile?.code || contextData.revision_content?.code) && (
        <CodeReview isExternal={isExternal} onClose={onClose} disableRate={disableRate} isStudent={isStudent} setStage={setStage} handleResetFlow={handleResetFlow} contextData={contextData} setContextData={setContextData} selectedText={selectedText} handleSelectedText={handleSelectedText} />
      )}

      {stage === stages.review_code_revision && (
        <ReviewCodeRevision disableRate={disableLiking} contextData={contextData} setContextData={setContextData} stage={stage} stages={stages} setStage={setStage} />
      )}

      {stage === stages.deliver_assignment && (
        <DeliverModalContent
          onClose={onClose}
          isStudent={isStudent}
          contextData={contextData}
          currentTask={currentTask}
          projectLink={projectLink}
          updpateAssignment={updpateAssignment}
          setStage={setStage}
          showCodeReviews={(!isAuthenticatedWithRigobot || !noFilesToReview) && hasFilesToReview && !disableRate}
          loaders={loaders}
          proceedToCommitFiles={proceedToCommitFiles}
          {...rest}
        />
      )}

      {stage === stages.pending_activities && (
        <PendingActivities cohortSlug={cohortSlug} setStage={setStage} />
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
  updpateAssignment: PropTypes.func,
  externalData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  isStudent: PropTypes.bool,
  fixedStage: PropTypes.bool,
  disableRate: PropTypes.bool,
  disableLiking: PropTypes.bool,
  isExternal: PropTypes.bool,
  cohortSlug: PropTypes.string,
};
ReviewModal.defaultProps = {
  isOpen: false,
  onClose: () => { },
  currentTask: {},
  projectLink: '',
  defaultStage: stages.initial,
  updpateAssignment: () => { },
  externalData: null,
  isStudent: false,
  fixedStage: false,
  disableRate: false,
  disableLiking: false,
  isExternal: false,
  cohortSlug: null,
};

export default ReviewModal;
