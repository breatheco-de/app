/* eslint-disable no-continue */
import {
  Box,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import getT from 'next-translate/getT';
import { useRouter } from 'next/router';
import useFilter from '../../common/store/actions/filterAction';
import GridContainer from '../../common/components/GridContainer';
import PaginatedView from '../../common/components/PaginationView';
import { getQueryString, isWindow } from '../../utils';
import ProjectsLoader from '../../common/components/ProjectsLoader';
import AssetsHeader from '../../common/components/AssetsHeader';
import { parseQuerys } from '../../utils/url';
import { ORIGIN_HOST, WHITE_LABEL_ACADEMY, excludeCagetoriesFor } from '../../utils/variables';
import { log } from '../../utils/logging';
import { types } from '../../common/components/DynamicContentCard/card-types';

const contentPerPage = 20;

const fetchLessons = async (lang, page, query) => {
  const technologies = query.techs !== '' ? query.techs : undefined;
  const video = query.withVideo === 'true' ? query.withVideo : undefined;
  const { host } = query;
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
  const resp = await fetch(`${host || process.env.BREATHECODE_HOST}/v1/registry/asset${querys}`);
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

  const { host } = query;

  const technologiesResponse = await fetch(
    `${host || process.env.BREATHECODE_HOST}/v1/registry/technology?type=lesson&limit=1000&lang=${locale}`,
    {
      Accept: 'application/json, text/plain, */*',
    },
  );
  const technologies = await technologiesResponse.json();

  if (technologiesResponse.status >= 200 && technologiesResponse.status < 400) {
    log(`SUCCESS: ${technologies.results.length} Technologies fetched for /lessons`);
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
      technologyTags: technologies.results,
      difficulties,
    },
  };
};

function Lessons({ lessons, count }) {
  const { lang } = useTranslation('lesson');
  const { filteredBy } = useFilter();
  const { technologies, difficulty, videoTutorials } = filteredBy.projectsOptions;
  const router = useRouter();
  const pageIsEnabled = getQueryString('page', false);
  const search = getQueryString('search', '');

  const queryFunction = async () => {
    const paginatedResults = lessons;

    return {
      count,
      results: paginatedResults,
    };
  };

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
      <AssetsHeader type="lesson" mb="40px" />

      <GridContainer
        flex="1"
        withContainer
        gridColumn="1 / span 10"
        maxWidth="1280px"
        padding="0 15px"
      >

        {(search?.length > 0 || currentFilters > 0 || !pageIsEnabled) ? (
          <ProjectsLoader
            type={types.lesson}
            articles={lessons}
            itemsPerPage={contentPerPage}
            lang={lang}
            fetchData={fetchLessons}
            count={count}
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
                type={types.lesson}
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

Lessons.propTypes = {
  lessons: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))).isRequired,
  count: PropTypes.number.isRequired,
};

export default Lessons;
