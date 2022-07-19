/* eslint-disable no-param-reassign */
// import { useEffect } from 'react';
import useTranslation from 'next-translate/useTranslation';
// import axios from 'axios';
import {
  Box, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
// import { useRouter } from 'next/router';
import Text from '../../../common/components/Text';
// import getT from 'next-translate/getT';
import { toCapitalize } from '../../../utils';
import Heading from '../../../common/components/Heading';
// import Link from '../../../common/components/NextChakraLink';
import ProjectList from '../../../js_modules/projects/ProjectList';
// import { publicRedirectByAsset } from '../../lib/redirectsHandler';

export const getStaticPaths = async ({ locales }) => {
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/academy/technology`, {
    method: 'GET',
    headers: {
      Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
      Academy: 4,
    },
  });
  const data = await resp.json();

  const paths = data.flatMap((res) => locales.map((locale) => ({
    params: {
      technology: res.slug,
    },
    locale,
  })));

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps = async ({ params, locale }) => {
  // const t = await getT(locale, 'exercises');
  const { technology } = params;
  const currentLang = locale === 'en' ? 'us' : 'es';
  // const staticImage = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });

  const responseTechs = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/academy/technology`, {
    method: 'GET',
    headers: {
      Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
      Academy: 4,
    },
  });
  const techs = await responseTechs.json();
  const technologyData = techs.find((tech) => tech.slug === technology);

  const response = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?type=exercise&limit=1000`);
  const exercises = await response.json();

  const dataFiltered = exercises.results.filter(
    (l) => technologyData.assets.some((a) => a === l.slug),
  );

  if (response.status >= 400 || response.status_code >= 400
    || !technologyData || dataFiltered.length === 0) {
    return {
      notFound: true,
    };
  }

  // const ogUrl = {
  //   en: `/lesson/${slug}`,
  //   us: `/lesson/${slug}`,
  // };

  // const { title, description, translations } = lesson;
  // const translationsExists = Object.keys(translations).length > 0;

  return {
    props: {
      // seo: {
      //   title,
      //   description: description || '',
      //   image: lesson.preview || staticImage,
      //   pathConnector: translationsExists ? '/lesson' : `/lesson/${slug}`,
      //   url: ogUrl.en || `/${locale}/lesson/${slug}`,
      //   type: 'article',
      //   card: 'large',
      //   translations,
      //   locales,
      //   locale,
      //   keywords: lesson?.seo_keywords || '',
      //   publishedTime: lesson?.created_at || '',
      //   modifiedTime: lesson?.updated_at || '',
      // },
      fallback: false,
      technologyData,
      exercises: dataFiltered.filter((project) => project.lang === currentLang).map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
      // translations: lesson.translations,
    },
  };
};

const ExercisesByTechnology = ({ exercises, technologyData }) => {
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
          // padding={{ base: '30px 8%', md: '30px 28%' }}
          textAlign="left"
        >
          {technologyData?.description || t('description')}
        </Text>
      </Box>

      <ProjectList
        projects={exercises}
        // withoutImage
        // isLoading={isLoading}
        // contextFilter={}
        projectPath="interactive-exercise"
      />
    </Box>
  );
};

ExercisesByTechnology.propTypes = {
  exercises: PropTypes.arrayOf(PropTypes.object).isRequired,
  technologyData: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default ExercisesByTechnology;
