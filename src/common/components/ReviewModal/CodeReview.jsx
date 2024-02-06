import { Box, Button, Divider, Flex, Link, Textarea, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import Text from '../Text';
import Icon from '../Icon';
import bc from '../../services/breathecode';
import useStyle from '../../hooks/useStyle';
import '@uiw/react-markdown-editor/markdown-editor.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@uiw/react-markdown-preview/markdown.css';
import Heading from '../Heading';
import MarkDownParser from '../MarkDownParser';

const MarkdownEditor = dynamic(
  () => import('@uiw/react-markdown-editor').then((mod) => mod.default),
  { ssr: false },
);

const views = {
  initial: 'initial',
  started_revision: 'started_revision',
  success: 'success',
};
const inputReviewRateCommentLimit = 100;

function CodeReview({ isStudent, handleResetFlow, contextData, setContextData, setStage, selectedText, handleSelectedText }) {
  const [repoData, setRepoData] = useState({});
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
  }, []);

  const handleKeyUp = () => {
    handleSelectedText();
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
            title: 'Something went wrong creating the code review',
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
    setTimeout(() => {
      setReviewRateData((prev) => ({ ...prev, submited: true, isSubmitting: false }));
    }, 1000);
  };

  return (
    <>
      <Box flex={0.6} maxHeight="76vh" overflow="auto" onMouseUp={isStudent ? () => {} : handleSelectedText}>
        {!repoData?.raw
          ? 'Loading...' : (
            <MarkdownEditor
              className="hide-preview"
              readOnly={isStudent}
              value={repoData.raw}
              style={{ height: 'auto', minWidth: '100%' }}
              visible={false}
              enableScroll
              renderPreview={() => null}
              hideToolbar
              toolbars={[]}
            />
          )}
      </Box>
      <Box>
        <Divider orientation="vertical" />
      </Box>

      <Box maxWidth={isStudent ? '455px' : '26.22rem'} maxHeight="76vh" overflow="auto" flex={isStudent ? 0.5 : 0.4}>
        {view === views.success ? (
          <Flex flexDirection="column" height="100%" alignItems="center" justifyContent="center" gridGap="24px">
            <Text size="26px" fontWeight={700} textAlign="center" lineHeight="34px">
              The code review was sent successfully.
            </Text>
            <Text size="18px">
              {`You have submitted ${myRevisions.length} code reviews`}
            </Text>
            <Button variant="default" gridGap="10px" mt="10px" onClick={goBack} fontSize="13px" fontWeight={700} textTransform="uppercase" width="100%" height="48px">
              <Icon icon="code-comment" size="23px" color="#fff" />
              <Text>
                Start other code review
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
                ? `${revisionContent?.reviewer?.name} has reviewed your code and provided the following feedback:`
                : 'Code Review'}
            </Heading>
            <Box padding="9px 0" borderRadius="8px" overflow="auto">
              {!isStudent && (
                <Text fontSize="14px" fontWeight={700} mb="8px">
                  Reviewing
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
                        You have made your selection, please confirm to start your code review by clicking on the following button. Otherwise select another piece of the code.
                        You&apos;ve selected the code:
                      </Text>
                    ) : (
                      <>
                        <Icon icon="code-comment" size="23px" color={hexColor.blueDefault} mt="5px" />
                        <Text size="18px">
                          Use your mouse to select the part of the code you want to give feedback about.
                        </Text>
                      </>
                    )}
                  </Flex>

                  {selectedText.length > 0 && (
                    <Box fontSize="13px" color="#fff" mt="2rem" padding="6px 16px" borderRadius="6px" whiteSpace="pre-wrap" overflow="auto" background="rgb(45, 45, 45)" mb="24px">
                      <Text fontSize="18px" color="#fff" fontWeight={700} mb="14px">
                        You&apos;ve selected the following code:
                      </Text>
                      <pre>
                        <code className="language-bash">
                          {selectedText}
                        </code>
                      </pre>
                    </Box>
                  )}

                  {selectedText.length > 0 && (
                    <Button variant="default" gridGap="10px" onClick={startCodeReview} fontSize="13px" fontWeight={700} textTransform="uppercase" width="100%" height="48px">
                      <Icon icon="code-comment" size="23px" color="#fff" />
                      <Text>
                        Start Code Review
                      </Text>
                    </Button>
                  )}
                </>
              )}
              {view === views.initial && isStudent && !reviewRateData.submited && (
                <Flex flexDirection="column" gridGap="16px">
                  {reviewRateStatus === null ? (
                    <>
                      <Text size="14px">
                        {revisionContent?.comment}
                      </Text>

                      <Box fontSize="13px" color="#fff" padding="6px 16px" borderRadius="6px" whiteSpace="pre-wrap" overflow="auto" background="rgb(45, 45, 45)">
                        <MarkDownParser
                          content={`\`\`\`${revisionContent?.file?.language}
${revisionContent?.code}
\`\`\``}
                        />
                      </Box>
                    </>
                  ) : (
                    <>
                      <Text size="14px" mb="-6px">
                        Write comment
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

                  <Flex flexDirection="column" gridGap="24px" mt="2rem">
                    {reviewRateStatus
                      ? <Divider margin="18px 0 -8px 0" />
                      : (
                        <Box fontSize="18px" textAlign="center">
                          Did you find this feedback useful?
                        </Box>
                      )}
                    <Box fontSize="14px" textAlign="center">
                      {(reviewRateStatus === null && !revisionContent?.hasBeenReviewed) && 'Rate this comment'}
                      {(reviewRateStatus === 'like' || (reviewRateStatus === null && revisionContent?.is_good)) && 'Youl liked this comment'}
                      {(reviewRateStatus === 'dislike' || (reviewRateStatus === null && !revisionContent?.is_good)) && 'You disliked this comment'}
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
              {view === views.started_revision && (
                <Flex flexDirection="column" gridGap="24px">
                  <Text size="14px">
                    Code review has stared: Please give some feedback about the code based on the coding guidelines. You can read more about the guidelines
                    {' '}
                    <Link variant="default" href="/" fontSize="14px" target="_blank" rel="noopener noreferer">here</Link>
                    .
                  </Text>

                  <Box position="relative">
                    <Text fontSize="14px" fontWeight={700} mb="18px">
                      Write a well understandable review
                    </Text>
                    <Textarea value={codeReview.comment} aria-label="feedback input" fontSize="12px" onChange={onChangeCodeReview} minHeight="134" placeholder="Start you review here..." />
                    <Box position="absolute" bottom={1.5} right={3} color={codeReview.comment.length < 10 ? '#EB5757' : 'currentColor'}>
                      {`${codeReview.comment.length}/ ${inputLimit}`}
                    </Box>
                  </Box>

                  <Button variant="default" isLoading={isLoading} gridGap="10px" isDisabled={codeReview.comment.length < 10} onClick={submitCodeReview} fontSize="13px" fontWeight={700} textTransform="uppercase" width="100%" height="48px">
                    <Icon icon="code-comment" size="23px" color={codeReview.comment.length < 10 ? '#606060' : '#fff'} />
                    <Text>
                      Submit Code Review
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
};
CodeReview.defaultProps = {
  selectedText: '',
  handleSelectedText: () => {},
  isStudent: false,
};

export default CodeReview;
