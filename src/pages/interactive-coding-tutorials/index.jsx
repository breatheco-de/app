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
import { getQueryString } from '../../utils';
import PaginatedView from '../../common/components/PaginationView';
import ProjectsLoader from '../../common/components/ProjectsLoader';
import { parseQuerys } from '../../utils/url';

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'projects');
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const image = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });
  const currentLang = locale === 'en' ? 'us' : 'es';
  const projects = []; // filtered projects after removing repeated
  let arrProjects = []; // incoming projects
  const querys = parseQuerys({
    asset_type: 'PROJECT',
    visibility: 'PUBLIC',
    status: 'PUBLISHED',
    academy: process.env.WHITE_LABLE_ACADEMY || '4,5,6,47',
    limit: 2000,
  });

  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset${querys}`);
  const data = await resp.json();

  arrProjects = Object.values(data.results);
  if (resp.status >= 200 && resp.status < 400) {
    console.log(`SUCCESS: ${arrProjects.length} Projects fetched`);
  } else {
    console.error(`Error ${resp.status}: fetching Projects list for /interactive-coding-tutorials`);
  }

  let technologyTags = [];
  let difficulties = [];

  const technologiesResponse = await fetch(
    `${process.env.BREATHECODE_HOST}/v1/registry/technology?type=project&limit=1000`,
    {
      Accept: 'application/json, text/plain, */*',
    },
  );
  const technologies = await technologiesResponse.json();

  if (technologiesResponse.status >= 200 && technologiesResponse.status < 400) {
    console.log(`SUCCESS: ${technologies.length} Technologies fetched for /interactive-coding-tutorials`);
  } else {
    console.error(`Error ${technologiesResponse.status}: fetching Exercises list for /interactive-coding-tutorials`);
  }

  for (let i = 0; i < arrProjects.length; i += 1) {
    // skip repeated projects
    if (projects.find((p) => arrProjects[i].slug === p.slug)) {
      continue;
    }
    projects.push(arrProjects[i]);

    if (typeof arrProjects[i].technology === 'string') technologyTags.push(arrProjects[i].technology);
    if (Array.isArray(arrProjects[i].technologies)) {
      technologyTags = technologyTags.concat(arrProjects[i].technologies);
    }

    if (arrProjects[i].difficulty === null) arrProjects[i].difficulty = 'unknown';
    if (typeof arrProjects[i].difficulty === 'string' || arrProjects[i].difficulty === null) {
      if (arrProjects[i].difficulty?.toLowerCase() === 'junior') arrProjects[i].difficulty = 'easy';
      else if (arrProjects[i].difficulty?.toLowerCase() === 'semi-senior') arrProjects[i].difficulty = 'intermediate';
      else if (arrProjects[i].difficulty?.toLowerCase() === 'senior') arrProjects[i].difficulty = 'hard';

      difficulties.push(arrProjects[i].difficulty);
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
    en: '/interactive-coding-tutorials',
    us: '/interactive-coding-tutorials',
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
        url: ogUrl.en || `/${locale}/interactive-coding-tutorials`,
        pathConnector: '/interactive-coding-tutorials',
        card: 'default',
      },

      fallback: false,
      projects: projects.filter((project) => project.lang === currentLang).map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
      technologyTags,
      difficulties: difficultiesSorted,
    },
  };
};

function Projects({ projects, technologyTags, difficulties }) {
  const { t } = useTranslation('projects');
  const { filteredBy, setProjectFilters } = useFilter();
  const iconColor = useColorModeValue('#FFF', '#283340');
  const router = useRouter();
  const { isOpen, onClose, onOpen } = useDisclosure();

  const page = getQueryString('page', 1);
  const search = getQueryString('search', '');
  const pageIsEnabled = getQueryString('page', false);

  const contentPerPage = 20;
  const startIndex = (page - 1) * contentPerPage;

  const { technologies, difficulty, videoTutorials } = filteredBy.projectsOptions;
  const techsQuery = router.query.techs;
  const difficultyQuery = router.query.difficulty;

  const technologiesActived = technologies.length || techsQuery?.split(',')?.length || 0;
  const difficultyIsActive = () => {
    if (difficultyQuery?.length > 0) return 1;
    if (difficulty !== undefined && difficulty?.length > 0) return 1;
    return 0;
  };

  const currentFilters = technologiesActived
    + difficultyIsActive()
    + videoTutorials;

  const queryFunction = async () => {
    const endIndex = startIndex + contentPerPage;
    const paginatedResults = projects.slice(startIndex, endIndex);

    return {
      count: projects.length,
      results: paginatedResults,
    };
  };

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
            contextFilter={filteredBy.projectsOptions}
            cardHeight="348px"
            setFilter={setProjectFilters}
            technologyTags={technologyTags}
            difficulties={difficulties}
          />
        </Flex>
      </Box>

      <GridContainer maxWidth="1280px" position="relative" withContainer gridColumn="1 / span 10">
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
            articles={projects}
            itemsPerPage={20}
            searchQuery={search}
            options={{
              withoutImage: true,
              contextFilter: filteredBy.projectsOptions,
              pagePath: '/interactive-coding-tutorials',
            }}
          />
        ) : (
          <PaginatedView
            queryFunction={queryFunction}
            options={{
              pagePath: '/interactive-coding-tutorials',
              contextFilter: filteredBy.projectsOptions,
              contentPerPage,
              disableLangFilter: true,
            }}
          />
        )}

      </GridContainer>
    </Box>
  );
}

Projects.propTypes = {
  technologyTags: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  projects: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))).isRequired,
  difficulties: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Projects;
