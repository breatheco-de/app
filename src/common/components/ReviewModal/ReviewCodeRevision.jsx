import { Box, Button, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Heading from '../Heading';
import useStyle from '../../hooks/useStyle';
import bc from '../../services/breathecode';
import Icon from '../Icon';
import Text from '../Text';
import { error, log } from '../../../utils/logging';

// eslint-disable-next-line no-unused-vars
function ReviewCodeRevision({ contextData, setContextData, stages, setStage }) {
  const { fontColor, borderColor, lightColor, hexColor, featuredLight } = useStyle();
  const [isSidebarFeedbackOpen, setIsSidebarFeedbackOpen] = useState(false);
  const data = contextData?.commitfiles || {};
  const fileList = data?.fileList || [];

  log('fileList:::', fileList);
  const proceedToCommitFeedback = (commitData, fileData) => {
    const content = fileData?.content || commitData?.content;

    const decodedContent = atob(content);
    setContextData((prevState) => ({
      ...prevState,
      commitFile: {
        path: commitData?.name,
        ...commitData,
        ...fileData,
        task: data?.task || {},
        code: decodedContent,
      },
    }));
    setIsSidebarFeedbackOpen(true);
  };
  const openCommitFile = (commitData) => bc.assignments().file(data?.task?.id, commitData?.id)
    .then((resp) => bc.get(resp.data.file_url)
      .then(async (fileResp) => {
        log('open_commit_file:::', resp.data);
        const fileData = fileResp !== undefined ? await fileResp.json() : undefined;
        proceedToCommitFeedback(resp?.data, fileData);
      }))
    .catch((err) => {
      error('"openCommitFile" fetch error:', err);
    });

  return (
    <Flex flexDirection="row" gridGap="24px" width="100%">
      {fileList?.length > 0 ? (
        <>
          <Box width="100%" flex={0.7}>
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
                return (
                  <Flex border="1px solid" borderColor={borderColor} justifyContent="space-between" alignItems="center" height="48px" padding="4px 8px" borderRadius="8px">
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
                      onClick={() => openCommitFile(file)}
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
            <Flex flexDirection="column" gridGap="16px" flex={0.3} width="100%">
              <Button variant="link" gridGap="10px" justifyContent="flex-start">
                <Icon icon="arrowLeft2" width="20px" height="20px" color={hexColor.blueDefault} />
                Go back
              </Button>
            </Flex>
          )}
        </>
      ) : (
        <Flex alignItems="center" flexDirection="column" mt="2rem" gridGap="0.7rem">
          <Heading size="xsm">
            No files to review
          </Heading>
          <Text size="14px">
            The student has no files to review yet.
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
