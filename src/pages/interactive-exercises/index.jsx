/* eslint-disable no-continue */
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  Box, useColorModeValue, Button, Flex, useDisclosure,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import FilterModal from '../../common/components/FilterModal';
import TitleContent from '../../js_modules/projects/TitleContent';
import ProjectList from '../../js_modules/projects/ProjectList';
import useFilter from '../../common/store/actions/filterAction';
import Search from '../../js_modules/projects/Search';

export const getStaticProps = async ({ locale }) => {
  const exercises = []; // filtered exercises after removing repeated
  let arrExercises = []; // incoming exercises
  const data = await fetch(
    'https://breathecode-test.herokuapp.com/v1/registry/asset?type=exercise&big=true',
    {
      Accept: 'application/json, text/plain, */*',
    },
  ).then((res) => res.json());

  arrExercises = Object.values(data);
  if (data.status >= 200 && data.status < 400) {
    console.log(`Original Exercises: ${arrExercises}`);
  } else {
    console.error(`Error fetching exercises with ${data.status}`);
  }

  let technologyTags = [];
  let difficulties = [];

  for (let i = 0; i < arrExercises.length; i += 1) {
    // skip repeated exercises
    if (exercises.find((p) => arrExercises[i].slug === p.slug)) {
      continue;
    }
    exercises.push(arrExercises[i]);

    if (typeof arrExercises[i].technology === 'string') technologyTags.push(arrExercises[i].technology);
    if (Array.isArray(arrExercises[i].technologies)) {
      technologyTags = technologyTags.concat(arrExercises[i].technologies);
    }

    if (typeof arrExercises[i].difficulty === 'string') {
      if (arrExercises[i].difficulty === 'BEGINNER') arrExercises[i].difficulty = 'beginner';
      difficulties.push(arrExercises[i].difficulty);
    }
  }

  technologyTags = [...new Set(technologyTags)];
  difficulties = [...new Set(difficulties)];

  // Verify if difficulty exist in expected position, else fill void array with 'nullString'
  const verifyDifficultyExists = (difficultiesArray, difficulty) => {
    if (difficultiesArray.some((el) => el === difficulty)) {
      return difficulty;
    }
    return 'nullString';
  };

  // Fill common difficulties in expected position
  const difficultiesSorted = [];
  ['beginner', 'easy', 'intermediate', 'hard'].forEach((difficulty) => {
    difficultiesSorted.push(verifyDifficultyExists(difficulties, difficulty));
  });

  return {
    props: {
      fallback: false,
      ...(await serverSideTranslations(locale, ['home', 'navbar', 'footer'])),
      exercises,
      technologyTags,
      difficulties: difficultiesSorted,
    },
  };
};

function Exercices({ exercises, technologyTags, difficulties }) {
  const { filteredBy, setExerciseFilters } = useFilter();
  const { technologies, difficulty, videoTutorials } = filteredBy.exercisesOptions;

  const currentFilters = technologies.length
    + (difficulty === undefined || difficulty.length === 0 ? 0 : 1)
    + videoTutorials;
  const router = useRouter();
  let initialSearchValue;
  useEffect(() => {
    initialSearchValue = router.query && router.query.search;
  }, [initialSearchValue]);
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <Box height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <TitleContent title="Practices" mobile />
      <Flex
        justifyContent="space-between"
        flex="1"
        gridGap="20px"
        padding={{ base: '3% 4% 4% 4%', md: '1.5% 10% 1.5% 10%' }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
      >
        <TitleContent title="Practices" mobile={false} />

        <Search placeholder="Search Exercises" />

        <Button
          variant="outline"
          backgroundColor={useColorModeValue('', 'gray.800')}
          _hover={{ backgroundColor: useColorModeValue('', 'gray.700') }}
          border={currentFilters >= 1 ? 2 : 1}
          onClick={onOpen}
          borderStyle="solid"
          minWidth="125px"
          borderColor={useColorModeValue(
            `${currentFilters >= 1 ? 'blue.default' : '#DADADA'}`,
            'gray.800',
          )}
        >
          <Icon icon="setting" width="20px" height="20px" style={{ minWidth: '20px' }} />
          <Text textTransform="uppercase" pl="10px">
            {currentFilters >= 2 ? 'Filters' : 'Filter'}
          </Text>
          {currentFilters >= 1 && (
            <Text
              as="span"
              margin="0 10px"
              textTransform="uppercase"
              display="flex"
              justifyContent="center"
              alignItems="center"
              backgroundColor="blue.default"
              color="white"
              borderRadius="30px"
              minWidth="20px"
              height="20px"
            >
              {currentFilters}
            </Text>
          )}
        </Button>

        <FilterModal
          isModalOpen={isOpen}
          onClose={onClose}
          contextFilter={filteredBy.exercisesOptions}
          setFilter={setExerciseFilters}
          technologyTags={technologyTags}
          difficulties={difficulties}
        />
      </Flex>

      <Box flex="1" margin={{ base: '0 4% 0 4%', md: '0 10% 0 10%' }}>
        <Text
          size="md"
          display="flex"
          padding={{ base: '30px 8%', md: '30px 28%' }}
          textAlign="center"
        >
          The following lessons explain different programing concepts and have been published by
          breathe code members, search for a partiulars lesson using the filters bellow
        </Text>
        <ProjectList
          projects={exercises}
          contextFilter={filteredBy.exercisesOptions}
          projectPath="interactive-exercises"
        />
      </Box>
    </Box>
  );
}

Exercices.propTypes = {
  exercises: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  technologyTags: PropTypes.arrayOf(PropTypes.string),
  difficulties: PropTypes.arrayOf(PropTypes.string),
};
Exercices.defaultProps = {
  exercises: [],
  technologyTags: [],
  difficulties: [],
};

export default Exercices;
