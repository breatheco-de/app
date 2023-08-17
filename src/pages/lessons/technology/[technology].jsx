import useTranslation from 'next-translate/useTranslation';
import {
  Box, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from '../../../common/components/Text';
import { toCapitalize } from '../../../utils';
import Heading from '../../../common/components/Heading';
import ProjectList from '../../../js_modules/projects/ProjectList';
import { parseQuerys } from '../../../utils/url';

export const getStaticPaths = async ({ locales }) => {
  const WHITE_LABLE_ACADEMY = process.env.WHITE_LABLE_ACADEMY || '4,5,6,47';
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/academy/technology?limit=1000&academy=${WHITE_LABLE_ACADEMY}`, {
    method: 'GET',
    headers: {
      Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
      Academy: 4,
    },
  });
  const data = resp?.status > 400 ? {} : await resp?.json();

  const paths = data?.results?.length > 0 ? data?.results?.flatMap((res) => locales.map((locale) => ({
    params: {
      technology: res?.slug,
    },
    locale,
  }))) : [];

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps = async ({ params, locale, locales }) => {
  const { technology } = params;
  const currentLang = locale === 'en' ? 'us' : 'es';
  const WHITE_LABLE_ACADEMY = process.env.WHITE_LABLE_ACADEMY || '4,5,6,47';

  const responseTechs = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/academy/technology?slug=${technology}&limit=1000&academy=${WHITE_LABLE_ACADEMY}`, {
    method: 'GET',
    headers: {
      Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
      Academy: 4,
    },
  });
  const techs = await responseTechs.json(); // array of objects
  const technologyData = techs.results.find((tech) => tech.slug === technology);

  const qs = parseQuerys({
    asset_type: 'LESSON,ARTICLE',
    visibility: 'PUBLIC',
    status: 'PUBLISHED',
    exclude_category: 'how-to,como',
    academy: process.env.WHITE_LABLE_ACADEMY || '4,5,6,47',
    limit: 1000,
    technologies: technology,
  });

  const response = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset${qs}`);
  const lessons = await response.json();

  const dataFiltered = lessons?.results;

  if (responseTechs.status >= 400 || response.status_code >= 400
    || !technologyData || dataFiltered.length === 0) {
    return {
      notFound: true,
    };
  }

  const ogUrl = {
    en: `/lessons/technology/${technology}`,
    us: `/lessons/technology/${technology}`,
  };

  return {
    props: {
      seo: {
        title: technologyData?.title,
        description: '',
        image: technologyData?.icon_url || '',
        pathConnector: `/lessons/technology/${technology}`,
        url: ogUrl.en,
        type: 'website',
        card: 'default',
        locales,
        locale,
      },
      fallback: false,
      technologyData,
      lessons: dataFiltered.filter((project) => project.lang === currentLang).map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
    },
  };
};

function LessonByTechnology({ lessons, technologyData }) {
  const { t } = useTranslation('lesson');

  // const translations = lessons?.translations || { es: '', en: '', us: '' };

  return (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      pt="3rem"
      margin={{ base: '0 4% 0 4%', md: '0 10% 0 10%' }}
    >
      <Text
        as="h1"
        fontSize="15px"
        color={useColorModeValue('blue.default', 'blue.300')}
        display="inline-block"
        fontWeight="700"
        paddingBottom="6px"
      >
        {t('landing-technology.title', { technology: toCapitalize(technologyData?.title) })}
      </Text>
      <Box flex="1" pb="2rem">
        <Heading as="span" size="xl">
          {t('landing-technology.subTitle', { technology: toCapitalize(technologyData?.title) })}
        </Heading>

        <Text
          size="md"
          pt="0.6rem"
          width={{ base: '100%', md: '65%' }}
          display="flex"
          // padding={{ base: '30px 8%', md: '30px 28%' }}
          textAlign="left"
        >
          {technologyData?.description || t('description')}
        </Text>
      </Box>

      {lessons?.length > 0 && (
        <ProjectList
          projects={lessons}
          withoutImage
          // isLoading={isLoading}
          // contextFilter={}
          projectPath="lesson"
          notFoundMessage={t('common:asset-not-found-in-current-language')}
        />
      )}
    </Box>
  );
}

LessonByTechnology.propTypes = {
  lessons: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  technologyData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])).isRequired,
};

export default LessonByTechnology;
