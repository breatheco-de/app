import { Box, Button, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import Heading from '../Heading';
import useStyle from '../../hooks/useStyle';
import Icon from '../Icon';
import Text from '../Text';
import { log } from '../../../utils/logging';
import UndoApprovalModal from '../UndoApprovalModal';

function FileList({ isStudent, currentTask, contextData, updpateAssignment, setContextData, stage, stages, setStage, setReviewStatus }) {
  const { t } = useTranslation('assignments');
  const [openUndoApproval, setOpenUndoApproval] = useState(false);
  const { fontColor, borderColor, lightColor, hexColor, featuredLight } = useStyle();
  const commitFiles = contextData?.commitFiles || {};
  const codeRevisions = contextData?.code_revisions || [];
  const fileList = commitFiles?.fileList || [];
  const revisionStatus = currentTask?.revision_status;
  const hasBeenApproved = revisionStatus === 'APPROVED';

  const buttonText = {
    approve: t('review-assignment.approve'),
    reject: t('review-assignment.reject'),
  };
  const buttonColor = {
    approve: 'success',
    reject: 'danger',
  };
  log('fileList:', fileList);
  const proceedToCodeReview = (commitData) => {
    const content = commitData?.content;

    setContextData((prevState) => ({
      ...prevState,
      commitFile: {
        path: commitData?.name,
        ...commitData,
        task: commitFiles?.task || {},
        code: content,
      },
    }));
    setStage(stages.code_review);
  };
  const openCommitFile = (commitData) => {
    proceedToCodeReview(commitData);
  };

  return (
    <Flex display={stage !== stages.file_list && 'none'} flexDirection="column" gridGap="24px" width="100%">
      {fileList?.length > 0 ? (
        <>
          <Flex mb="15px" gridGap="2px" flexDirection="column">
            <Heading size="18px" color={lightColor} fontWeight={400}>
              {t('code-review.select-file-to-review')}
            </Heading>
            <Heading size="18px" fontWeight={700}>
              {commitFiles?.task?.title}
            </Heading>
          </Flex>
          <Flex my="10px" py="10px" px="10px" borderRadius="10px" background={featuredLight}>
            <Box fontSize="12px" flex={0.33}>{t('code-review.filename')}</Box>
            <Box fontSize="12px" flex={0.33}>{t('code-review.feedback-status')}</Box>
            <Box fontSize="12px" flex={0.33}>{t('code-review.reviews')}</Box>
          </Flex>
          <Flex flexDirection="column" gridGap="12px">
            {fileList.map((file) => {
              const revisionsRelated = codeRevisions?.length > 0
                ? codeRevisions.filter((revision) => revision?.file?.id === file?.id).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                : [];
              const lastUpdatedRevision = revisionsRelated?.[0] || {};
              const feedbackHasBeenRated = typeof lastUpdatedRevision?.is_good === 'boolean';
              const rateIcon = lastUpdatedRevision?.is_good ? 'feedback-like' : 'feedback-dislike';

              return (
                <Flex border="1px solid" borderColor={borderColor} justifyContent="center" alignItems="center" minHeight="48px" padding="4px 8px" borderRadius="8px">
                  <Icon icon="file2" width="22px" height="22px" display="flex" alignItems="center" color={fontColor} flex={0.1} />
                  <Flex flexDirection="column" flex={0.4} maxWidth="102px">
                    <Flex flexDirection="column" gridGap="0px">
                      <Text fontSize="12px" fontWeight={700} style={{ textWrap: 'nowrap' }}>
                        {file?.name}
                      </Text>
                      <Text fontSize="12px" fontWeight={400} title={file?.commit_hash}>
                        {`${file?.commit_hash.slice(0, 10)}...`}
                      </Text>
                    </Flex>
                    {file?.committer?.github_username && (
                      <Box fontSize="12px">
                        {file?.committer?.github_username}
                      </Box>
                    )}
                  </Flex>
                  <Flex flex={0.3} alignItems="center" justifyContent="center" opacity={lastUpdatedRevision.is_good !== null ? 1 : 0.5}>
                    <Icon icon={(feedbackHasBeenRated && lastUpdatedRevision.is_good !== null) ? rateIcon : 'unchecked'} width="24px" height="24px" />
                  </Flex>

                  <Flex flex={0.3} justifyContent="center" alignItems="center">
                    <Flex width="auto" position="relative" justifyContent="center">
                      <Box position="absolute" top={-1.5} right={-2} background="blue.default" fontSize="10px" padding="1px 5px" fontWeight={700} height="auto" borderRadius="50%">
                        {revisionsRelated?.length || 0}
                      </Box>
                      <Icon icon="code-comment" width="20px" height="20px" color={hexColor.black} />
                    </Flex>
                  </Flex>
                  <Button
                    variant="default"
                    isDisabled={!file?.content}
                    flex={0.2}
                    height="40px"
                    onClick={() => {
                      if (file?.content) openCommitFile(file);
                    }}
                    display="flex"
                    alignItems="center"
                    gridGap="10px"
                  >
                    {t('code-review.start-review')}
                  </Button>
                </Flex>
              );
            })}
          </Flex>
        </>
      ) : (
        <Flex alignItems="center" justifyContent="center" padding="0 0 1.5rem 0" height="100%" width="500px" flexDirection="column" margin="1rem auto" gridGap="0.7rem">
          <Heading size="xsm">
            {t('code-review.no-files-to-review')}
          </Heading>
          <Text size="14px" textAlign="center" style={{ textWrap: 'balance' }}>
            {!hasBeenApproved ? t('code-review.student-has-no-files-to-review') : t('code-review.student-has-no-files-but-has-been-approved')}
          </Text>
          {!hasBeenApproved && (
            <Flex width="100%" justifyContent="space-between" mt="3rem">
              {['reject', 'approve'].map((type) => (
                <Button
                  minWidth="128px"
                  background={buttonColor[type]}
                  _hover={{ background: buttonColor[type] }}
                  onClick={() => {
                    setStage(stages.approve_or_reject_code_revision);
                    setReviewStatus(type);
                  }}
                  color="white"
                  borderRadius="3px"
                  fontSize="13px"
                  textTransform="uppercase"
                >
                  {buttonText[type]}
                </Button>
              ))}
            </Flex>
          )}
          {!isStudent && hasBeenApproved && (
            <>
              <Button
                minWidth="128px"
                mt="8px"
                onClick={() => setOpenUndoApproval(true)}
                color="currentColor"
                borderRadius="3px"
                fontSize="13px"
                textTransform="uppercase"
                variant="outline"
                width="fit-content"
                alignSelf="center"
              >
                {t('task-handler.undo-approval')}
              </Button>
              <UndoApprovalModal
                isOpen={openUndoApproval}
                onClose={() => setOpenUndoApproval(false)}
                updpateAssignment={updpateAssignment}
                currentTask={currentTask}
              />
            </>
          )}
        </Flex>
      )}
    </Flex>
  );
}
FileList.propTypes = {
  stage: PropTypes.string,
  stages: PropTypes.shape({
    initial: PropTypes.string,
    file_list: PropTypes.string,
    code_review: PropTypes.string,
    approve_or_reject_code_revision: PropTypes.string,
  }),
  setStage: PropTypes.func,
  contextData: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  setContextData: PropTypes.func,
  setReviewStatus: PropTypes.func.isRequired,
  isStudent: PropTypes.bool.isRequired,
  updpateAssignment: PropTypes.func,
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};
FileList.defaultProps = {
  stage: '',
  stages: {
    initial: 'initial',
    file_list: 'file_list',
    code_review: 'code_review',
  },
  setStage: () => {},
  setContextData: () => {},
  updpateAssignment: () => {},
};

export default FileList;
