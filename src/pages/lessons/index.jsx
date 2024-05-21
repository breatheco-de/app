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
import { ORIGIN_HOST, WHITE_LABEL_ACADEMY, excludeCagetoriesFor } from '../../utils/variables';
import { log } from '../../utils/logging';

const contentPerPage = 20;

const fetchLessons = async (lang, page, query) => {
  const technologies = query.techs !== '' ? query.techs : undefined;
  const video = query.withVideo === 'true' ? query.withVideo : undefined;
  const querys = parseQuerys({
    asset_type: 'LESSON,ARTICLE',
    status: 'PUBLISHED',
    exclude_category: excludeCagetoriesFor.lessons,
    language: lang,
    academy: WHITE_LABEL_ACADEMY,
    limit: contentPerPage,
    offset: page ? (page - 1) * contentPerPage : 0,
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
  const t = await getT(locale, 'lesson');
  const { page } = query;
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const image = t('seo.image', { domain: ORIGIN_HOST });
  const currentLang = locale === 'en' ? 'us' : 'es';
  const lessons = []; // filtered lessons after removing repeated
  let arrLessons = []; // incoming lessons
  const { resp, data } = await fetchLessons(currentLang, page, query);

  arrLessons = Object.values(data?.results);
  if (resp.status !== undefined && resp.status >= 200 && resp.status < 400) {
    log(`SUCCESS: ${arrLessons.length} Lessons fetched for /lessons`);
  } else {
    console.error(`Error ${resp.status}: fetching Lessons list for /lessons`);
  }

  const technologiesResponse = await fetch(
    `${process.env.BREATHECODE_HOST}/v1/registry/technology?type=lesson&limit=1000&lang=${locale}`,
    {
      Accept: 'application/json, text/plain, */*',
    },
  );
  const technologies = await technologiesResponse.json();

  if (technologiesResponse.status >= 200 && technologiesResponse.status < 400) {
    log(`SUCCESS: ${technologies.length} Technologies fetched for /lessons`);
  } else {
    console.error(`Error ${technologiesResponse.status}: fetching Exercises list for /lessons`);
  }

  for (let i = 0; i < arrLessons.length; i += 1) {
    // skip repeated lessons
    if (lessons.find((p) => arrLessons[i].slug === p.slug)) {
      continue;
    }
    lessons.push(arrLessons[i]);
  }

  const difficulties = ['beginner', 'easy', 'intermediate', 'hard'];

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
        disableHreflangs: true,
        url: ogUrl.en || `/${locale}/lessons`,
        pathConnector: '/lessons',
        card: 'default',
      },

      fallback: false,
      count: data?.count,
      lessons: lessons.map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
      technologyTags: technologies,
      difficulties,
    },
  };
};

function Projects({ lessons, technologyTags, difficulties, count }) {
  const { t, lang } = useTranslation('lesson');
  const { filteredBy, setProjectFilters } = useFilter();
  const { technologies, difficulty, videoTutorials } = filteredBy.projectsOptions;
  const router = useRouter();
  const iconColor = useColorModeValue('#FFF', '#283340');
  const pageIsEnabled = getQueryString('page', false);
  const search = getQueryString('search', '');

  const queryFunction = async () => {
    const paginatedResults = lessons;

    return {
      count,
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
            itemsPerPage={contentPerPage}
            lang={lang}
            fetchData={fetchLessons}
            count={count}
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
  count: PropTypes.number.isRequired,
};

export default Projects;
