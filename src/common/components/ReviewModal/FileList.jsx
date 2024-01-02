import { Box, Button, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import atob from 'atob';
import Heading from '../Heading';
import useStyle from '../../hooks/useStyle';
import bc from '../../services/breathecode';
import Icon from '../Icon';
import Text from '../Text';
import { error } from '../../../utils/logging';

function FileList({ data, setContextData, stage, stages, setStage }) {
  const { fontColor, borderColor, lightColor, hexColor } = useStyle();

  const openCommitFile = (id) => bc.assignments().file(id)
    .then((resp) => bc.get(resp.data.file_url)
      .then(async (fileResp) => {
        const fileData = await fileResp.json();
        if (fileData?.content) {
          const decodedContent = atob(fileData?.content);
          setContextData((prevState) => ({
            ...prevState,
            commitFile: {
              ...fileData,
              code: decodedContent,
            },
          }));
          setStage(stages.code_review);
        }
      }))
    .catch((err) => {
      error('"openCommitFile" fetch error:', err);
    });

  return (
    <Flex display={stage !== stages.file_list && 'none'} flexDirection="column" gridGap="24px" width="100%">
      {data?.length > 0 ? (
        <>
          <Heading size="21px" color={lightColor}>
            Select the file you want to review
          </Heading>
          <Flex>
            <Box fontSize="12px" flex={0.3}>Name</Box>
            <Box fontSize="12px" flex={0.7}>Feedback status</Box>
          </Flex>
          <Flex flexDirection="column" gridGap="12px">
            {/* card */}
            {data.map((file) => (
              <Flex border="1px solid" borderColor={borderColor} padding="4px 8px" borderRadius="8px">
                <Icon icon="file" width="22px" height="22px" display="flex" alignItems="center" color={fontColor} flex={0.1} />
                <Flex flexDirection="column" gridGap="9px" flex={0.4} maxWidth="102px">
                  <Text fontSize="12px" fontWeight={700}>
                    {file.name.includes('/') ? file.name : `./${file.name}`}
                  </Text>
                  <Box fontSize="12px">
                    {file.committer.github_username}
                  </Box>
                </Flex>
                <Flex flex={0.3} alignItems="center" justifyContent="center">
                  <Icon icon="verified" width="28px" height="28px" />
                </Flex>

                <Flex flex={0.3} justifyContent="center" alignItems="center">
                  <Box background="blue.default" fontSize="12px" padding="3px 8px" height="auto" borderRadius="50%">
                    3
                  </Box>
                  <Icon icon="code" width="20px" height="20px" color={hexColor.black} ml="16px" />
                  <Icon icon="arrowDown" width="34px" height="34px" color={hexColor.blueDefault} ml="6px" />
                </Flex>
                <Button flex={0.2} height="auto" onClick={() => openCommitFile(file.id)} variant="link" display="flex" alignItems="center" gridGap="10px" justifyContent="flex-end">
                  Reviewed
                </Button>
              </Flex>
            ))}
          </Flex>
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
FileList.propTypes = {
  stage: PropTypes.string,
  stages: PropTypes.shape({
    initial: PropTypes.string,
    file_list: PropTypes.string,
    code_review: PropTypes.string,
  }),
  setStage: PropTypes.func,
  data: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  setContextData: PropTypes.func,
};
FileList.defaultProps = {
  stage: '',
  stages: {
    initial: 'initial',
    file_list: 'file_list',
    code_review: 'code_review',
  },
  setStage: () => {},
  data: [],
  setContextData: () => {},
};

export default FileList;
