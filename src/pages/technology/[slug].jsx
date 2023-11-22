import useTranslation from 'next-translate/useTranslation';
import {
  Box, Flex, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import getT from 'next-translate/getT';
import Text from '../../common/components/Text';
import { toCapitalize } from '../../utils';
import Heading from '../../common/components/Heading';
import ProjectList from '../../js_modules/projects/ProjectList';

export const getStaticPaths = async ({ locales }) => {
  const assetList = await import('../../lib/asset-list.json')
    .then((res) => res.default)
    .catch(() => []);

  const data = assetList.landingTechnologies;

  const paths = data?.length > 0 ? data.flatMap((res) => locales.map((locale) => ({
    params: {
      slug: res.slug,
    },
    locale,
  }))) : [];

  return {
    fallback: true,
    paths,
  };
};

export const getStaticProps = async ({ params, locale, locales }) => {
  const t = await getT(locale, 'technologies');
  const { slug } = params;
  const langList = {
    en: 'us',
    es: 'es',
  };

  const assetList = await import('../../lib/asset-list.json')
    .then((res) => res.default)
    .catch(() => []);

  const allTechnologiesList = assetList.landingTechnologies;
  const technologyData = allTechnologiesList.find((tech) => tech?.slug === slug && tech?.lang === locale) || {};
  const data = technologyData?.assets?.length > 0 ? technologyData.assets.filter((l) => {
    const assetType = l?.asset_type.toUpperCase();

    if (assetType === 'LESSON') return true;
    if (assetType === 'PROJECT') return true;
    if (assetType === 'EXERCISE') return true;
    if (l?.category) {
      return l?.category?.slug === 'how-to' || l?.category?.slug === 'como';
    }
    return false;
  }) : [];

  const ogUrl = {
    en: `/technology/${slug}`,
    us: `/technology/${slug}`,
  };
  const dataByCurrentLanguage = data.filter((l) => l?.lang === langList?.[locale] || l.lang === locale);

  return {
    props: {
      seo: {
        title: technologyData?.title || '',
        description: t('seo.description', { technology: technologyData?.title }),
        image: technologyData?.icon_url || '',
        pathConnector: `/technology/${slug}`,
        url: ogUrl.en,
        type: 'website',
        card: 'default',
        locales,
        locale,
      },
      technologyData,
      data: dataByCurrentLanguage.map(
        (l) => ({ ...l, difficulty: l?.difficulty?.toLowerCase() || null }),
      ),
    },
  };
};

function LessonByTechnology({ data, technologyData }) {
  const { t } = useTranslation('technologies');
  const router = useRouter();

  useEffect(() => {
    if (!technologyData?.slug || data?.length === 0) {
      router.push('/');
    }
  }, [data]);

  return technologyData?.slug && data?.length > 0 && (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      pt="3rem"
      maxWidth="1280px"
      margin="3rem auto 0 auto"
      padding="0 10px"
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
          textAlign="left"
        >
          {technologyData?.description || t('description', { technology: technologyData?.title })}
        </Text>
      </Box>

      <Flex flexDirection="column" gridGap="3rem">
        <Box display="flex" flexDirection="column" gridGap="18px">
          <ProjectList
            projects={data}
            withoutImage
            isDynamic
            notFoundMessage={t('common:asset-not-found-in-current-language')}
          />
        </Box>
      </Flex>
    </Box>
  );
}

LessonByTechnology.propTypes = {
  data: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
  technologyData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  // projects: PropTypes.arrayOf(PropTypes.object),
  // exercises: PropTypes.arrayOf(PropTypes.object),
  // howTos: PropTypes.arrayOf(PropTypes.object),
};

LessonByTechnology.defaultProps = {
  data: [],
  // projects: [],
  // exercises: [],
  // howTos: [],
};

export default LessonByTechnology;
