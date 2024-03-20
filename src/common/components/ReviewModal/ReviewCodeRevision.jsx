import { Box, Button, Divider, Flex, Textarea } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../Heading';
import useStyle from '../../hooks/useStyle';
import bc from '../../services/breathecode';
import Icon from '../Icon';
import Text from '../Text';
import MarkDownParser from '../MarkDownParser';

const inputReviewRateCommentLimit = 100;
const defaultReviewRateData = {
  status: null,
  comment: '',
  isSubmitting: false,
  submited: false,
  submitType: null,
  revision_rating: null,
};
function ReviewCodeRevision({ contextData, setContextData, stages, setStage }) {
  const { fontColor, borderColor, lightColor, hexColor, featuredLight } = useStyle();
  const [reviewRateData, setReviewRateData] = useState(defaultReviewRateData);
  const { t } = useTranslation('assignments');

  const reviewRateStatus = reviewRateData?.status;
  const data = contextData?.commitFiles || {};
  const codeRevisions = contextData?.code_revisions || [];
  const revisionContent = contextData?.revision_content;
  const hasRevision = revisionContent !== undefined;
  const resetView = () => {
    setReviewRateData({
      status: null,
      comment: '',
      isSubmitting: false,
      submited: false,
      submitType: null,
    });
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
  const selectCodeRevision = (revision, resetReviewRate = true) => {
    const content = revision?.original_code;
    const fileContent = data?.fileList?.length > 0
      ? data?.fileList.find((l) => l.id === revision?.file?.id)
      : {};
    const decodedReviewCodeContent = atob(content);
    if (resetReviewRate) {
      setReviewRateData(defaultReviewRateData);
    }
    setContextData((prevState) => ({
      ...prevState,
      commitFile: {
        ...fileContent,
        task: data?.task || {},
        code: fileContent?.content,
      },
      revision_content: {
        path: revision?.file?.name,
        ...revision,
        task: data?.task || {},
        code: decodedReviewCodeContent,
      },
    }));
  };

  useEffect(() => {
    if (codeRevisions?.length > 0 && !revisionContent?.id) {
      const firstCodeRevision = codeRevisions?.[0] || {};
      const hasBeenReviewed = firstCodeRevision?.revision_rating > 0 || firstCodeRevision?.revision_rating !== null;
      selectCodeRevision({
        ...firstCodeRevision,
        revision_rating: firstCodeRevision?.revision_rating,
        hasBeenReviewed,
      });
    }
  }, [codeRevisions, revisionContent]);

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
    bc.assignments().rateCodeRevision(revisionContent?.id, argsData[type])
      .then(({ data: respData }) => {
        setReviewRateData((prev) => ({ ...prev, submited: true }));
        const updatedRevisionContent = {
          ...respData,
          is_good: typeof respData?.is_good === 'string' ? respData?.is_good === 'True' : respData?.is_good,
          hasBeenReviewed: true,
        };
        const updateCodeRevisions = contextData.code_revisions.map((revision) => {
          if (revision.id === revisionContent.id) {
            return updatedRevisionContent;
          }
          return revision;
        });
        selectCodeRevision(updatedRevisionContent, false);
        setContextData((prevState) => ({
          ...prevState,
          code_revisions: updateCodeRevisions,
        }));
      })
      .finally(() => {
        setReviewRateData((prev) => ({ ...prev, isSubmitting: false }));
      });
  };

  return (
    <Flex flexDirection="row" height="30rem" justifyContent="center" gridGap="6px" width="100%" maxHeight={reviewRateStatus ? 'auto' : '30rem'}>
      {codeRevisions?.length > 0 ? (
        <>
          <Box width="100%" flex={0.65}>
            <Flex mb="15px" gridGap="2px" flexDirection="column">
              <Heading size="18px" color={lightColor} fontWeight={400}>
                {t('code-review.select-file-to-review')}
              </Heading>
              <Heading size="18px" fontWeight={700}>
                {data?.task?.title}
              </Heading>
            </Flex>
            <Flex my="10px" py="10px" px="10px" borderRadius="10px" background={featuredLight}>
              <Box fontSize="12px" flex={0.33}>{t('code-review.filename')}</Box>
              <Box fontSize="12px" flex={0.33} textAlign="center">{t('code-review.feedback-status')}</Box>
            </Flex>
            <Flex overflow="auto" height="24rem" py="0.5rem" flexDirection="column" gridGap="12px">
              {codeRevisions?.length > 0 && codeRevisions.map((commit) => {
                const isSelected = revisionContent?.id === commit?.id;
                const hasBeenReviewed = typeof commit?.is_good === 'boolean';
                const dataStruct = {
                  ...commit,
                  revision_rating: commit?.revision_rating,
                  hasBeenReviewed,
                };
                return (
                  <Flex cursor="pointer" onClick={() => selectCodeRevision(dataStruct)} _hover={{ background: featuredLight }} border="1px solid" borderColor={isSelected ? 'blue.default' : borderColor} justifyContent="space-between" alignItems="center" height="48px" padding="4px 8px" borderRadius="8px">
                    <Flex flex={0.3} gridGap="10px">
                      <Icon icon="file2" width="22px" height="22px" display="flex" alignItems="center" color={fontColor} />
                      <Flex flexDirection="column" justifyContent="center" gridGap="9px" maxWidth="102px">
                        <Flex flexDirection="column" gridGap="0px">
                          <Text fontSize="12px" fontWeight={700} style={{ textWrap: 'nowrap' }}>
                            {commit?.file?.name}
                          </Text>
                          <Text fontSize="12px" fontWeight={400} title={commit?.file?.commit_hash}>
                            {`${commit?.file?.commit_hash.slice(0, 10)}...`}
                          </Text>
                        </Flex>
                        {commit?.committer?.github_username && (
                          <Box fontSize="12px">
                            {commit?.committer?.github_username}
                          </Box>
                        )}
                      </Flex>
                    </Flex>

                    <Flex flex={0.3} justifyContent="center" alignItems="center">
                      <Flex width="auto" position="relative" justifyContent="center">
                        <Box position="absolute" top={-1.5} right={-2} background={hasBeenReviewed ? 'success' : 'yellow.default'} fontSize="10px" padding="3px" fontWeight={700} height="auto" borderRadius="50%">
                          <Icon icon={hasBeenReviewed ? 'verified2' : 'asterisk'} width="8px" height="8px" />
                        </Box>
                        <Icon icon="code-comment" width="20px" height="20px" color={hexColor.black} />
                      </Flex>
                    </Flex>
                    <Button
                      variant="link"
                      flex={0.3}
                      height="40px"
                      onClick={() => selectCodeRevision(dataStruct)}
                      display="flex"
                      width="fit-content"
                      justifyContent="flex-end"
                      alignItems="center"
                      padding="0 1rem 0 0"
                      gridGap="10px"
                    >
                      {t('code-review.review')}
                    </Button>
                  </Flex>
                );
              })}
            </Flex>
          </Box>
          {revisionContent?.id && (
            <Flex flexDirection="column" overflow="auto" gridGap="12px" flex={0.35} width="100%" padding="8px" mt={!hasRevision && '3.4rem'}>
              <Box fontSize="14px" fontWeight={700} letterSpacing="0.08em">
                {revisionContent?.file?.name}
              </Box>
              <Divider />

              {hasRevision && !reviewRateData.submited && (
                <Flex flexDirection="column" gridGap="16px">
                  {reviewRateStatus === null ? (
                    <>
                      <Flex flexDirection="column" gridGap="8px">
                        <Heading fontSize="12px" fontWeight={700}>
                          {t('code-review.person-has-commented', { name: revisionContent?.reviewer?.name })}
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
                      <Button isDisabled={!contextData.commitFile?.id} onClick={() => setStage(stages.code_review)} color={!contextData.commitFile?.id && 'white'} variant="link" fontSize="17px" gridGap="15px">
                        {contextData.commitFile?.id && (
                          <Icon icon="longArrowRight" width="20px" height="20px" color={hexColor.blueDefault} />
                        )}
                        {contextData.commitFile?.id ? t('code-review.go-to-review') : 'No commit file found'}
                      </Button>
                      <Divider mt="-8px" />
                    </>
                  ) : (
                    <>
                      <Text size="14px" mb="-6px">
                        {t('code-review.write-comment')}
                      </Text>

                      <Box position="relative">
                        <Textarea value={reviewRateData?.comment} aria-label="feedback input" fontSize="12px" onChange={onChangeRateComment} minHeight="130px" placeholder={t('code-review.start-review-here')} />
                        <Box position="absolute" bottom={1.5} right={3} color={reviewRateData.comment.length < 10 ? 'yellow.default' : 'currentColor'}>
                          {`${reviewRateData.comment.length}/ ${inputReviewRateCommentLimit}`}
                        </Box>
                      </Box>
                      <Flex gridGap="9px" mt="0.7rem">
                        <Button flex={0.7} variant="default" isLoading={reviewRateData.isSubmitting && reviewRateData.submitType === 'send'} gridGap="10px" isDisabled={reviewRateData.comment.length < 10} onClick={() => submitReviewRate('send')} fontSize="13px" fontWeight={700} textTransform="uppercase" width="100%" height="48px">
                          <Text>
                            {t('code-review.send')}
                          </Text>
                        </Button>
                        <Button flex={0.3} variant="outline" isLoading={reviewRateData.isSubmitting && reviewRateData.submitType === 'skip'} borderColor="blue.default" gridGap="10px" onClick={() => submitReviewRate('skip')} fontSize="13px" fontWeight={700} textTransform="uppercase" width="100%" height="48px">
                          <Text color="blue.default">
                            {t('code-review.skip')}
                          </Text>
                        </Button>
                      </Flex>
                    </>
                  )}
                  <Flex flexDirection="column" gridGap="24px">
                    {reviewRateStatus && <Divider margin="18px 0 -8px 0" />}
                    <Box fontSize="14px" textAlign="center">
                      {(reviewRateStatus === null && !revisionContent?.hasBeenReviewed) && t('code-review.rate-comment')}
                      {(reviewRateStatus === 'like' || (reviewRateStatus === null && revisionContent?.is_good)) && t('code-review.you-liked-this-comment')}
                      {(reviewRateStatus === 'dislike' || (reviewRateStatus === null && !revisionContent?.is_good)) && t('code-review.you-disliked-this-comment')}
                    </Box>
                    <Flex justifyContent="center" gridGap="3.5rem">
                      <Button
                        opacity={((reviewRateStatus !== 'dislike' && revisionContent?.hasBeenReviewed && revisionContent?.is_good) || reviewRateStatus === 'like') ? 1 : 0.5}
                        onClick={() => handleSelectReviewRate('like')}
                        variant="unstyled"
                        height="auto"
                        gridGap="10px"
                        aria-label="Mark as Useful"
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
                      >
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
                      {t('code-review.comment-was-sent-successfully')}
                    </Text>
                  </Flex>
                  {reviewRateData?.comment.length > 0 && reviewRateData?.submitType === 'send' && (
                    <Box position="relative">
                      <Textarea readOnly opacity={0.7} value={reviewRateData?.comment} aria-label="feedback input" fontSize="12px" onChange={onChangeRateComment} minHeight="130px" placeholder="" />
                    </Box>
                  )}
                  <Button variant="outline" borderColor="blue.default" color="blue.default" onClick={goBack} fontSize="17px" gridGap="15px">
                    {t('code-review.back-to-comments')}
                  </Button>
                </Flex>
              )}
            </Flex>
          )}
        </>
      ) : (
        <Flex alignItems="center" flexDirection="column" my="4rem" gridGap="0.7rem">
          <Heading size="xsm">
            {t('code-review.no-files-to-review')}
          </Heading>
          <Text size="14px">
            {t('code-review.teacher-has-not-reviewed-files')}
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
