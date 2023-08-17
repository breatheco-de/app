import useTranslation from 'next-translate/useTranslation';
import {
  Box, Flex, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from '../../common/components/Text';
import { toCapitalize } from '../../utils';
import Heading from '../../common/components/Heading';
import ProjectList from '../../js_modules/projects/ProjectList';

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

  const paths = data?.results?.length > 0 ? data.results.flatMap((res) => locales.map((locale) => ({
    params: {
      slug: res.slug,
    },
    locale,
  }))) : [];

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps = async ({ params, locale, locales }) => {
  const { slug } = params;
  const currentLang = locale === 'en' ? 'us' : 'es';
  const WHITE_LABLE_ACADEMY = process.env.WHITE_LABLE_ACADEMY || '4,5,6,47';

  const responseTechs = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/academy/technology?slug=${slug}&limit=1000&academy=${WHITE_LABLE_ACADEMY}`, {
    method: 'GET',
    headers: {
      Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
      Academy: 4,
    },
  });
  const techs = await responseTechs.json(); // array of objects
  const technologyData = techs.results.find((tech) => tech.slug === slug);
  const responseAssetsList = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?limit=9000&technologies=${slug}`);
  const allAssetList = await responseAssetsList.json();

  if (responseAssetsList?.status >= 400) {
    return {
      notFound: true,
    };
  }

  const data = allAssetList.results.filter((l) => {
    if (l?.asset_type.toUpperCase() === 'LESSON') {
      return true;
    }
    if (l?.asset_type.toUpperCase() === 'PROJECT') {
      return true;
    }
    if (l?.asset_type.toUpperCase() === 'EXERCISE') {
      return true;
    }
    if (l?.category) {
      return l?.category?.slug === 'how-to' || l?.category?.slug === 'como';
    }
    return false;
  });

  const ogUrl = {
    en: `/technology/${slug}`,
    us: `/technology/${slug}`,
  };

  return {
    props: {
      seo: {
        title: technologyData?.title,
        description: '',
        image: technologyData?.icon_url || '',
        pathConnector: `/technology/${slug}`,
        url: ogUrl.en,
        type: 'website',
        card: 'default',
        locales,
        locale,
      },
      fallback: false,
      technologyData,
      data: data.filter((project) => project.lang === currentLang).map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
    },
  };
};

function LessonByTechnology({ data, technologyData }) {
  const { t } = useTranslation('technologies');

  return (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      pt="3rem"
      maxWidth="1280px"
      margin="0 auto"
    >
      <Text
        as="h1"
        fontSize="15px"
        color={useColorModeValue('blue.default', 'blue.300')}
        display="inline-block"
        fontWeight="700"
        paddingBottom="6px"
      >
        {t('landing-technology.title', { technology: toCapitalize(technologyData.title) })}
      </Text>
      <Box flex="1" pb="2rem">
        <Heading as="span" size="xl">
          {t('landing-technology.subTitle', { technology: toCapitalize(technologyData.title) })}
        </Heading>

        <Text
          size="md"
          pt="0.6rem"
          width={{ base: '100%', md: '65%' }}
          display="flex"
          textAlign="left"
        >
          {technologyData?.description || t('description', { technology: technologyData.title })}
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
