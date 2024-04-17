/* eslint-disable no-continue */
import {
  Box, useColorModeValue, Button, Flex, useDisclosure,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import getT from 'next-translate/getT';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import FilterModal from '../../common/components/FilterModal';
import TitleContent from '../../js_modules/projects/TitleContent';
import useFilter from '../../common/store/actions/filterAction';
import Search from '../../js_modules/projects/Search';
import { getQueryString } from '../../utils';
import GridContainer from '../../common/components/GridContainer';
import PaginatedView from '../../common/components/PaginationView';
import ProjectsLoader from '../../common/components/ProjectsLoader';
import { parseQuerys } from '../../utils/url';
import { ORIGIN_HOST, WHITE_LABEL_ACADEMY } from '../../utils/variables';
import { log } from '../../utils/logging';

const contentPerPage = 20;

const fetchExercises = async (lang, page, query) => {
  const difficulty = {
    junior: 'BEGINNER,EASY',
    'mid-level': 'INTERMEDIATE',
    senior: 'HARD',
  };
  const difficultyQueryValues = {
    beginner: 'junior',
    easy: 'junior',
    intermediate: 'mid-level',
    hard: 'senior',
  };
  const technologies = query.techs !== '' ? query.techs : undefined;
  const video = query.withVideo === 'true' ? query.withVideo : undefined;
  const querys = parseQuerys({
    asset_type: 'EXERCISE',
    status: 'PUBLISHED',
    language: lang,
    academy: WHITE_LABEL_ACADEMY,
    limit: contentPerPage,
    offset: page ? (page - 1) * contentPerPage : 0,
    difficulty: difficulty?.[query?.difficulty] || difficulty[difficultyQueryValues?.[query?.difficulty]],
    technologies,
    video,
    like: query?.search,
    expand: 'technologies',
  });
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset${querys}`);
  const data = await resp.json();
  return { resp, data };
};

export const getServerSideProps = async ({ locale, locales, query }) => {
  const t = await getT(locale, 'exercises');
  const { page } = query;
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const image = t('seo.image', { domain: ORIGIN_HOST });
  const currentLang = locale === 'en' ? 'us' : 'es';
  const exercises = []; // filtered exercises after removing repeated
  let arrExercises = []; // incoming exercises
  const { resp, data } = await fetchExercises(currentLang, page, query);

  arrExercises = Object.values(data.results);
  if (resp.status >= 200 && resp.status < 400) {
    log(`SUCCESS: ${arrExercises.length} Exercises fetched for /interactive-exercises`);
  } else {
    console.error(`Error ${resp.status}: fetching Exercises list for /interactive-exercises`);
  }

  const technologiesResponse = await fetch(
    `${process.env.BREATHECODE_HOST}/v1/registry/technology?type=exercise&limit=1000&lang=${locale}`,
    {
      Accept: 'application/json, text/plain, */*',
    },
  );
  const technologies = await technologiesResponse.json();

  if (technologiesResponse.status >= 200 && technologiesResponse.status < 400) {
    log(`SUCCESS: ${technologies.length} Technologies fetched for /interactive-exercises`);
  } else {
    console.error(`Error ${technologiesResponse.status}: fetching Exercises list for /interactive-exercises`);
  }

  for (let i = 0; i < arrExercises.length; i += 1) {
    // skip repeated exercises
    if (exercises.find((p) => arrExercises[i].slug === p.slug)) {
      continue;
    }
    exercises.push(arrExercises[i]);
  }

  const difficulties = ['beginner', 'easy', 'intermediate', 'hard'];

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
        disableStaticCanonical: true,
        disableHreflangs: true,
        keywords,
        card: 'large',
      },
      fallback: false,
      count: data?.count,
      exercises: exercises.map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
      technologyTags: technologies,
      difficulties,
    },
  };
};

function Exercices({ exercises, technologyTags, difficulties, count }) {
  const { t, lang } = useTranslation('exercises');
  const { filteredBy, setExerciseFilters } = useFilter();
  const router = useRouter();
  const search = getQueryString('search', '');
  const pageIsEnabled = getQueryString('page', false);
  const iconColor = useColorModeValue('#FFF', '#283340');

  const { technologies, difficulty, videoTutorials } = filteredBy.exercisesOptions;
  const techsQuery = router.query.techs;
  const difficultyQuery = router.query.difficulty;

  const technologiesActived = technologies.length || (techsQuery?.length > 0 ? techsQuery?.split(',')?.length : 0);

  const queryFunction = async () => {
    const paginatedResults = exercises;

    return {
      count,
      results: paginatedResults,
    };
  };

  const difficultyIsActive = () => {
    if (difficultyQuery?.length > 0) return 1;
    if (difficulty !== undefined && difficulty?.length > 0) return 1;
    return 0;
  };

  const currentFilters = technologiesActived
    + difficultyIsActive()
    + videoTutorials;

  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <Box height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <Box
        display="grid"
        gridTemplateColumns={{
          base: '.5fr repeat(12, 1fr) .5fr',
          md: '1.5fr repeat(12, 1fr) 1.5fr',
        }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Flex
          gridColumn="2 / span 12"
          width="100%"
          margin="0 auto"
          maxWidth="1280px"
          justifyContent="space-between"
          flexDirection={{ base: 'column', md: 'row' }}
          flex="1"
          gridGap="10px"
          padding={{ base: '3% 15px 4% 15px', md: '1.5% 0 1.5% 0' }}
        >
          <TitleContent title={t('title')} icon="strength" color={iconColor} margin={{ base: '0 0 10px 0', md: '0' }} />

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
      </Box>

      {/* margin={{ base: '0 4% 0 4%', md: '0 10% 0 10%' }} */}
      <GridContainer withContainer gridColumn="1 / span 10" maxWidth="1280px">
        <Text
          size="md"
          display="flex"
          padding={{ base: '30px 8%', md: '30px 28%' }}
          textAlign="center"
        >
          {t('description')}
        </Text>
        {(search?.length > 0 || currentFilters > 0 || !pageIsEnabled) ? (
          <ProjectsLoader
            articles={exercises}
            itemsPerPage={contentPerPage}
            lang={lang}
            fetchData={fetchExercises}
            count={count}
            searchQuery={search}
            options={{
              withoutImage: true,
              contextFilter: filteredBy.exercisesOptions,
              pagePath: '/interactive-exercises',

            }}
          />
        ) : (
          <PaginatedView
            queryFunction={queryFunction}
            options={{
              pagePath: '/interactive-exercises',
              contextFilter: filteredBy.exercisesOptions,
              contentPerPage,
              disableLangFilter: true,
            }}
          />
        )}
      </GridContainer>
    </Box>
  );
}

Exercices.propTypes = {
  exercises: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  technologyTags: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  difficulties: PropTypes.arrayOf(PropTypes.string),
  count: PropTypes.number.isRequired,
};
Exercices.defaultProps = {
  exercises: [],
  technologyTags: [],
  difficulties: [],
};

export default Exercices;
