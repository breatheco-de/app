import { Box, Divider, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import Text from '../Text';
import Icon from '../Icon';
import useStyle from '../../hooks/useStyle';
import '@uiw/react-markdown-editor/markdown-editor.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@uiw/react-markdown-preview/markdown.css';

const MarkdownEditor = dynamic(
  () => import('@uiw/react-markdown-editor').then((mod) => mod.default),
  { ssr: false },
);

function CodeReview({ selectedText, handleSelectedText }) {
  const [repoData, setRepoData] = useState({
    isFetching: true,
  });
  const { hexColor } = useStyle();

  const fetchRawRepositroy = async (githubUrl) => {
    try {
      const pathname = new URL(githubUrl)?.pathname.replace('/blob', '');
      const rawUrl = githubUrl.replace('https://github.com', 'https://raw.githubusercontent.com').replace('/blob', '');
      const response = await fetch(rawUrl);
      const data = await response.text();
      const extensionLanguage = pathname.split('.').pop();
      const codeRaw = `\`\`\`${extensionLanguage}\n${data}\n\`\`\``;
      setRepoData({
        raw: codeRaw,
        extensionLanguage,
        pathname,
        url: githubUrl,
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
    fetchRawRepositroy('https://github.com/breatheco-de/app/blob/main/styles/theme.js');
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
      <Box flex={0.65} overflow="auto">
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
      <Box maxWidth="24.5rem" flex={0.35}>
        <Box padding="9px 0" borderRadius="8px" overflow="auto">
          <Text fontSize="14px" mb="8px" userSelect="none">
            Code Review
          </Text>
          <Flex gridGap="10px" alignItems="center" userSelect="none">
            <Icon icon="arrowLeft" width="17px" height="11px" color={hexColor.black} />
            <Flex alignItems="center" gridGap="9px" padding="9px 8px" border="1px solid" borderColor={hexColor.borderColor} borderRadius="8px">
              <Icon icon="file2" width="14px" height="14px" color={hexColor.black} />
              <span>
                {repoData.pathname}
              </span>
            </Flex>
          </Flex>

          {selectedText.length > 0 && (
            <Box fontSize="13px" color="#fff" userSelect="none" mt="2rem" padding="6px 16px" borderRadius="6px" whiteSpace="pre-wrap" overflow="auto" background="rgb(45, 45, 45)">
              <pre>
                <code className="language-bash">
                  {selectedText}
                </code>
              </pre>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

CodeReview.propTypes = {
  selectedText: PropTypes.string,
  handleSelectedText: PropTypes.func,
};
CodeReview.defaultProps = {
  selectedText: '',
  handleSelectedText: () => {},
};

export default CodeReview;
