import { Box, Button, Divider, Flex, Link, Textarea, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import Text from '../Text';
import Icon from '../Icon';
import bc from '../../services/breathecode';
import useStyle from '../../hooks/useStyle';
import '@uiw/react-markdown-editor/markdown-editor.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@uiw/react-markdown-preview/markdown.css';
import Heading from '../Heading';
import MarkDownParser from '../MarkDownParser';
import tomorrow from '../MarkDownParser/syntaxHighlighter/tomorrow';
import { reportDatalayer } from '../../../utils/requests';
import { getBrowserInfo } from '../../../utils';
import useAuth from '../../hooks/useAuth';

const views = {
  initial: 'initial',
  started_revision: 'started_revision',
  success: 'success',
};
const inputReviewRateCommentLimit = 100;

function CodeReview({ isExternal, onClose, disableRate, isStudent, handleResetFlow, contextData, setContextData, setStage, selectedText, handleSelectedText }) {
  const { t } = useTranslation('assignments');
  const [repoData, setRepoData] = useState({});
  const { user } = useAuth();
  const [view, setView] = useState(views.initial);
  const [isLoading, setIsLoading] = useState(false);
  const [codeReview, setCodeReview] = useState({
    code: '',
    comment: '',
    isSubmitting: false,
  });
  const toast = useToast();
  const { hexColor } = useStyle();
  const [reviewRateData, setReviewRateData] = useState({
    status: null,
    comment: '',
    isSubmitting: false,
    submited: false,
    submitType: null,
  });
  const inputLimit = 380;
  const commitData = contextData?.commitFile;
  const revisionContent = contextData?.revision_content;
  const hasRevision = revisionContent !== undefined;
  const reviewRateStatus = reviewRateData?.status;
  const myRevisions = contextData?.my_revisions || [];
  const codeRevisions = contextData?.code_revisions || [];
  const translation = contextData?.translation || {};
  const reviewerName = revisionContent?.reviewer?.name || revisionContent?.reviewer?.username;

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
    if (isStudent) {
      setStage('review_code_revision');
    }
  };
  const prepareCommitData = () => {
    try {
      const extensionLanguage = commitData?.path?.split('.').pop().replace(/\?.*$/, '');
      const codeRaw = commitData.code;
      // const codeRaw = extensionLanguage ? `\`\`\`${extensionLanguage}\n${commitData.code}\n\`\`\`` : commitData.code;
      setRepoData({
        raw: codeRaw,
        extensionLanguage,
        pathname: commitData?.path,
        url: commitData?.html_url,
        error: false,
      });
    } catch (error) {
      console.error(error);
      setRepoData({
        msg: 'No content found',
        error: true,
      });
    }
  };

  useEffect(() => {
    prepareCommitData();
  }, [commitData]);

  const handleKeyUp = () => {
    if (view === views.initial) {
      handleSelectedText();
    }
  };

  useEffect(() => {
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startCodeReview = () => {
    // Remove invalid characters in UTF-8
    const value = selectedText.replace(/[^\t\n\r\x20-\x7E\x80-\xBF\xC0-\xFD\xFE\xFF]/g, '');
    const encodedText = btoa(value);
    setCodeReview({
      code: encodedText,
      comment: '',
    });
    setView(views.started_revision);
  };

  const onChangeCodeReview = (e) => {
    if (e.target.value.length <= inputLimit) {
      setCodeReview((prev) => ({
        ...prev,
        comment: e.target.value,
      }));
    }
  };
  const submitCodeReview = () => {
    setIsLoading(true);
    reportDatalayer({
      dataLayer: {
        event: 'submit_code_review',
        user_id: user?.id,
        repository: commitData?.repository,
        comment: codeReview.comment,
        user_reviewed: {
          id: commitData?.committer?.id,
          username: commitData?.committer?.github_username,
          commitfile_id: commitData?.id,
        },
        agent: getBrowserInfo(),
      },
    });
    setCodeReview((prev) => ({
      ...prev,
      isSubmitting: true,
    }));
    if (codeReview.comment.length >= 10) {
      bc.assignments().createCodeRevision(commitData.task.id, {
        commitfile_id: commitData?.id,
        content_for_review: codeReview.code,
        comments: codeReview.comment,
        github_username: commitData?.committer?.github_username,
      })
        .then((resp) => {
          if (resp.data.comment?.length > 0) {
            setContextData((prev) => ({
              ...prev,
              code_revisions: [...prev.code_revisions, resp.data],
              my_revisions: [...prev.my_revisions, resp.data],
            }));
            setView(views.success);
          }
        })
        .catch((error) => {
          toast({
            title: t('alert-message:error-creating-code-review'),
            description: error?.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        })
        .finally(() => {
          setCodeReview((prev) => ({
            ...prev,
            isSubmitting: false,
          }));
        });
    }
  };
  const goBack = () => {
    if (isExternal && reviewRateData.submited) {
      onClose();
    } else {
      if (isStudent && reviewRateData.submited) {
        resetView();
      }
      if (isStudent && reviewRateData.status !== null) {
        setReviewRateData((prev) => ({ ...prev, status: null, comment: '' }));
      }
      if (reviewRateData.status === null) {
        if (view === views.started_revision) {
          setView(views.initial);
        }
        if (view !== views.started_revision) {
          if (isStudent) {
            setStage('review_code_revision');
          } else {
            setStage('file_list');
          }
          setCodeReview({
            code: '',
            comments: '',
          });
          handleResetFlow();
        }
      }
    }
  };
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
    reportDatalayer({
      dataLayer: {
        event: 'feedback_student_reaction',
        feedback_id: revisionContent?.id,
        reaction: reviewRateData?.status,
        reaction_comment: type === 'skip' ? '' : reviewRateData?.comment,
        repository: revisionContent?.repository,
        user_id: user.id,
        agent: getBrowserInfo(),
      },
    });
    bc.assignments().rateCodeRevision(revisionContent?.id, argsData[type])
      .then(({ data: respData }) => {
        setReviewRateData((prev) => ({ ...prev, submited: true }));
        const updatedRevisionContent = {
          ...respData,
          is_good: typeof respData?.is_good === 'string' ? respData?.is_good === 'True' : respData?.is_good,
          hasBeenReviewed: true,
        };
        const updateCodeRevisions = codeRevisions.map((revision) => {
          if (revision.id === revisionContent.id) {
            return updatedRevisionContent;
          }
          return revision;
        });
        setContextData((prevState) => ({
          ...prevState,
          code_revisions: updateCodeRevisions,
        }));
      })
      .finally(() => {
        setReviewRateData((prev) => ({ ...prev, isSubmitting: false }));
      });
  };

  console.log(selectedText);

  return (
    <>
      <Box flex={0.6} maxHeight="76vh" overflow="auto" onMouseUp={(isStudent || view !== views.initial) ? () => { } : handleSelectedText}>
        {!repoData?.raw
          ? 'Loading...' : (
            <SyntaxHighlighter
              language={repoData.extensionLanguage}
              style={tomorrow}
              customStyle={{
                margin: 0,
                padding: '16px',
                background: 'rgb(45, 45, 45)',
                border: 'none',
                height: '100%',
                minWidth: '100%',
              }}
              showLineNumbers={false}
              wrapLines
            >
              {repoData.raw}
            </SyntaxHighlighter>
          )}
      </Box>
      <Box>
        <Divider orientation="vertical" />
      </Box>

      <Box maxWidth={isStudent ? '455px' : ''} maxHeight="76vh" overflow="auto" flex={isStudent ? 0.5 : 0.4}>
        {view === views.success ? (
          <Flex flexDirection="column" height="100%" alignItems="center" justifyContent="center" gridGap="24px">
            <Text size="26px" fontWeight={700} textAlign="center" lineHeight="34px">
              {t('code-review.code-review-successfully-sent')}
            </Text>
            <Text size="18px">
              {t('code-review.submited-assignments-count', { count: myRevisions?.length })}
            </Text>
            <Button variant="default" gridGap="10px" mt="10px" onClick={goBack} fontSize="13px" fontWeight={700} textTransform="uppercase" width="100%" height="48px">
              <Icon icon="code-comment" size="23px" color="#fff" />
              <Text>
                {t('code-review.start-other-code-review')}
              </Text>
            </Button>
          </Flex>
        ) : (
          <>
            {view === views.initial && !reviewRateData.submited && reviewRateStatus !== null && (
              <Box mb="1rem">
                <Icon
                  aria-label="Go back"
                  icon="arrowLeft"
                  width="24px"
                  height="16px"
                  color={hexColor.black}
                  onClick={goBack}
                  cursor="pointer"
                />
              </Box>
            )}
            <Heading size="sm" mb={isStudent ? '3rem' : '24px'} textAlign={isStudent && 'center'}>
              {isStudent
                ? (t('code-review.teacher-has-reviewed-your-code', { name: reviewerName }))
                : t('code-review.code-review')}
            </Heading>
            <Box padding="9px 0" borderRadius="8px" overflow="auto">
              {!isStudent && (
                <Text fontSize="14px" fontWeight={700} mb="8px">
                  {t('code-review.reviewing')}
                </Text>
              )}
              {!isStudent && (
                <Flex gridGap="10px" alignItems="center" mb="24px">
                  <Icon aria-label="Go back" icon="arrowLeft" width="17px" height="11px" color={hexColor.black} onClick={goBack} cursor="pointer" />
                  <Flex alignItems="center" width="100%" gridGap="9px" padding="9px 8px" border="1px solid" borderColor={hexColor.borderColor} borderRadius="8px">
                    <Icon icon="folder" width="14px" height="14px" color={hexColor.black} />
                    <Box minInlineSize="max-content">
                      {repoData.pathname}
                    </Box>
                  </Flex>
                </Flex>
              )}
              {view === views.initial && !isStudent && (
                <>
                  <Flex gridGap="15px" alignItems="start">
                    {selectedText?.length > 0 ? (
                      <Text size="14px">
                        {t('code-review.selection-code-text')}
                      </Text>
                    ) : (
                      <>
                        <Icon icon="code-comment" size="23px" color={hexColor.blueDefault} mt="5px" />
                        <Text size="18px">
                          {t('code-review.use-your-mouse-to-select-code')}
                        </Text>
                      </>
                    )}
                  </Flex>

                  {selectedText?.length > 0 && (
                    <Box fontSize="13px" color="#fff" mt="2rem" padding="6px 16px" borderRadius="6px" whiteSpace="pre-wrap" overflow="auto" background="rgb(45, 45, 45)" mb="24px">
                      <Text fontSize="18px" color="#fff" fontWeight={700} mb="14px">
                        {t('code-review.you-selected-the-code')}
                      </Text>
                      <SyntaxHighlighter
                        language={commitData?.language || repoData.extensionLanguage}
                        style={tomorrow}
                        customStyle={{
                          padding: '16px',
                          background: 'rgb(45, 45, 45)',
                          border: 'none',
                        }}
                        codeTagProps={{ className: '' }}
                        PreTag="div"
                      >
                        {selectedText.replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </Box>
                  )}

                  {selectedText.length > 0 && (
                    <Button variant="default" gridGap="10px" onClick={startCodeReview} fontSize="13px" fontWeight={700} textTransform="uppercase" width="100%" height="48px">
                      <Icon icon="code-comment" size="23px" color="#fff" />
                      <Text>
                        {t('code-review.start-code-review')}
                      </Text>
                    </Button>
                  )}
                </>
              )}
              {view === views.initial && isStudent && !reviewRateData.submited && (
                <Flex flexDirection="column" gridGap="16px">
                  {reviewRateStatus === null ? (
                    <>
                      <MarkDownParser content={revisionContent?.comment} />

                      <Box fontSize="13px" color="#fff" padding="6px 16px" borderRadius="6px" whiteSpace="pre-wrap" overflow="auto" background="rgb(45, 45, 45)">
                        <SyntaxHighlighter
                          language={revisionContent?.language || repoData.extensionLanguage}
                          style={tomorrow}
                          customStyle={{
                            padding: '16px',
                            background: 'rgb(45, 45, 45)',
                            border: 'none',
                          }}
                          codeTagProps={{ className: '' }}
                          PreTag="div"
                        >
                          {revisionContent?.code?.replace(/```+$/, '')}
                        </SyntaxHighlighter>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Text size="14px" mb="-6px">
                        {t('code-review.write-comment')}
                      </Text>

                      <Box position="relative">
                        <Textarea value={reviewRateData?.comment} aria-label="feedback input" fontSize="14px" onChange={onChangeRateComment} minHeight="130px" placeholder="Start you review here..." />
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
                  {!disableRate && (
                    <Flex flexDirection="column" gridGap="24px" mt="2rem">
                      {!revisionContent?.hasBeenReviewed && (
                        <>
                          {reviewRateStatus
                            ? <Divider margin="18px 0 -8px 0" />
                            : (
                              <Box fontSize="18px" textAlign="center">
                                {t('code-review.did-feedback-useful')}
                              </Box>
                            )}
                        </>
                      )}
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
                          _hover={{
                            opacity: 1,
                          }}
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
                          _hover={{
                            opacity: 1,
                          }}
                          height="auto"
                          gridGap="10px"
                          aria-label="Mark as not useful"
                        >
                          <Icon icon="feedback-dislike" width="54px" height="54px" />
                        </Button>
                      </Flex>
                    </Flex>
                  )}
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
                    {isExternal ? (translation?.common?.close || t('common:close')) : t('code-review.back-to-comments')}
                  </Button>
                </Flex>
              )}
              {view === views.started_revision && (
                <Flex flexDirection="column" gridGap="24px">
                  <Text size="14px">
                    {t('code-review.code-review-started-msg')}
                    {' '}
                    <Link variant="default" href="/" fontSize="14px" target="_blank" rel="noopener noreferer">{t('code-review.here')}</Link>
                    .
                  </Text>

                  <Box position="relative">
                    <Text fontSize="14px" fontWeight={700} mb="18px">
                      {t('code-review.write-feedback-msg')}
                    </Text>
                    <Textarea value={codeReview.comment} aria-label="feedback input" fontSize="12px" onChange={onChangeCodeReview} minHeight="134" placeholder="Start you review here..." />
                    <Box position="absolute" bottom={1.5} right={3} color={codeReview.comment.length < 10 ? '#EB5757' : 'currentColor'}>
                      {`${codeReview.comment.length}/ ${inputLimit}`}
                    </Box>
                  </Box>

                  <Button variant="default" isLoading={isLoading} gridGap="10px" isDisabled={codeReview.comment.length < 10} onClick={submitCodeReview} fontSize="13px" fontWeight={700} textTransform="uppercase" width="100%" height="48px">
                    <Icon icon="code-comment" size="23px" color={codeReview.comment.length < 10 ? '#606060' : '#fff'} />
                    <Text>
                      {t('code-review.submit-code-review')}
                    </Text>
                  </Button>
                </Flex>
              )}
            </Box>
          </>
        )}
      </Box>
    </>
  );
}

CodeReview.propTypes = {
  setStage: PropTypes.func.isRequired,
  selectedText: PropTypes.string,
  handleSelectedText: PropTypes.func,
  contextData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  setContextData: PropTypes.func.isRequired,
  handleResetFlow: PropTypes.func.isRequired,
  isStudent: PropTypes.bool,
  disableRate: PropTypes.bool,
  isExternal: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};
CodeReview.defaultProps = {
  selectedText: '',
  handleSelectedText: () => { },
  isStudent: false,
  disableRate: false,
  isExternal: false,
};

export default CodeReview;
