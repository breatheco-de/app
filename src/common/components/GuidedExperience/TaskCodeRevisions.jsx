import { Box, Button, Divider, Flex, Textarea } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import useAuth from '../../../hooks/useAuth';
import useModuleHandler from '../../../hooks/useModuleHandler';
import useStyle from '../../../hooks/useStyle';
import useCustomToast from '../../../hooks/useCustomToast';
import bc from '../../../services/breathecode';
import CodeRevisionsList from '../ReviewModal/CodeRevisionsList';
import Icon from '../Icon';
import Heading from '../Heading';
import Text from '../Text';
import MarkDownParser from '../MarkDownParser';
import { error } from '../../../utils/logging';

const inputReviewRateCommentLimit = 100;
const defaultReviewRateData = {
  status: null,
  comment: '',
  isSubmitting: false,
  submited: false,
};
function TaskCodeRevisions() {
  const { t } = useTranslation('syllabus');
  const { currentTask } = useModuleHandler();
  const { featuredLight, hexColor, backgroundColor, backgroundColor4 } = useStyle();
  const { isAuthenticatedWithRigobot } = useAuth();
  const { createToast } = useCustomToast({ toastId: 'something-went-wrong-error-task' });
  const [contextData, setContextData] = useState({
    code_revisions: [],
    revision_content: {},
  });
  const [reviewRateData, setReviewRateData] = useState(defaultReviewRateData);

  const reviewRateStatus = reviewRateData?.status;
  const codeRevisions = contextData?.code_revisions || [];
  const revisionContent = contextData?.revision_content;
  const hasRevision = revisionContent !== undefined;
  const resetView = () => {
    setReviewRateData({
      status: null,
      comment: '',
      isSubmitting: false,
      submited: false,
    });
  };

  const selectCodeRevision = (revision) => {
    const content = revision?.original_code;
    const decodedReviewCodeContent = atob(content);

    setContextData((prevState) => ({
      ...prevState,
      revision_content: {
        path: revision?.file?.name,
        ...revision,
        code: decodedReviewCodeContent,
      },
    }));

    if (revision.is_good || revision.revision_rating_comments) {
      setReviewRateData((prev) => ({
        ...prev,
        submited: true,
        status: revision.is_good ? 'like' : 'dislike',
        comment: revision.revision_rating_comments,
      }));
    }
  };

  const getCodeRevisions = async () => {
    try {
      if (!isAuthenticatedWithRigobot || !currentTask.github_url) return;
      const response = await bc.assignments().getPersonalCodeRevisionsByTask(currentTask.id);
      const data = await response.json();
      if (response.ok) {
        const codeRevisionsSortedByDate = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setContextData((prev) => ({
          ...prev,
          code_revisions: codeRevisionsSortedByDate,
        }));
      } else {
        createToast({
          title: t('alert-message:something-went-wrong'),
          // description: `Cannot get code revisions: ${data?.detail}`,
          description: `Error: ${data?.Error}. ${data?.solution || ''}`,
          status: 'error',
          duration: 5000,
          position: 'top',
          isClosable: true,
        });
      }
    } catch (errorMsg) {
      error('Error fetching code revisions:', errorMsg);
    }
  };

  useEffect(() => {
    if (currentTask) {
      getCodeRevisions();
    }
  }, [currentTask?.id]);

  const handleSelectReviewRate = (status) => {
    setReviewRateData((prev) => ({ ...prev, status }));
  };

  const onChangeRateComment = (e) => {
    if (e.target.value.length <= inputReviewRateCommentLimit) {
      setReviewRateData((prev) => ({ ...prev, comment: e.target.value }));
    }
  };

  const submitReviewRate = async (type) => {
    try {
      setReviewRateData((prev) => ({ ...prev, isSubmitting: true }));
      const argsData = {
        send: {
          is_good: reviewRateData.status === 'like',
          comment: reviewRateData.comment,
        },
        skip: {
          is_good: reviewRateData.status === 'like',
          comment: null,
        },
      };
      const { data } = await bc.assignments().rateCodeRevision(revisionContent?.id, argsData[type]);

      setReviewRateData((prev) => ({ ...prev, submited: true }));
      const updatedRevisionContent = {
        ...data,
        is_good: typeof data?.is_good === 'string' ? data?.is_good === 'True' : data?.is_good,
        hasBeenReviewed: true,
      };
      const updateCodeRevisions = contextData.code_revisions.map((revision) => {
        if (revision.id === revisionContent.id) {
          return updatedRevisionContent;
        }
        return revision;
      });
      selectCodeRevision(updatedRevisionContent);
      setContextData((prevState) => ({
        ...prevState,
        code_revisions: updateCodeRevisions,
      }));
    } finally {
      setReviewRateData((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <Box padding="16px" borderRadius="16px" background={backgroundColor4} width="100%" maxWidth={{ base: 'none', md: '50%' }}>
      {revisionContent?.id ? (
        <Flex gap="10px" alignItems="center" mb="16px">
          <Button
            variant="ghost"
            color={hexColor.blueDefault}
            size="sm"
            onClick={() => {
              resetView();
              setContextData((prev) => ({ ...prev, revision_content: {} }));
            }}
          >
            ←
            {'  '}
            {t('back')}
          </Button>
          <Heading fontSize="18px" fontWeight="400">
            {revisionContent?.file?.name}
          </Heading>
        </Flex>
      ) : (
        <Heading size="18px" mb="16px">
          {t('code-reviews')}
        </Heading>
      )}
      {codeRevisions?.length > 0 ? (
        <>
          {!revisionContent?.id ? (
            <CodeRevisionsList codeRevisions={contextData?.code_revisions} revisionContent={contextData?.revision_content} selectCodeRevision={selectCodeRevision} height="auto" />
          ) : (
            <>
              <Flex background={backgroundColor} padding="24px" borderRadius="11px" flexDirection="column" overflow="auto" gridGap="12px" flex={0.35} width="100%" mt={!hasRevision && '3.4rem'}>

                {hasRevision && (
                <Flex flexDirection="column" gridGap="16px">
                  <Flex flexDirection="column" gridGap="8px">
                    <Text size="12px">
                      {revisionContent?.comment}
                    </Text>

                    <Box fontSize="13px" color="#fff" borderRadius="6px" maxWidth="100%" overflow="auto">
                      <MarkDownParser
                        content={`\`\`\`${revisionContent?.file?.language || 'bash'}
${revisionContent?.code}
\`\`\``}
                      />
                    </Box>
                  </Flex>
                  {reviewRateStatus !== null && (
                    <>
                      <Divider color={hexColor.borderColor} margin="10px 0" />

                      <Box
                        borderRadius="8px"
                        padding="8px"
                        border="1px solid"
                        display="flex"
                        gap="8px"
                        alignItems="center"
                        color={reviewRateStatus === 'like' ? hexColor.green : hexColor.danger}
                        background={reviewRateStatus === 'like' ? hexColor.greenLight3 : 'red.light'}
                      >
                        <Icon icon={`feedback-${reviewRateStatus}`} width="24px" height="24px" />
                        <Text>
                          {t(reviewRateStatus)}
                        </Text>
                      </Box>
                    </>
                  )}
                </Flex>
                )}
                {hasRevision && reviewRateData.submited && (
                  <Flex flexDirection="column" gridGap="16px">
                    <Box background={featuredLight} borderRadius="11px" padding="8px">
                      <Text fontWeight="700" size="md" color={hexColor.fontColor3}>
                        {`${t('you')}:`}
                      </Text>
                      <Text size="md" color={hexColor.fontColor3}>
                        {reviewRateData?.comment}
                      </Text>
                    </Box>
                  </Flex>
                )}
              </Flex>
              <Box mt="24px">
                {!reviewRateStatus ? (
                  <>
                    <Heading textAlign="center" size="18px">
                      {t('rate-comment')}
                    </Heading>
                    <Flex mt="24px" justifyContent="center" gridGap="3.5rem">
                      <Button
                        opacity={((reviewRateStatus !== 'dislike' && revisionContent?.hasBeenReviewed && revisionContent?.is_good) || reviewRateStatus === 'like') ? 1 : 0.5}
                        onClick={() => handleSelectReviewRate('like')}
                        variant="unstyled"
                        height="auto"
                        gridGap="10px"
                        aria-label="Mark as Useful"
                        _hover={{
                          opacity: 1,
                        }}
                      >
                        <Icon icon="feedback-like" width="54px" height="54px" />
                      </Button>
                      <Button
                        opacity={((reviewRateStatus !== 'like' && revisionContent?.hasBeenReviewed && revisionContent?.is_good === false) || reviewRateStatus === 'dislike') ? 1 : 0.5}
                        onClick={() => handleSelectReviewRate('dislike')}
                        variant="unstyled"
                        height="auto"
                        gridGap="10px"
                        aria-label="Mark as not useful"
                        _hover={{
                          opacity: 1,
                        }}
                      >
                        <Icon icon="feedback-dislike" width="54px" height="54px" />
                      </Button>
                    </Flex>
                  </>
                ) : (
                  <Box display={reviewRateData.submited ? 'none' : 'flex'} gap="16px">
                    <Box position="relative" width="100%">
                      <Textarea value={reviewRateData?.comment} aria-label="feedback input" fontSize="12px" onChange={onChangeRateComment} minHeight="130px" placeholder={t('start-review')} />
                      <Box position="absolute" bottom={1.5} right={3} color={reviewRateData.comment.length < 10 ? 'yellow.default' : 'currentColor'}>
                        {`${reviewRateData.comment.length}/ ${inputReviewRateCommentLimit}`}
                      </Box>
                    </Box>
                    <Flex flexDirection="column" gap="10px">
                      <Button variant="default" isLoading={reviewRateData.isSubmitting} isDisabled={reviewRateData.comment.length < 10} onClick={() => submitReviewRate('send')}>
                        <Icon icon="send" />
                      </Button>
                      <Button variant="link" isDisabled={reviewRateData.isSubmitting} onClick={() => handleSelectReviewRate(null)}>
                        <Icon width="12px" height="12px" icon="close" color="#EB5757" />
                      </Button>
                    </Flex>
                  </Box>
                )}
              </Box>
            </>
          )}
        </>
      ) : (
        <Flex alignItems="center" flexDirection="column" gridGap="8px">
          <Heading size="18px" color={hexColor.fontColor3}>
            {t('no-code-reviews')}
          </Heading>
          <Text size="14px" color={hexColor.fontColor3}>
            {t('task-notification')}
          </Text>
        </Flex>
      )}
    </Box>
  );
}

export default TaskCodeRevisions;
