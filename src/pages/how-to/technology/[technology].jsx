import useTranslation from 'next-translate/useTranslation';
import {
  Box, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from '../../../common/components/Text';
import { toCapitalize } from '../../../utils';
import { WHITE_LABEL_ACADEMY } from '../../../utils/variables';
import Heading from '../../../common/components/Heading';
import ProjectList from '../../../js_modules/projects/ProjectList';
import { parseQuerys } from '../../../utils/url';

export const getStaticPaths = async ({ locales }) => {
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/academy/technology?limit=1000&academy=${WHITE_LABEL_ACADEMY}`, {
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

  const responseTechs = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/academy/technology?slug=${technology}&limit=1000&academy=${WHITE_LABEL_ACADEMY}`, {
    method: 'GET',
    headers: {
      Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
      Academy: 4,
    },
  });
  const techs = await responseTechs.json(); // array of objects
  const technologyData = techs.results.find((tech) => tech.slug === technology);

  const qs = parseQuerys({
    asset_type: 'ARTICLE',
    visibility: 'PUBLIC',
    status: 'PUBLISHED',
    academy: WHITE_LABEL_ACADEMY,
    limit: 1000,
    technologies: technology,
  });

  const response = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset${qs}`);
  const exercises = await response.json();

  const dataFiltered = exercises?.results?.filter(
    (l) => l?.category?.slug === 'how-to' || l?.category?.slug === 'como',
  );

  if (response.status >= 400 || response.status_code >= 400
    || !technologyData || dataFiltered?.length === 0) {
    return {
      notFound: true,
    };
  }

  const ogUrl = {
    en: `/how-to/technology/${technology}`,
    us: `/how-to/technology/${technology}`,
  };

  return {
    props: {
      seo: {
        title: technologyData?.title,
        description: '',
        image: technologyData?.icon_url || '',
        pathConnector: `/how-to/technology/${technology}`,
        url: ogUrl.en,
        type: 'website',
        card: 'default',
        locales,
        locale,
      },
      fallback: false,
      technologyData,
      articles: dataFiltered.filter((project) => project.lang === currentLang).map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
    },
  };
};

function ExercisesByTechnology({ articles, technologyData }) {
  const { t } = useTranslation('how-to');

  // const translations = articles?.translations || { es: '', en: '', us: '' };

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
          {technologyData?.description || t('landing-technology.description')}
        </Text>
      </Box>

      <ProjectList
        projects={articles}
        // withoutImage
        // isLoading={isLoading}
        // contextFilter={}
        projectPath="how-to"
        notFoundMessage={t('common:asset-not-found-in-current-language')}
      />
    </Box>
  );
}

ExercisesByTechnology.propTypes = {
  articles: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))).isRequired,
  technologyData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

export default ExercisesByTechnology;
