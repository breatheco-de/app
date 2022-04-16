import { useColorModeValue, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import TagCapsule from '../../common/components/TagCapsule';
import Text from '../../common/components/Text';
import Link from '../../common/components/NextChakraLink';

const SimpleTable = ({
  difficulty,
  repository,
  duration,
  videoAvailable,
  liveDemoAvailable,
  technologies,
}) => {
  const verifyIfNull = (value) => value !== null && value;
  const commonBorderColor = useColorModeValue('#DADADA', 'gray.900');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  return (
    <Flex flexDirection="column" width="100%">
      <Flex
        width="100%"
        py="14px"
        borderBottom={1}
        borderStyle="solid"
        borderColor={commonBorderColor}
        justifyContent="space-between"
      >
        <Text size="l" color={commonTextColor}>
          Dificulty
        </Text>
        <Text size="l" color={commonTextColor}>
          {verifyIfNull(difficulty) ? difficulty : 'Not Available'}
        </Text>
      </Flex>
      <Flex
        width="100%"
        py="14px"
        borderBottom={1}
        borderStyle="solid"
        borderColor={commonBorderColor}
        justifyContent="space-between"
      >
        <Text size="l" color={commonTextColor}>
          Repository
        </Text>
        <Link
          href={repository}
          color="blue.default"
          fontSize="15px"
          target="_blank"
          rel="noopener noreferrer"
        >
          Click to Open
        </Link>
      </Flex>
      <Flex
        width="100%"
        py="14px"
        borderBottom={1}
        borderStyle="solid"
        borderColor={commonBorderColor}
        justifyContent="space-between"
      >
        <Text size="l" color={commonTextColor}>
          Video Available
        </Text>
        {videoAvailable === null ? (
          <Text size="l" color={commonTextColor}>
            Not Available
          </Text>
        ) : (
          <Link
            href={videoAvailable}
            color="blue.default"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '15px' }}
          >
            Click to Open
          </Link>
        )}
      </Flex>
      <Flex
        width="100%"
        py="14px"
        borderBottom={1}
        borderStyle="solid"
        borderColor={commonBorderColor}
        justifyContent="space-between"
      >
        <Text size="l" color={commonTextColor}>
          Live Demo Available
        </Text>
        {liveDemoAvailable ? (
          <Link
            href={liveDemoAvailable}
            color="blue.default"
            fontSize="15px"
            target="_blank"
            rel="noopener noreferrer"
          >
            Click to Open
          </Link>
        ) : 'Not Available'}
      </Flex>
      <Flex
        width="100%"
        py="14px"
        borderBottom={1}
        borderStyle="solid"
        borderColor={commonBorderColor}
        justifyContent="space-between"
      >
        <Text size="l" color={commonTextColor}>
          Project average Duration
        </Text>
        <Text size="l" color={commonTextColor}>
          {duration
            ? `${duration} hrs`
            : 'Not Available'}
        </Text>
      </Flex>

      <Flex
        flexDirection="column"
        py="14px"
        borderBottom={1}
        borderStyle="solid"
        borderColor={commonBorderColor}
        width="100%"
        justifyContent="space-between"
      >
        <Text size="l" color={commonTextColor}>
          Technologies
        </Text>
        <TagCapsule
          variant="rounded"
          tags={technologies}
          marginY="8px"
          style={{
            padding: '2px 10px',
            margin: '0',
          }}
          gap="10px"
          paddingX="0"
        />
      </Flex>
    </Flex>
  );
};

SimpleTable.propTypes = {
  difficulty: PropTypes.string,
  repository: PropTypes.string,
  duration: PropTypes.number,
  videoAvailable: PropTypes.string,
  liveDemoAvailable: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  technologies: PropTypes.arrayOf(PropTypes.string),
};

SimpleTable.defaultProps = {
  difficulty: 'Intermediate',
  repository: 'Not available',
  videoAvailable: 'Not available',
  duration: 0,
  liveDemoAvailable: '',
  technologies: [],
};

export default SimpleTable;
