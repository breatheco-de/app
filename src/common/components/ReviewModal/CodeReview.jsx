import { Box, Button, Divider, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import Text from '../Text';
import Icon from '../Icon';
import useStyle from '../../hooks/useStyle';
import '@uiw/react-markdown-editor/markdown-editor.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@uiw/react-markdown-preview/markdown.css';
import Heading from '../Heading';

const MarkdownEditor = dynamic(
  () => import('@uiw/react-markdown-editor').then((mod) => mod.default),
  { ssr: false },
);

function CodeReview({ data, setStage, selectedText, handleSelectedText }) {
  const [repoData, setRepoData] = useState({
    isFetching: true,
  });
  const { hexColor } = useStyle();

  const prepareCommitData = () => {
    try {
      const extensionLanguage = data?.path?.split('.').pop().replace(/\?.*$/, '');
      const codeRaw = `\`\`\`${extensionLanguage}\n${data.code}\n\`\`\``;
      setRepoData({
        raw: codeRaw,
        extensionLanguage,
        pathname: data?.path,
        url: data?.html_url,
        error: false,
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
      setRepoData({
        msg: 'No content found',
        error: true,
        isFetching: false,
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

  return (
    <>
      <Box flex={0.6} overflow="auto" onMouseUp={handleSelectedText}>
        {repoData.isFetching
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
        <Heading size="sm" mb="24px">
          Code Review
        </Heading>
        <Box padding="9px 0" borderRadius="8px" overflow="auto">
          <Text fontSize="14px" mb="8px">
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

          <Flex gridGap="15px" alignItems="start">
            {selectedText?.length > 0 ? (
              <Text>
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
              <pre>
                <code className="language-bash">
                  {selectedText}
                </code>
              </pre>
            </Box>
          )}

          {selectedText.length > 0 && (
            <Button gridGap="10px" fontSize="13px" fontWeight={700} textTransform="uppercase" width="100%" height="48px">
              <Icon icon="code-comment" size="23px" color={hexColor.blueDefault} />
              <Text>
                Start Code Review
              </Text>
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
}

CodeReview.propTypes = {
  setStage: PropTypes.func.isRequired,
  selectedText: PropTypes.string,
  handleSelectedText: PropTypes.func,
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};
CodeReview.defaultProps = {
  selectedText: '',
  handleSelectedText: () => {},
};

export default CodeReview;
