/* eslint-disable no-continue */
import {
  Box, useColorModeValue, Button, Flex, useDisclosure,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useTranslation from 'next-translate/useTranslation';
import getT from 'next-translate/getT';
import Text from '../common/components/Text';
import Icon from '../common/components/Icon';
import FilterModal from '../common/components/FilterModal';
import TitleContent from '../js_modules/projects/TitleContent';
import ProjectList from '../js_modules/projects/ProjectList';
import useFilter from '../common/store/actions/filterAction';
import Search from '../js_modules/projects/Search';

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'exercises');
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const image = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });
  const currentLang = locale === 'en' ? 'us' : 'es';
  const exercises = []; // filtered exercises after removing repeated
  let arrExercises = []; // incoming exercises
  const data = await fetch(
    `${process.env.BREATHECODE_HOST}/v1/registry/asset?type=exercise&big=true`,
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

  const ogUrl = {
    en: '/interactive-exercises',
    us: '/interactive-exercises',
  };

  return {
    props: {
      seo: {
        title: t('seo.title'),
        description: t('seo.description'),
        image,
        url: ogUrl.en || `/${locale}/interactive-exercises`,
        pathConnector: '/interactive-exercises',
        locales,
        locale,
        keywords,
        card: 'large',
      },
      fallback: false,
      exercises: exercises.filter((project) => project.lang === currentLang),
      technologyTags,
      difficulties: difficultiesSorted,
    },
  };
};

function Exercices({ exercises, technologyTags, difficulties }) {
  const { t } = useTranslation('exercises');
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
      <TitleContent title={t('title')} mobile />
      <Flex
        justifyContent="space-between"
        flex="1"
        gridGap="20px"
        padding={{ base: '3% 4% 4% 4%', md: '1.5% 10% 1.5% 10%' }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
      >
        <TitleContent title={t('title')} mobile={false} />

        <Search placeholder={t('search')} />

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
            {currentFilters >= 2 ? t('filters') : t('filter')}
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
          {t('description')}
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
