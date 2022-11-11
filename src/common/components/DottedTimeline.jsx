import PropTypes from 'prop-types';
import { Box, Flex, Tooltip } from '@chakra-ui/react';
import Text from './Text';
import useStyle from '../hooks/useStyle';

const DottedTimeline = ({ storySettings, label, dots, helpText }) => {
  const { borderColor } = useStyle();
  console.log('storySettings:::', storySettings);

  return (
    <Box borderRadius="17px" padding="20px 29px" border="1px solid" borderColor={borderColor}>
      <Flex justifyContent="space-between">
        <Box>
          {label && label}
        </Box>
        {helpText.length > 2 && (
          <Text size="md">
            {helpText}
          </Text>
        )}
      </Flex>
      <Flex gridGap="9px">
        {dots && dots.map((dot) => (
          <Tooltip key={dot.label} hasArrow label={dot.label} placement="top" openDelay={150} closeDelay={0} fontWeight={700} fontSize="13px" padding="0 6px" bg="gray.dark">
            <Box background={dot.color} borderRadius="50%" width="10px" height="10px" />
          </Tooltip>
        ))}
      </Flex>
    </Box>
  );
};

DottedTimeline.propTypes = {
  storySettings: PropTypes.objectOf(PropTypes.any),
  label: PropTypes.bool,
  dots: PropTypes.arrayOf(PropTypes.any),
  helpText: PropTypes.string,
};

DottedTimeline.defaultProps = {
  storySettings: {},
  label: false,
  dots: [],
  helpText: '',
};

export default DottedTimeline;
