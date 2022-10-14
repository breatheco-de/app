/* eslint-disable max-len */
import {
  Box, Flex, Tooltip, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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
}) => {
  const router = useRouter();
  const [queryPosition, setQueryPosition] = useState(null);
  const defaultDifficulties = ['beginner', 'easy', 'intermediate', 'hard'];
  const difficultyExists = defaultDifficulties.some((l) => difficulties.includes(l));

  useEffect(() => {
    const difficultyQuery = router.query.difficulty;
    if (difficultyQuery !== null) {
      const difficultyQueryIndex = defaultDifficulties.findIndex((difficulty) => difficulty === difficultyQuery);
      if (difficultyQueryIndex !== -1) setQueryPosition(difficultyQueryIndex);
    }
  }, [router.query.difficulty]);

  const verifyDifficultyisAvailable = (index, position, difficulty, difficultiesArray) => {
    if ((position !== null ? index === position : index === queryPosition)
        && difficultiesArray[index] === difficulty) {
      return true;
    }
    return false;
  };

  const getBackgroundColor = (difficultyIsMatch, isSelected, index) => {
    if (difficultyPosition > index) return 'blue.default';
    if (difficultyIsMatch && isSelected) return 'blue.default';
    if (difficultyIsMatch) return useColorModeValue('gray.default', 'gray.400');
    return useColorModeValue('gray.350', 'gray.default');
  };

  // difficultyPosition
  const positionConnector = {
    0: 'linear-gradient(90deg, #0097CD 0%, #A4A4A4 0%)',
    1: 'linear-gradient(90deg, #0097CD 33%, #A4A4A4 0%)',
    2: 'linear-gradient(90deg, #0097CD 66%, #A4A4A4 0%)',
    3: 'linear-gradient(90deg, #0097CD 100%, #A4A4A4 0%)',
  };

  const lineColor = positionConnector[difficultyPosition] || 'gray.default';

  return difficultyExists && (
    <Flex
      flexDirection="column"
      borderBottom={1}
      borderStyle="solid"
      borderColor={commonBorderColor}
      padding="0 0 30px 0"
    >
      <Text fontSize="1rem" textTransform="uppercase" fontWeight="bold" color={commonTextColor} padding="25px 0 18px 0">
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
        {/* Conector */}
        <Box position="absolute" top="auto" height="3px" width="100%" background={lineColor} />
        {/* Circle of difficulties  */}
        {defaultDifficulties.map((difficulty, index) => {
          const isSelected = verifyDifficultyisAvailable(index, difficultyPosition, difficulty, difficulties);
          const difficultyIsMatch = difficulties[index] === difficulty || false;
          return (
            <Tooltip key={`${difficulty}`} label={difficultyIsMatch ? difficulty : `${difficulty} (not available)`} placement="top">
              <Box
                onClick={() => (difficultyIsMatch && setDifficulty(index)) || null}
                width={isSelected ? '20px' : '15px'}
                height={isSelected ? '20px' : '15px'}
                borderRadius="50%"
                background={getBackgroundColor(difficultyIsMatch, isSelected, index)}
                border={isSelected ? '4px solid' : 'none'}
                borderColor={isSelected ? 'blue.200' : 'none'}
                // isSelected ? 'blue.default' : 'gray.default'
                cursor="pointer"
                position="relative"
                zIndex={1}
              >
                <Box
                  padding="8px 0"
                  display={{ base: isSelected ? 'block' : 'none', md: 'none' }}
                  color="black"
                  width="100px"
                  fontSize=" 12px"
                  position="absolute"
                  top="20px"
                >
                  {difficultyIsMatch ? difficulty : `${difficulty} (not available)`}
                </Box>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
      {(difficultyPosition !== null || queryPosition !== null) && (
        <Flex width="100%" justifyContent="right">
          <Box
            as="button"
            margin={{ base: '20px 0 0 0', md: '0' }}
            color="blue.default"
            cursor="pointer"
            fontSize="14px"
            onClick={() => {
              setDifficulty(null);
              setQueryPosition(null);
              router.push({
                query: {
                  ...router.query,
                  difficulty: null,
                },
              });
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
};
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
  title: 'DIFFICULTIES',
  difficulties: [],
  difficultyPosition: null,
};

export default DifficultySection;
