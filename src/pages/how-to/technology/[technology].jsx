import useTranslation from 'next-translate/useTranslation';
import {
  Box, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import { toCapitalize } from '../../../utils';
import Heading from '../../../components/Heading';
import ProjectList from '../../../components/Assets/ProjectList';
import { parseQuerys } from '../../../utils/url';
import PublicPortalGate from '../../../components/PublicPortalGate';
import {
  withSafeStaticPaths,
  buildLocalePaths,
} from '../../../utils/staticGeneration';

export const getStaticPaths = async ({ locales }) => withSafeStaticPaths(async () => {
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/academy/technology?limit=1000`, {
    method: 'GET',
    headers: {
      Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
      Academy: 4,
    },
  });
  if (!resp.ok) {
    throw new Error(`academy technology fetch failed with status ${resp.status}`);
  }

  const data = await resp.json();
  return buildLocalePaths(data?.results || [], locales, 'technology');
});

export const getStaticProps = async ({ params, locale, locales }) => {
  const { technology } = params;
  const currentLang = locale === 'en' ? 'us' : 'es';

  try {
    const responseTechs = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/academy/technology?slug=${technology}&limit=1000`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
        Academy: 4,
      },
    });

    if (!responseTechs.ok) {
      console.error(`Error fetching technology data: ${responseTechs.status}`);
      return { notFound: true };
    }

    const techs = await responseTechs.json();
    const technologyData = techs.results?.find((tech) => tech.slug === technology);

    if (!technologyData) {
      return { notFound: true };
    }

    const qs = parseQuerys({
      asset_type: 'ARTICLE',
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
      limit: 1000,
      technologies: technology,
    });

    const response = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset${qs}`);

    if (!response.ok) {
      console.error(`Error fetching articles: ${response.status}`);
      return { notFound: true };
    }

    const exercises = await response.json();
    const dataFiltered = exercises?.results?.filter(
      (l) => l?.category?.slug === 'how-to' || l?.category?.slug === 'como',
    ) || [];

    if (dataFiltered.length === 0) {
      return { notFound: true };
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
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return { notFound: true };
  }
};

function ExercisesByTechnology({ articles, technologyData }) {
  const { t } = useTranslation('how-to');

  // const translations = articles?.translations || { es: '', en: '', us: '' };

  return (
    <PublicPortalGate alwaysHide>
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
    </PublicPortalGate>
  );
}

ExercisesByTechnology.propTypes = {
  articles: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))).isRequired,
  technologyData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

export default ExercisesByTechnology;
