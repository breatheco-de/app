/* eslint-disable no-continue */
import {
  Box, Button, Flex, useColorModeValue, useDisclosure,
} from '@chakra-ui/react';
import getT from 'next-translate/getT';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
// import modifyEnv from '../../../modifyEnv';
import FilterModal from '../../common/components/FilterModal';
import GridContainer from '../../common/components/GridContainer';

import Icon from '../../common/components/Icon';
import PaginatedView from '../../common/components/PaginationView';
import ProjectsLoader from '../../common/components/ProjectsLoader';
import Text from '../../common/components/Text';
import useFilter from '../../common/store/actions/filterAction';
import Search from '../../js_modules/projects/Search';
import TitleContent from '../../js_modules/projects/TitleContent';
import { getQueryString } from '../../utils';
import { ORIGIN_HOST, WHITE_LABEL_ACADEMY } from '../../utils/variables';
import { parseQuerys } from '../../utils/url';
import { log } from '../../utils/logging';

const contentPerPage = 20;

const fetchArticles = async (lang, page, query) => {
  const categories = {
    us: 'how-to',
    en: 'how-to',
    es: 'como',
  };
  const difficulty = {
    junior: 'BEGINNER,EASY',
    'mid-level': 'INTERMEDIATE',
    senior: 'HARD',
  };
  const technologies = query.techs !== '' ? query.techs : undefined;
  const video = query.withVideo === 'true' ? query.withVideo : undefined;
  const querys = parseQuerys({
    asset_type: 'ARTICLE',
    status: 'PUBLISHED',
    academy: WHITE_LABEL_ACADEMY,
    language: lang,
    limit: contentPerPage,
    category: categories[lang],
    offset: page ? (page - 1) * contentPerPage : 0,
    difficulty: difficulty[query.difficulty],
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
  const t = await getT(locale, 'how-to');
  const { page } = query;
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const image = t('seo.image', { domain: ORIGIN_HOST });
  const currentLang = locale === 'en' ? 'us' : 'es';
  const howTos = []; // filtered howTos after removing repeated
  let arrHowTos = []; // incoming howTos

  const { resp, data } = await fetchArticles(currentLang, page, query);
  arrHowTos = Object.values(data.results);
  if (resp.status >= 200 && resp.status < 400) {
    log(`SUCCESS: ${arrHowTos.length} How To's fetched`);
  } else {
    console.error(`Error ${resp.status}: fetching How To's list for /how-to`);
  }

  const technologiesResponse = await fetch(
    `${process.env.BREATHECODE_HOST}/v1/registry/technology?type=ARTICLE&limit=1000&lang=${locale}`,
    {
      Accept: 'application/json, text/plain, */*',
    },
  );
  const technologies = await technologiesResponse.json();

  if (technologiesResponse.status >= 200 && technologiesResponse.status < 400) {
    log(`SUCCESS: ${technologies.length} Technologies fetched for /how-to`);
  } else {
    console.error(`Error ${technologiesResponse.status}: fetching Exercises list for /how-to`);
  }

  for (let i = 0; i < arrHowTos.length; i += 1) {
    // skip repeated howTos
    if (howTos.find((p) => arrHowTos[i].slug === p.slug)) {
      continue;
    }
    howTos.push(arrHowTos[i]);
  }

  const difficulties = ['beginner', 'easy', 'intermediate', 'hard'];

  const ogUrl = {
    en: '/how-to',
    us: '/how-to',
  };

  return {
    props: {
      // meta tags props
      seo: {
        title: t('seo.title'),
        description: t('seo.description'),
        keywords,
        image,
        locales,
        locale,
        disableStaticCanonical: true,
        disableHreflangs: true,
        url: ogUrl.en || `/${locale}/how-to`,
        pathConnector: '/how-to',
      },

      // page props
      fallback: false,
      count: data?.count,
      data: arrHowTos.map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
      technologyTags: technologies,
      difficulties,
    },
  };
};

export default function HowTo({ data, technologyTags, difficulties, count }) {
  // log(data.filter((l) => l.title === 'How to print in javascript'));
  const { t, lang } = useTranslation('how-to');
  const router = useRouter();
  const { filteredBy, setHowToFilters } = useFilter();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const iconColor = useColorModeValue('#FFF', '#283340');
  const search = getQueryString('search', '');
  const pageIsEnabled = getQueryString('page', false);

  const { technologies, difficulty, videoTutorials } = filteredBy.howToOptions;

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
    const paginatedResults = data;

    return {
      count,
      results: paginatedResults,
    };
  };

  return (
    <>
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
          padding={{ base: '3% 0 4% 0', md: '1.5% 0 1.5% 0' }}
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
            contextFilter={filteredBy.exercisesOptions}
            setFilter={setHowToFilters}
            technologyTags={technologyTags}
            difficulties={difficulties}
          />
        </Flex>
      </Box>
      <GridContainer margin="30px auto 0 auto" withContainer gridColumn="1 / span 10" maxWidth="1280px">
        <Text
          size="md"
          display="flex"
          margin={{ base: '30px 8%', md: '30px 28%' }}
          textAlign="center"
        >
          {t('description')}
        </Text>
        {(search?.length > 0 || currentFilters > 0 || !pageIsEnabled) ? (
          <ProjectsLoader
            articles={data}
            itemsPerPage={contentPerPage}
            count={count}
            lang={lang}
            fetchData={fetchArticles}
            searchQuery={search}
            options={{
              withoutImage: true,
              contextFilter: filteredBy.howToOptions,
              pagePath: '/how-to',
            }}
          />
        ) : (
          <PaginatedView
            queryFunction={queryFunction}
            options={{
              pagePath: '/how-to',
              contextFilter: filteredBy.howToOptions,
              contentPerPage,
              disableLangFilter: true,
            }}
          />
        )}
      </GridContainer>
    </>
  );
}

HowTo.propTypes = {
  data: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  technologyTags: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  difficulties: PropTypes.arrayOf(PropTypes.string),
  count: PropTypes.number.isRequired,
};

HowTo.defaultProps = {
  data: [],
  technologyTags: [],
  difficulties: [],
};
