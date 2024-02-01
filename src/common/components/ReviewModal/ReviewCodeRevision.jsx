import { Box, Button, Divider, Flex, Textarea } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Heading from '../Heading';
import useStyle from '../../hooks/useStyle';
import Icon from '../Icon';
import Text from '../Text';
import MarkDownParser from '../MarkDownParser';

const inputReviewRateCommentLimit = 100;
// eslint-disable-next-line no-unused-vars
function ReviewCodeRevision({ contextData, setContextData, stages, setStage }) {
  const { fontColor, borderColor, lightColor, hexColor, featuredLight } = useStyle();
  const [isSidebarFeedbackOpen, setIsSidebarFeedbackOpen] = useState(false);
  const [reviewsOfCommitFile, setReviewsOfCommitFile] = useState(null);
  const [reviewRateData, setReviewRateData] = useState({
    status: null,
    comment: '',
    isSubmitting: false,
    submited: false,
    submitType: null,
  });

  const reviewRateStatus = reviewRateData?.status;
  // const [loaders, setLoaders] = useState({
  //   isOpeningReviewsOfFile: false,
  // });
  const data = contextData?.commitfiles || {};
  const fileList = data?.fileList || [];
  const revisionContent = contextData?.revision_content;
  const hasRevision = revisionContent !== undefined;
  // const proceedToCommitFeedback = (commitData, fileData) => {
  //   const content = fileData?.content || commitData?.content;

  //   const decodedContent = atob(content);
  //   setContextData((prevState) => ({
  //     ...prevState,
  //     commitFile: {
  //       path: commitData?.name,
  //       ...commitData,
  //       ...fileData,
  //       task: data?.task || {},
  //       code: decodedContent,
  //     },
  //   }));
  //   setIsSidebarFeedbackOpen(true);
  // };
  const resetView = () => {
    setReviewRateData({
      status: null,
      comment: '',
      isSubmitting: false,
      submited: false,
      submitType: null,
    });
    setContextData((prevState) => ({
      ...prevState,
      revision_content: undefined,
    }));
  };
  const goBack = () => {
    if (reviewRateData.submited) {
      resetView();
    }
    if (reviewRateData.status !== null) {
      setReviewRateData((prev) => ({ ...prev, status: null, comment: '' }));
    } else {
      setContextData((prevState) => ({
        ...prevState,
        revision_content: undefined,
      }));
    }
  };
  const selectRevisionsOfFile = (file) => {
    setContextData((prevState) => ({
      ...prevState,
      commitFile: {
        path: file?.name,
        ...file,
        task: data?.task || {},
        code: file.content,
      },
      revision_content: undefined,
    }));
    const revisionsRelated = contextData.code_revisions.filter((revision) => revision?.file?.id === file?.id);
    const sortedRevisions = revisionsRelated.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    setReviewsOfCommitFile(sortedRevisions);
  };

  const openReviewFile = (review) => {
    const content = review?.original_code;

    const decodedContent = atob(content);
    setContextData((prevState) => ({
      ...prevState,
      revision_content: {
        ...review,
        code: decodedContent,
      },
    }));
  };

  useEffect(() => {
    if (fileList.length > 0) {
      selectRevisionsOfFile(fileList[0]);
      setIsSidebarFeedbackOpen(true);
    }
  }, [fileList]);

  const handleSelectReviewRate = (status) => {
    setReviewRateData((prev) => ({ ...prev, status }));
  };
  const onChangeRateComment = (e) => {
    if (e.target.value.length <= inputReviewRateCommentLimit) {
      setReviewRateData((prev) => ({ ...prev, comment: e.target.value }));
    }
  };
  const submitReviewRate = (type) => {
    setReviewRateData((prev) => ({ ...prev, isSubmitting: true, submitType: type }));
    setTimeout(() => {
      setReviewRateData((prev) => ({ ...prev, submited: true, isSubmitting: false }));
    }, 1000);
  };

  return (
    <Flex flexDirection="row" gridGap="6px" width="100%" maxHeight={reviewRateStatus ? 'auto' : '30rem'}>
      {fileList?.length > 0 ? (
        <>
          <Box width="100%" flex={0.65}>
            <Flex mb="15px" gridGap="2px" flexDirection="column">
              <Heading size="18px" color={lightColor} fontWeight={400}>
                Select the file you want to review from:
              </Heading>
              <Heading size="18px" fontWeight={700}>
                {data?.task?.title}
              </Heading>
            </Flex>
            <Flex my="10px" py="10px" px="10px" borderRadius="10px" background={featuredLight}>
              <Box fontSize="12px" flex={0.33} textAlign="center">Name</Box>
              <Box fontSize="12px" flex={0.33} textAlign="center">Comment</Box>
              <Box fontSize="12px" flex={0.33} textAlign="center">Feedback status</Box>
            </Flex>
            <Flex flexDirection="column" gridGap="12px">
              {fileList.map((file) => {
                const revisionsRelated = contextData.code_revisions.filter((revision) => revision?.file?.id === file?.id);
                const isReviewed = revisionsRelated?.length > 0;
                const isSelected = contextData?.commitFile?.id === file?.id;
                return (
                  <Flex border="1px solid" borderColor={borderColor} background={isSelected ? featuredLight : ''} justifyContent="space-between" alignItems="center" height="48px" padding="4px 8px" borderRadius="8px">
                    <Flex flex={0.3} gridGap="10px">
                      <Icon icon="file2" width="22px" height="22px" display="flex" alignItems="center" color={fontColor} />
                      <Flex flexDirection="column" justifyContent="center" gridGap="9px" maxWidth="102px">
                        <Text fontSize="12px" fontWeight={700}>
                          {file?.name.includes('/') ? file.name : `./${file.name}`}
                        </Text>
                        {file?.committer?.github_username && (
                          <Box fontSize="12px">
                            {file?.committer?.github_username}
                          </Box>
                        )}
                      </Flex>
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
                      variant={isReviewed ? 'link' : 'default'}
                      flex={0.3}
                      height="40px"
                      onClick={() => {
                        selectRevisionsOfFile(file);
                        resetView();
                      }}
                      display="flex"
                      alignItems="center"
                      gridGap="10px"
                    >
                      {isReviewed ? '-> Reviewed' : '-> Not reviewed'}
                    </Button>
                  </Flex>
                );
              })}
            </Flex>
          </Box>
          {isSidebarFeedbackOpen && (
            <Flex flexDirection="column" overflow="auto" gridGap="12px" flex={0.35} width="100%" padding="8px" mt={!hasRevision && '3.4rem'}>
              {hasRevision && (
                <Button variant="link" onClick={goBack} mb="1.1rem" height="auto" fontSize="12px" gridGap="10px" justifyContent="flex-start">
                  <Icon icon="arrowLeft2" width="20px" height="8px" color={hexColor.blueDefault} />
                  Go back
                </Button>
              )}
              <Box fontSize="14px" fontWeight={700} letterSpacing="0.08em">
                {`./${contextData.commitFile?.name}`}
              </Box>
              <Divider />
              {!hasRevision && reviewsOfCommitFile.map((review) => (
                <Flex gridGap="10px" alignItems="center" cursor="pointer" onClick={() => openReviewFile(review)} border="1px solid" padding="5px 10px" borderRadius="7px" borderColor={featuredLight} _hover={{ background: featuredLight }}>
                  <Flex flexDirection="column" alignItems="center">
                    <Box fontSize="12px" letterSpacing="0.05em">
                      {new Date(review?.updated_at).toLocaleDateString()}
                    </Box>
                    <Box fontSize="12px" letterSpacing="0.05em">
                      {new Date(review?.updated_at).toLocaleTimeString()}
                    </Box>
                  </Flex>
                  <span>
                    &bull;
                  </span>
                  <Box fontSize="12px">
                    {review?.reviewer?.name}
                  </Box>
                  <span>
                    &bull;
                  </span>
                  <Box fontSize="12px" title={review?.comment}>
                    {review?.comment.length > 14 ? `${review?.comment.substring(0, 14)}...` : review?.comment}
                  </Box>
                </Flex>
              ))}
              {hasRevision && !reviewRateData.submited && (
                <Flex flexDirection="column" gridGap="16px">
                  {reviewRateStatus === null ? (
                    <>
                      <Flex flexDirection="column" gridGap="8px">
                        <Heading fontSize="12px" fontWeight={700}>
                          Comment:
                        </Heading>
                        <Text size="12px">
                          {revisionContent?.comment}
                        </Text>

                        <Box fontSize="13px" color="#fff" borderRadius="6px" whiteSpace="pre-wrap" overflow="auto">
                          <MarkDownParser
                            content={`\`\`\`${revisionContent?.file?.language || 'bash'}
${revisionContent?.code}
\`\`\``}
                          />
                        </Box>
                      </Flex>
                      <Button onClick={() => setStage(stages.code_review)} variant="link" fontSize="17px" gridGap="15px">
                        <Icon icon="longArrowRight" width="20px" height="20px" color={hexColor.blueDefault} />
                        Go to review
                      </Button>
                      <Divider mt="-8px" />
                    </>
                  ) : (
                    <>
                      <Text size="14px" mb="-6px">
                        Write comment
                      </Text>

                      <Box position="relative">
                        <Textarea value={reviewRateData?.comment} aria-label="feedback input" fontSize="12px" onChange={onChangeRateComment} minHeight="130px" placeholder="Start you review here..." />
                        <Box position="absolute" bottom={1.5} right={3} color={reviewRateData.comment.length < 10 ? 'yellow.default' : 'currentColor'}>
                          {`${reviewRateData.comment.length}/ ${inputReviewRateCommentLimit}`}
                        </Box>
                      </Box>
                      <Flex gridGap="9px" mt="0.7rem">
                        <Button flex={0.7} variant="default" isLoading={reviewRateData.isSubmitting && reviewRateData.submitType === 'send'} gridGap="10px" isDisabled={reviewRateData.comment.length < 10} onClick={() => submitReviewRate('send')} fontSize="13px" fontWeight={700} textTransform="uppercase" width="100%" height="48px">
                          <Text>
                            Send
                          </Text>
                        </Button>
                        <Button flex={0.3} variant="outline" isLoading={reviewRateData.isSubmitting && reviewRateData.submitType === 'skip'} borderColor="blue.default" gridGap="10px" onClick={() => submitReviewRate('skip')} fontSize="13px" fontWeight={700} textTransform="uppercase" width="100%" height="48px">
                          <Text color="blue.default">
                            Skip
                          </Text>
                        </Button>
                      </Flex>
                    </>
                  )}
                  <Flex flexDirection="column" gridGap="24px">
                    {reviewRateStatus && <Divider margin="18px 0 -8px 0" />}
                    <Box fontSize="14px" textAlign="center">
                      {reviewRateStatus === null && 'Rate this comment'}
                      {reviewRateStatus === 'like' && 'Youl liked this comment'}
                      {reviewRateStatus === 'dislike' && 'You disliked this comment'}
                    </Box>
                    <Flex justifyContent="center" gridGap="3.5rem">
                      <Button opacity={(reviewRateStatus === 'like' || reviewRateStatus === null) ? 1 : 0.5} onClick={() => handleSelectReviewRate('like')} variant="unstyled" height="auto" gridGap="10px" aria-label="Mark as Useful">
                        <Icon icon="feedback-like" width="54px" height="54px" />
                      </Button>
                      <Button opacity={(reviewRateStatus === 'dislike' || reviewRateStatus === null) ? 1 : 0.5} onClick={() => handleSelectReviewRate('dislike')} variant="unstyled" height="auto" gridGap="10px" aria-label="Mark as not useful">
                        <Icon icon="feedback-dislike" width="54px" height="54px" />
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              )}
              {hasRevision && reviewRateData.submited && (
                <Flex flexDirection="column" gridGap="16px">
                  <Flex flexDirection="column" gridGap="24px" borderRadius="3px" alignItems="center" background={reviewRateStatus === 'like' ? 'green.light' : 'red.light2'} padding="16px 8px">
                    <Icon icon={reviewRateStatus === 'like' ? 'feedback-like' : 'feedback-dislike'} width="60px" height="60px" />
                    <Text size="14px" fontWeight={700} textAlign="center" color="black">
                      Your comment was sent successfully.
                    </Text>
                  </Flex>
                  {reviewRateData?.comment.length > 0 && reviewRateData?.submitType === 'send' && (
                    <Box position="relative">
                      <Textarea readOnly opacity={0.7} value={reviewRateData?.comment} aria-label="feedback input" fontSize="12px" onChange={onChangeRateComment} minHeight="130px" placeholder="" />
                    </Box>
                  )}
                  <Button variant="outline" borderColor="blue.default" color="blue.default" onClick={goBack} fontSize="17px" gridGap="15px">
                    Back to comments
                  </Button>
                </Flex>
              )}
            </Flex>

          )}
        </>
      ) : (
        <Flex alignItems="center" flexDirection="column" mt="2rem" gridGap="0.7rem">
          <Heading size="xsm">
            No files to review
          </Heading>
          <Text size="14px">
            Your teacher has not reviewed any files yet. try again later.
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
ReviewCodeRevision.propTypes = {
  stages: PropTypes.shape({
    initial: PropTypes.string,
    file_list: PropTypes.string,
    code_review: PropTypes.string,
    review_code_revision: PropTypes.string,
  }),
  setStage: PropTypes.func,
  contextData: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  setContextData: PropTypes.func,
};
ReviewCodeRevision.defaultProps = {
  stages: {
    initial: 'initial',
    file_list: 'file_list',
    code_review: 'code_review',
    review_code_revision: 'review_code_revision',
  },
  setStage: () => {},
  setContextData: () => {},
};

export default ReviewCodeRevision;
