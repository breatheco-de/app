/* eslint-disable max-len */
import {
  Box, Flex, Tooltip,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Text from '../Text';
import Icon from '../Icon';
import useStyle from '../../hooks/useStyle';

function DifficultySection({
  t,
  title,
  commonTextColor,
  commonBorderColor,
  difficulties,
  difficultyPosition,
  contextFilter,
  setDifficultyPosition,
  setFilter,
}) {
  const router = useRouter();
  const [queryPosition, setQueryPosition] = useState(null);
  const defaultDifficulties = ['junior', 'mid-level', 'senior'];
  const difficultyQuery = router?.query?.difficulty ? router.query.difficulty.toLocaleLowerCase() : '';
  const { lightColor } = useStyle();

  const getDifficultyPosition = (difficulty) => {
    if (difficulty === 'beginner' || difficulty === 'easy') {
      return 0;
    }
    if (difficulty === 'intermediate') {
      return 1;
    }
    if (difficulty === 'hard') {
      return 2;
    }
    return 0;
  };

  const difficultyExists = defaultDifficulties.some((l) => difficulties.map((d) => defaultDifficulties[getDifficultyPosition(d)]).includes(l));

  const difficultyValues = {
    beginner: 'junior',
    easy: 'junior',
    intermediate: 'mid-level',
    hard: 'senior',
  };
  useEffect(() => {
    if (difficultyQuery !== null) {
      const difficultyQueryIndex = defaultDifficulties.findIndex((difficulty) => difficulty === difficultyValues?.[difficultyQuery]);
      if (difficultyQueryIndex !== -1) setQueryPosition(difficultyQueryIndex);
    }
  }, [router.query.difficulty]);

  const verifyIfDifficultyIsSelected = (difficulty) => {
    const difficultyIndex = defaultDifficulties.findIndex((d) => d === difficulty);
    // DifficultyPosition
    if (difficultyPosition !== null) {
      return difficultyIndex === difficultyPosition;
    }
    // QueryPosition
    if (queryPosition !== null) {
      return difficultyIndex === queryPosition;
    }
    if (difficultyPosition !== null) {
      return difficultyIndex === difficultyPosition;
    }
    return false;
  };

  const getBackgroundColor = (difficulty) => {
    if (difficulty === 'junior') {
      return {
        backgroundColor: '#F0FFF4',
        borderColor: '#25BF6C',
      };
    }
    if (difficulty === 'mid-level') {
      return {
        backgroundColor: '#FFF4DC',
        borderColor: '#FFB718',
      };
    }
    if (difficulty === 'senior') {
      return {
        backgroundColor: '#FFE0E0',
        borderColor: '#CD0000',
      };
    }
    return {};
  };

  const iconDifficultyCount = {
    0: [1],
    1: [1, 2],
    2: [1, 2, 3],
  };

  const handlePosition = (index) => {
    if (difficultyPosition === index) {
      setDifficultyPosition(null);
    } else {
      setDifficultyPosition(index);
    }
  };

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
        {defaultDifficulties.map((difficulty, index) => {
          const isSelected = verifyIfDifficultyIsSelected(difficulty);
          const difficultyIsMatch = defaultDifficulties[index] === difficulty;
          const label = t(`common:${difficulty}`);
          const borderColor = isSelected ? getBackgroundColor(difficulty).borderColor : 'transparent';
          const background = isSelected ? getBackgroundColor(difficulty).backgroundColor : '';

          return (
            <Tooltip key={`${difficulty}`} label={difficultyIsMatch ? label : `${label} (not available)`} placement="top">
              <Flex
                onClick={() => (difficultyIsMatch && handlePosition(index))}
                width="auto"
                minWidth="85px"
                height="auto"
                padding="11px"
                flexDirection="column"
                borderRadius="3px"
                gridGap="19"
                justifyContent="center"
                alignItems="center"
                background={background}
                border="1px solid"
                borderColor={borderColor}
                cursor="pointer"
                position="relative"
                color={isSelected ? getBackgroundColor(difficulty).borderColor : lightColor}
                zIndex={1}
              >
                <Flex gridGap="5px">
                  {iconDifficultyCount[index] && iconDifficultyCount[index].map((iconIndex) => (
                    <Icon key={iconIndex} icon="flash" color="currentColor" width="16px" height="22px" />
                  ))}
                </Flex>
                <Text
                  fontWeight={900}
                  color="currentColor"
                  fontSize="16px"
                >
                  {label}
                </Text>
              </Flex>
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
              setDifficultyPosition(null);
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
            {t('remove-difficulty')}
          </Box>
        </Flex>
      )}
    </Flex>
  );
}
DifficultySection.propTypes = {
  t: PropTypes.func,
  title: PropTypes.string,
  difficulties: PropTypes.arrayOf(PropTypes.string),
  commonBorderColor: PropTypes.string.isRequired,
  commonTextColor: PropTypes.string.isRequired,
  difficultyPosition: PropTypes.number,
  contextFilter: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  setDifficultyPosition: PropTypes.func.isRequired,
  setFilter: PropTypes.func.isRequired,
};

DifficultySection.defaultProps = {
  t: () => {},
  title: 'DIFFICULTIES',
  difficulties: [],
  difficultyPosition: null,
};

export default DifficultySection;
