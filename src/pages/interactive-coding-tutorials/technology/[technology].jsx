import useTranslation from 'next-translate/useTranslation';
import {
  Box, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from '../../../common/components/Text';
import { toCapitalize } from '../../../utils';
import Heading from '../../../common/components/Heading';
import ProjectList from '../../../js_modules/projects/ProjectList';

export const getStaticPaths = async ({ locales }) => {
  const assetList = await import('../../../lib/asset-list.json')
    .then((res) => res.default)
    .catch(() => []);

  const data = assetList.landingTechnologies.filter(
    (l) => l.assets.some((a) => a.asset_type.toUpperCase() === 'PROJECT'),
  );

  const paths = data?.length > 0 ? data.flatMap((res) => locales.map((locale) => ({
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
  const assetList = await import('../../../lib/asset-list.json')
    .then((res) => res.default)
    .catch(() => []);

  const allTechnologiesList = assetList.landingTechnologies;
  const technologyData = allTechnologiesList.find((tech) => tech.slug === technology && tech.lang === locale);

  const dataFiltered = technologyData?.assets?.length > 0 ? technologyData.assets.filter(
    (l) => (l.asset_type.toUpperCase() === 'PROJECT'),
  ) : [];

  if (!technologyData || dataFiltered.length === 0) {
    return {
      notFound: true,
    };
  }

  const ogUrl = {
    en: `/interactive-coding-tutorials/technology/${technology}`,
    us: `/interactive-coding-tutorials/technology/${technology}`,
  };

  return {
    props: {
      seo: {
        title: technologyData?.title,
        description: '',
        image: technologyData?.icon_url || '',
        pathConnector: `/interactive-coding-tutorials/technology/${technology}`,
        url: ogUrl.en,
        type: 'website',
        card: 'default',
        locales,
        locale,
      },
      technologyData,
      fallback: false,
      projects: dataFiltered.map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
    },
  };
};

function ProjectsByTechnology({ projects, technologyData }) {
  const { t } = useTranslation('projects');

  // const translations = projects?.translations || { es: '', en: '', us: '' };

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

      {projects?.length > 0 && (
        <ProjectList
          projects={projects}
          // withoutImage
          // isLoading={isLoading}
          // contextFilter={}
          projectPath="interactive-coding-tutorial"
          pathWithDifficulty
          notFoundMessage={t('common:asset-not-found-in-current-language')}
        />
      )}
    </Box>
  );
}

ProjectsByTechnology.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))).isRequired,
  technologyData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

export default ProjectsByTechnology;
