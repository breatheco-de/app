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
import { WHITE_LABEL_ACADEMY } from '../../../utils/variables';

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
      technology: res.slug,
    },
    locale,
  }))) : [];

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps = async ({ params, locale, locales }) => {
  try {
    const { technology } = params;
    const currentLang = locale === 'en' ? 'us' : 'es';

    // Fetch technology data
    let techs;
    try {
      const responseTechs = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/academy/technology?slug=${technology}&limit=1000&academy=${WHITE_LABEL_ACADEMY}`, {
        method: 'GET',
        headers: {
          Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
          Academy: 4,
        },
      });
      techs = await responseTechs.json();
    } catch (error) {
      console.error('Error fetching technology data:', error);
      return { notFound: true };
    }

    const technologyData = techs.results?.find((tech) => tech.slug === technology);

    // Fetch exercises data
    let exercises;
    try {
      const qs = parseQuerys({
        asset_type: 'EXERCISE',
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
        academy: WHITE_LABEL_ACADEMY,
        limit: 1000,
        technologies: technology,
      });
      const response = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset${qs}`);
      exercises = await response.json();
    } catch (error) {
      console.error('Error fetching exercises data:', error);
      return { notFound: true };
    }

    const dataFiltered = exercises?.results || [];

    if (!technologyData || dataFiltered.length === 0) {
      return { notFound: true };
    }

    const ogUrl = {
      en: `/interactive-exercises/technology/${technology}`,
      us: `/interactive-exercises/technology/${technology}`,
    };

    return {
      props: {
        seo: {
          title: technologyData?.title,
          description: '',
          image: technologyData?.icon_url || '',
          pathConnector: `/interactive-exercises/technology/${technology}`,
          url: ogUrl.en,
          type: 'website',
          card: 'default',
          locales,
          locale,
        },
        fallback: false,
        technologyData,
        exercises: dataFiltered.filter((project) => project.lang === currentLang).map(
          (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
        ),
      },
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return { notFound: true };
  }
};

function ExercisesByTechnology({ exercises, technologyData }) {
  const { t } = useTranslation('exercises');

  // const translations = exercises?.translations || { es: '', en: '', us: '' };

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

      {exercises?.length > 0 && (
        <ProjectList
          projects={exercises}
          // withoutImage
          // isLoading={isLoading}
          // contextFilter={}
          projectPath="interactive-exercise"
          notFoundMessage={t('common:asset-not-found-in-current-language')}
        />
      )}
    </Box>
  );
}

ExercisesByTechnology.propTypes = {
  exercises: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))).isRequired,
  technologyData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

export default ExercisesByTechnology;
