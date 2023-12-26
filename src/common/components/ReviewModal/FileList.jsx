import { Box, Button, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from '../Heading';
import useStyle from '../../hooks/useStyle';
import Icon from '../Icon';
import Text from '../Text';

function FileList({ stage, stages, setStage }) {
  const { fontColor, borderColor, lightColor, hexColor } = useStyle();

  return (
    <Flex display={stage !== stages.file_list && 'none'} flexDirection="column" gridGap="24px" width="100%">
      <Heading size="21px" color={lightColor}>
        Select the file you want to review
      </Heading>
      <Flex>
        <Box fontSize="12px" flex={0.3}>Name</Box>
        <Box fontSize="12px" flex={0.7}>Feedback status</Box>
      </Flex>
      <Flex flexDirection="column" gridGap="12px">
        {/* card */}
        <Flex border="1px solid" borderColor={borderColor} padding="4px 8px" borderRadius="8px">
          <Icon icon="file" width="22px" height="22px" display="flex" alignItems="center" color={fontColor} flex={0.1} />
          <Flex flexDirection="column" gridGap="9px" flex={0.4} maxWidth="102px">
            <Text fontSize="12px" fontWeight={700}>
              ulrs.py/src/style/styles.css
            </Text>
            <Box fontSize="12px">
              3991291291kb
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
          <Button flex={0.2} height="auto" onClick={() => setStage(stages.code_review)} variant="link" display="flex" alignItems="center" gridGap="10px" justifyContent="flex-end">
            Reviewed?
          </Button>
        </Flex>
      </Flex>
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
};
FileList.defaultProps = {
  stage: '',
  stages: {
    initial: 'initial',
    file_list: 'file_list',
    code_review: 'code_review',
  },
  setStage: () => {},
};

export default FileList;
