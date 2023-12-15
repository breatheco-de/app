import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Box, Divider } from '@chakra-ui/react';
import SimpleModal from './SimpleModal';
import '@uiw/react-markdown-editor/markdown-editor.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@uiw/react-markdown-preview/markdown.css';
import MarkDownParser from './MarkDownParser';

function ReviewModal({ isOpen, onClose, ...rest }) {
  const [repoData, setRepoData] = useState({
    isFetching: true,
  });

  const fetchRawRepositroy = async (githubUrl) => {
    console.log('fetching raw repository');
    // get the raw file from github
    try {
      // link must be replace from https://github.com/breatheco-de/app/blob/main/src/common/services/breathecode.js to https://raw.githubusercontent.com/breatheco-de/app/main/src/common/services/breathecode.js
      const pathname = new URL(githubUrl)?.pathname.replace('/blob', '');
      const rawUrl = githubUrl.replace('https://github.com', 'https://raw.githubusercontent.com').replace('/blob', '');
      const response = await fetch(rawUrl);
      const data = await response.text();
      setRepoData({
        raw: data,
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
      fetchRawRepositroy('https://github.com/breatheco-de/app/blob/main/src/common/services/breathecode.js');
    }
  }, [isOpen]);

  console.log('repoData.raw:::', repoData.raw);
  // add triple backticks to the text
  const code = `\`\`\`jsx\n${repoData.raw}\n\`\`\``;

  // ```jsx mdx:preview

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
      }}
      {...rest}
    >
      <Box flex={0.65} overflow="auto">
        {repoData.isFetching
          ? 'Loading...' : (
            <MarkDownParser
              content={code}
              fontSize="14px"
            />
          )}
      </Box>
      <Box>
        <Divider orientation="vertical" />
      </Box>
      <Box flex={0.35}>
        <Box padding="9px 8px" borderRadius="8px" overflow="auto">
          <span>
            {repoData.pathname}
          </span>
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
