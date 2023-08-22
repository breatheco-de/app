/* eslint-disable no-continue */
import {
  Box, useColorModeValue, Button, Flex, useDisclosure,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import getT from 'next-translate/getT';
import { useRouter } from 'next/router';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import FilterModal from '../../common/components/FilterModal';
import TitleContent from '../../js_modules/projects/TitleContent';
import useFilter from '../../common/store/actions/filterAction';
import Search from '../../js_modules/projects/Search';
import GridContainer from '../../common/components/GridContainer';
import PaginatedView from '../../common/components/PaginationView';
import { getQueryString, isWindow } from '../../utils';
import ProjectsLoader from '../../common/components/ProjectsLoader';
import { parseQuerys } from '../../utils/url';

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'lesson');
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const image = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });
  const currentLang = locale === 'en' ? 'us' : 'es';
  const lessons = []; // filtered lessons after removing repeated
  let arrLessons = []; // incoming lessons
  const querys = parseQuerys({
    asset_type: 'LESSON,ARTICLE',
    visibility: 'PUBLIC',
    status: 'PUBLISHED',
    exclude_category: 'how-to,como',
    academy: process.env.WHITE_LABEL_ACADEMY || '4,5,6,47',
    limit: 2000,
  });
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset${querys}`);
  const data = await resp.json();

  arrLessons = Object.values(data?.results);
  if (resp.status !== undefined && resp.status >= 200 && resp.status < 400) {
    console.log(`SUCCESS: ${arrLessons.length} Lessons fetched for /lessons`);
  } else {
    console.error(`Error ${resp.status}: fetching Lessons list for /lessons`);
  }

  let technologyTags = [];
  let difficulties = [];

  const technologiesResponse = await fetch(
    `${process.env.BREATHECODE_HOST}/v1/registry/technology?type=lesson&limit=1000`,
    {
      Accept: 'application/json, text/plain, */*',
    },
  );
  const technologies = await technologiesResponse.json();

  if (technologiesResponse.status >= 200 && technologiesResponse.status < 400) {
    console.log(`SUCCESS: ${technologies.length} Technologies fetched for /lessons`);
  } else {
    console.error(`Error ${technologiesResponse.status}: fetching Exercises list for /lessons`);
  }

  for (let i = 0; i < arrLessons.length; i += 1) {
    // skip repeated lessons
    if (lessons.find((p) => arrLessons[i].slug === p.slug)) {
      continue;
    }
    lessons.push(arrLessons[i]);

    if (typeof arrLessons[i].technology === 'string') technologyTags.push(arrLessons[i].technology);
    if (Array.isArray(arrLessons[i].technologies)) {
      technologyTags = technologyTags.concat(arrLessons[i].technologies);
    }

    if (arrLessons[i].difficulty === null) arrLessons[i].difficulty = 'unknown';
    if (typeof arrLessons[i].difficulty === 'string' || arrLessons[i].difficulty === null) {
      if (arrLessons[i].difficulty === 'junior') arrLessons[i].difficulty = 'easy';
      else if (arrLessons[i].difficulty === 'semi-senior') arrLessons[i].difficulty = 'intermediate';
      else if (arrLessons[i].difficulty === 'senior') arrLessons[i].difficulty = 'hard';

      difficulties.push(arrLessons[i].difficulty);
    }
  }

  technologyTags = [...new Set(technologyTags)];
  difficulties = [...new Set(difficulties)];

  technologyTags = technologies.filter((technology) => technologyTags.includes(technology.slug.toLowerCase()));

  // Verify if difficulty exist in expected position, else fill void array with 'nullString'
  const verifyDifficultyExists = (difficultiesArray, difficulty) => {
    if (difficultiesArray.some((el) => el?.toLowerCase() === difficulty)) {
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
    en: '/lessons',
    us: '/lessons',
  };

  return {
    props: {
      seo: {
        title: t('seo.title'),
        description: t('seo.description'),
        image,
        keywords,
        locales,
        locale,
        disableStaticCanonical: true,
        url: ogUrl.en || `/${locale}/lessons`,
        pathConnector: '/lessons',
        card: 'default',
      },

      fallback: false,
      lessons: lessons.filter((lesson) => lesson?.lang === currentLang).map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
      technologyTags,
      difficulties: difficultiesSorted,
    },
  };
};

function Projects({ lessons, technologyTags, difficulties }) {
  const { t } = useTranslation('lesson');
  const { filteredBy, setProjectFilters } = useFilter();
  const { technologies, difficulty, videoTutorials } = filteredBy.projectsOptions;
  const router = useRouter();
  const iconColor = useColorModeValue('#FFF', '#283340');
  const page = getQueryString('page', 1);
  const pageIsEnabled = getQueryString('page', false);
  const search = getQueryString('search', '');

  const contentPerPage = 20;
  const startIndex = (page - 1) * contentPerPage;

  const queryFunction = async () => {
    const endIndex = startIndex + contentPerPage;
    const paginatedResults = lessons.slice(startIndex, endIndex);

    return {
      count: lessons.length,
      results: paginatedResults,
    };
  };

  const { isOpen, onClose, onOpen } = useDisclosure();
  const techsQuery = router.query.techs;
  const difficultyQuery = router.query.difficulty;

  const technologiesActived = technologies.length || (techsQuery?.length > 0 ? techsQuery?.split(',')?.length : 0);
  const difficultyIsActive = () => {
    if (difficultyQuery?.length > 0) return 1;
    if (difficulty !== undefined && difficulty?.length > 0) return 1;
    return 0;
  };

  const currentFilters = technologiesActived
    + difficultyIsActive()
    + videoTutorials;

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
          <TitleContent title={t('title')} icon="book" color={iconColor} margin={{ base: '0 0 10px 0', md: '0' }} />

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
              {currentFilters >= 2 ? t('common:filters') : t('common:filter')}
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
            contextFilter={filteredBy.projectsOptions}
            setFilter={setProjectFilters}
            technologyTags={technologyTags}
            difficulties={difficulties}
          />
        </Flex>
      </Box>

      <GridContainer
        flex="1"
        withContainer
        gridColumn="1 / span 10"
        maxWidth="1280px"
      >
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
            articles={lessons}
            itemsPerPage={20}
            // renderItem={false}
            searchQuery={search}
            options={{
              withoutImage: true,
              withoutDifficulty: true,
              contextFilter: filteredBy.projectsOptions,
              projectPath: 'lesson',
              pagePath: '/lessons',
            }}
          />
        ) : (
          <>
            {isWindow && (
              <PaginatedView
                queryFunction={queryFunction}
                options={{
                  projectPath: 'lesson',
                  pagePath: '/lessons',
                  contextFilter: filteredBy.projectsOptions,
                  contentPerPage,
                  disableLangFilter: false,
                }}
              />
            )}
          </>
        )}
      </GridContainer>
    </Box>
  );
}

Projects.propTypes = {
  technologyTags: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  lessons: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))).isRequired,
  difficulties: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Projects;
