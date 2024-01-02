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

const MarkdownEditor = dynamic(
  () => import('@uiw/react-markdown-editor').then((mod) => mod.default),
  { ssr: false },
);

const views = {
  initial: 'initial',
  started_revision: 'started_revision',
  success: 'success',
};
function CodeReview({ commitData, setStage, selectedText, handleSelectedText }) {
  const [repoData, setRepoData] = useState({});
  const [view, setView] = useState(views.initial);
  const [codeReview, setCodeReview] = useState({
    code: '',
    comment: '',
    isSubmitting: false,
  });
  const toast = useToast();
  const { hexColor } = useStyle();
  const inputLimit = 380;

  const prepareCommitData = () => {
    try {
      const extensionLanguage = commitData?.path?.split('.').pop().replace(/\?.*$/, '');
      const codeRaw = `\`\`\`${extensionLanguage}\n${commitData.code}\n\`\`\``;
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
    const encodedText = btoa(selectedText);
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
    setCodeReview((prev) => ({
      ...prev,
      isSubmitting: true,
    }));
    if (codeReview.comment.length >= 10) {
      setView(views.success);
      bc.assignments().createCodeRevision(commitData?.task?.id, {
        commitfile_id: commitData?.id,
        content_for_review: codeReview.code,
        comments: codeReview.comment,
        github_username: commitData?.committer?.github_username,
      })
        .then((resp) => {
          if (resp.data.comment?.length > 10) {
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
    setStage('file_list');
    setCodeReview({
      code: '',
      comments: '',
    });
  };

  return (
    <>
      <Box flex={0.6} overflow="auto" onMouseUp={handleSelectedText}>
        {!repoData?.raw
          ? 'Loading...' : (
            <MarkdownEditor
              className="hide-preview"
              value={repoData.raw}
              style={{ height: '93vh', minWidth: '100%' }}
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

      <Box maxWidth="26.22rem" flex={0.4}>
        {view === views.success ? (
          <Flex flexDirection="column" height="100%" alignItems="center" justifyContent="center" gridGap="24px">
            <Text size="26px" fontWeight={700} textAlign="center" lineHeight="34px">
              The code review was sent successfully.
            </Text>
            <Text size="18px">
              You have submitted 2 code reviews
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
            <Heading size="sm" mb="24px">
              Code Review
            </Heading>
            <Box padding="9px 0" borderRadius="8px" overflow="auto">
              <Text fontSize="14px" fontWeight={700} mb="8px">
                Reviewing
              </Text>
              <Flex gridGap="10px" alignItems="center" mb="24px">
                <Icon aria-label="Go back" icon="arrowLeft" width="17px" height="11px" color={hexColor.black} onClick={() => setStage('file_list')} cursor="pointer" />
                <Flex alignItems="center" width="100%" gridGap="9px" padding="9px 8px" border="1px solid" borderColor={hexColor.borderColor} borderRadius="8px">
                  <Icon icon="folder" width="14px" height="14px" color={hexColor.black} />
                  <Box minInlineSize="max-content">
                    {repoData.pathname}
                  </Box>
                </Flex>
              </Flex>
              {view === views.initial && (
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
                  <Textarea aria-label="feedback input" fontSize="12px" onChange={onChangeCodeReview} minHeight="134" placeholder="Start you review here..." />
                  <Box position="absolute" bottom={1.5} right={3} color={codeReview.comment.length < 10 ? '#EB5757' : 'currentColor'}>
                    {`${codeReview.comment.length}/ ${inputLimit}`}
                  </Box>
                </Box>

                <Button variant="default" gridGap="10px" isDisabled={codeReview.comment.length < 10} onClick={submitCodeReview} fontSize="13px" fontWeight={700} textTransform="uppercase" width="100%" height="48px">
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
  commitData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};
CodeReview.defaultProps = {
  selectedText: '',
  handleSelectedText: () => {},
};

export default CodeReview;
