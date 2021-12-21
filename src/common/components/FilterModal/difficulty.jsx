import { Box, Flex, Tooltip } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from '../Text';

const DifficultySection = ({
  title,
  commonTextColor,
  commonBorderColor,
  difficulties,
  difficultyPosition,
  contextFilter,
  setDifficulty,
  setFilter,
}) => (
  <Flex
    flexDirection="column"
    borderBottom={1}
    borderStyle="solid"
    borderColor={commonBorderColor}
    padding="0 0 30px 0"
  >
    <Text fontSize="xl" fontWeight="bold" color={commonTextColor} padding="25px 0 18px 0">
      {title}
    </Text>
    <Box
      width="100%"
      padding="30px 0 25px 0"
      minHeight="80px"
      display="flex"
      justifyContent="space-between"
      position="relative"
      alignItems="center"
    >
      {/* CONECTOR */}
      <Box position="absolute" top="auto" height="3px" width="100%" background="gray.default" />
      {/* CIRCLE */}
      {difficulties.map((difficulty, index) => (
        <Tooltip hasArrow defaultIsOpen label={difficulty} placement="top">
          <Box
            key={`${difficulty}`}
            onClick={() => setDifficulty(index)}
            width={index === difficultyPosition ? '20px' : '15px'}
            height={index === difficultyPosition ? '20px' : '15px'}
            borderRadius="50%"
            background={index === difficultyPosition ? 'blue.default' : 'gray.default'}
            cursor="pointer"
            position="relative"
            zIndex={1}
          >
            <Box
              padding="8px 0"
              display={{ base: index === difficultyPosition ? 'block' : 'none', md: 'none' }}
              color="black"
              width="100px"
              fontSize=" 12px"
              position="absolute"
              top="20px"
            >
              {difficulty}
            </Box>
          </Box>
        </Tooltip>
      ))}
    </Box>
    {typeof difficultyPosition === 'number' && difficultyPosition !== null && (
      <Flex width="100%" justifyContent="right">
        <Box
          as="button"
          margin={{ base: '20px 0 0 0', md: '0' }}
          color="blue.default"
          cursor="pointer"
          fontSize="14px"
          onClick={() => {
            setDifficulty(null);
            setFilter({
              ...contextFilter,
              difficulty: [],
            });
          }}
        >
          Remove difficulty
        </Box>
      </Flex>
    )}
  </Flex>
);
DifficultySection.propTypes = {
  title: PropTypes.string,
  difficulties: PropTypes.arrayOf(PropTypes.string),
  commonBorderColor: PropTypes.string.isRequired,
  commonTextColor: PropTypes.string.isRequired,
  difficultyPosition: PropTypes.number,
  contextFilter: PropTypes.objectOf(PropTypes.any).isRequired,
  setDifficulty: PropTypes.func.isRequired,
  setFilter: PropTypes.func.isRequired,
};

DifficultySection.defaultProps = {
  title: 'TECHNOLOGIES',
  difficulties: [],
  difficultyPosition: null,
};

export default DifficultySection;
