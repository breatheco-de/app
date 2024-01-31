import { Box, Button, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Heading from '../Heading';
import useStyle from '../../hooks/useStyle';
import bc from '../../services/breathecode';
import Icon from '../Icon';
import Text from '../Text';
import { error, log } from '../../../utils/logging';

function FileList({ contextData, setContextData, stage, stages, setStage, setReviewStatus }) {
  const { t } = useTranslation('assignments');
  const { fontColor, borderColor, lightColor, hexColor, featuredLight } = useStyle();
  const data = contextData?.commitfiles || {};
  const fileList = data?.fileList || [];

  const buttonText = {
    approve: t('review-assignment.approve'),
    reject: t('review-assignment.reject'),
  };
  const buttonColor = {
    approve: 'success',
    reject: 'danger',
  };
  log('fileList:::', fileList);
  const proceedToCodeReview = (commitData, fileData) => {
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
    setStage(stages.code_review);
  };
  const openCommitFile = (commitData) => bc.assignments().file(data?.task?.id, commitData?.id)
    .then((resp) => bc.get(resp.data.file_url)
      .then(async (fileResp) => {
        log('open_commit_file:::', resp.data);
        const fileData = fileResp !== undefined ? await fileResp.json() : undefined;
        proceedToCodeReview(resp?.data, fileData);
      }))
    .catch((err) => {
      error('"openCommitFile" fetch error:', err);
    });

  return (
    <Flex display={stage !== stages.file_list && 'none'} flexDirection="column" gridGap="24px" width="100%">
      {fileList?.length > 0 ? (
        <>
          <Flex mb="15px" gridGap="2px" flexDirection="column">
            <Heading size="18px" color={lightColor} fontWeight={400}>
              Select the file you want to review from:
            </Heading>
            <Heading size="18px" fontWeight={700}>
              {data?.task?.title}
            </Heading>
          </Flex>
          <Flex my="10px" py="10px" px="10px" borderRadius="10px" background={featuredLight}>
            <Box fontSize="12px" flex={0.3}>Name</Box>
            <Box fontSize="12px" flex={0.7}>Feedback status</Box>
          </Flex>
          <Flex flexDirection="column" gridGap="12px">
            {fileList.map((file) => {
              const revisionsRelated = contextData.code_revisions.filter((revision) => revision?.file?.id === file?.id);
              const reviewed = revisionsRelated?.length > 0;
              return (
                <Flex border="1px solid" borderColor={borderColor} justifyContent="center" alignItems="center" height="48px" padding="4px 8px" borderRadius="8px">
                  <Icon icon="file2" width="22px" height="22px" display="flex" alignItems="center" color={fontColor} flex={0.1} />
                  <Flex flexDirection="column" gridGap="9px" flex={0.4} maxWidth="102px">
                    <Text fontSize="12px" fontWeight={700}>
                      {file?.name.includes('/') ? file.name : `./${file.name}`}
                    </Text>
                    {file?.committer?.github_username && (
                      <Box fontSize="12px">
                        {file?.committer?.github_username}
                      </Box>
                    )}
                  </Flex>
                  <Flex flex={0.3} alignItems="center" justifyContent="center">
                    <Icon icon="verified" width="24px" height="24px" />
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
                    variant={reviewed ? 'link' : 'default'}
                    flex={0.2}
                    height="40px"
                    onClick={() => openCommitFile(file)}
                    display="flex"
                    alignItems="center"
                    gridGap="10px"
                  >
                    {reviewed ? 'Reviewed' : 'Start review'}
                  </Button>
                </Flex>
              );
            })}
          </Flex>
        </>
      ) : (
        <Flex alignItems="center" width="500px" flexDirection="column" margin="1rem auto 1rem auto" gridGap="0.7rem">
          <Heading size="xsm">
            No files to review
          </Heading>
          <Text size="14px" textAlign="center" style={{ textWrap: 'balance' }}>
            The student has no files to review yet. But you can still approve or reject the assignment, and leave a comment.
          </Text>
          <Flex width="100%" justifyContent="space-between" mt="3rem">
            {['reject', 'approve'].map((type) => (
              <Button
                minWidth="128px"
                background={buttonColor[type]}
                _hover={{ background: buttonColor[type] }}
                onClick={() => {
                  setStage(stages.approve_or_reject_code_revision);
                  setReviewStatus(type);
                }}
                color="white"
                borderRadius="3px"
                fontSize="13px"
                textTransform="uppercase"
              >
                {buttonText[type]}
              </Button>
            ))}
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
FileList.propTypes = {
  stage: PropTypes.string,
  stages: PropTypes.shape({
    initial: PropTypes.string,
    file_list: PropTypes.string,
    code_review: PropTypes.string,
    approve_or_reject_code_revision: PropTypes.string,
  }),
  setStage: PropTypes.func,
  contextData: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  setContextData: PropTypes.func,
  setReviewStatus: PropTypes.func.isRequired,
};
FileList.defaultProps = {
  stage: '',
  stages: {
    initial: 'initial',
    file_list: 'file_list',
    code_review: 'code_review',
  },
  setStage: () => {},
  setContextData: () => {},
};

export default FileList;
