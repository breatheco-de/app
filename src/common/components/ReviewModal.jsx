import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Box, Divider, Flex } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import SimpleModal from './SimpleModal';
import '@uiw/react-markdown-editor/markdown-editor.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@uiw/react-markdown-preview/markdown.css';
import Text from './Text';
import useStyle from '../hooks/useStyle';
import Icon from './Icon';

const MarkdownEditor = dynamic(
  () => import('@uiw/react-markdown-editor').then((mod) => mod.default),
  { ssr: false },
);

function ReviewModal({ isOpen, onClose, ...rest }) {
  const [selectedText, setSelectedText] = useState('');
  const { hexColor } = useStyle();
  const [repoData, setRepoData] = useState({
    isFetching: true,
  });

  const handleSelectedText = () => {
    const text = window.getSelection().toString();
    if (text.length > 0) {
      setSelectedText(text);
    }
  };

  const fetchRawRepositroy = async (githubUrl) => {
    try {
      const pathname = new URL(githubUrl)?.pathname.replace('/blob', '');
      const rawUrl = githubUrl.replace('https://github.com', 'https://raw.githubusercontent.com').replace('/blob', '');
      const response = await fetch(rawUrl);
      const data = await response.text();
      const extensionLanguage = pathname.split('.').pop();
      const codeRaw = `\`\`\`${extensionLanguage}\n${data}\n\`\`\``;
      // const codeRaw = data;
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
    if (isOpen) {
      // fetchRawRepositroy('https://github.com/breatheco-de/app/blob/main/src/common/services/breathecode.js');
      fetchRawRepositroy('https://github.com/breatheco-de/app/blob/main/styles/theme.js');
    }
  }, [isOpen]);

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
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Rigobot code review"
      closeOnOverlayClick={false}
      maxWidth="74rem"
      minHeight="30rem"
      bodyStyles={{
        display: 'flex',
        gridGap: '20px',
        padding: '0.5rem 16px',
      }}
      headerStyles={{
        userSelect: 'none',
      }}
      onMouseUp={handleSelectedText}
      {...rest}
    >
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
    </SimpleModal>
  );
}

ReviewModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};
ReviewModal.defaultProps = {
  isOpen: false,
  onClose: () => {},
};

export default ReviewModal;
