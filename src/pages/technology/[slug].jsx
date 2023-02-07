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
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/academy/technology?limit=1000`, {
    method: 'GET',
    headers: {
      Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
      Academy: 4,
    },
  });
  const data = await resp.json();

  const paths = data.results.flatMap((res) => locales.map((locale) => ({
    params: {
      slug: res.slug,
    },
    locale,
  })));

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps = async ({ params, locale, locales }) => {
  const { slug } = params;
  const currentLang = locale === 'en' ? 'us' : 'es';

  const responseTechs = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/academy/technology?slug=${slug}&limit=1000`, {
    method: 'GET',
    headers: {
      Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
      Academy: 4,
    },
  });
  const techs = await responseTechs.json(); // array of objects
  const technologyData = techs.results.find((tech) => tech.slug === slug);
  const responseAssetsList = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?limit=9000`);
  const allAssetList = await responseAssetsList.json();

  if (allAssetList?.status < 400) {
    return {
      notFound: true,
    };
  }

  const allAssetsFiltered = allAssetList.results.filter(
    (l) => technologyData.assets.some((a) => a === l.slug),
  );

  const lessonsFiltered = allAssetsFiltered.filter(
    (l) => l?.asset_type.toUpperCase() === 'LESSON',
  );
  const projectsFiltered = allAssetsFiltered.filter(
    (l) => l?.asset_type.toUpperCase() === 'PROJECT',
  );
  const exercisesFiltered = allAssetsFiltered.filter(
    (l) => l?.asset_type.toUpperCase() === 'EXERCISE',
  );
  const howTosFiltered = allAssetsFiltered.filter(
    (l) => l?.category?.slug === 'how-to' || l?.category?.slug === 'como',
  );

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
      lessons: lessonsFiltered.filter((project) => project.lang === currentLang).map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
      projects: projectsFiltered.filter((project) => project.lang === currentLang).map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
      exercises: exercisesFiltered.filter((project) => project.lang === currentLang).map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
      howTos: howTosFiltered.filter((project) => project.lang === currentLang).map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
    },
  };
};

const LessonByTechnology = ({ lessons, projects, exercises, howTos, technologyData }) => {
  const { t } = useTranslation('technologies');

  return (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      pt="3rem"
      maxWidth="1280px"
      // margin={{ base: '0 4% 0 4%', md: '0 10% 0 10%' }}
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
          {technologyData?.description || t('description')}
        </Text>
      </Box>

      <Flex flexDirection="column" gridGap="3rem">
        {lessons.length > 0 && (
          <>
            <Box display="flex" flexDirection="column" gridGap="18px">
              <Heading size="sm" p="0">
                {t('lessons-section')}
              </Heading>
              <ProjectList
                projects={lessons}
                withoutImage
                projectPath="lesson"
              />
            </Box>
            <Box as="hr" borderColor="gray.300" margin="0 18px" />
          </>
        )}
        {exercises.length > 0 && (
          <>
            <Box display="flex" flexDirection="column" gridGap="18px">
              <Heading size="sm" p="0">
                {t('exercises-section')}
              </Heading>
              <ProjectList
                projects={exercises}
                withoutImage
                projectPath="interactive-exercise"
              />
            </Box>
            <Box as="hr" borderColor="gray.300" margin="0 18px" />
          </>
        )}
        {projects.length > 0 && (
          <>
            <Box display="flex" flexDirection="column" gridGap="18px">
              <Heading size="sm" p="0">
                {t('projects-section')}
              </Heading>
              <ProjectList
                projects={projects}
                withoutImage
                projectPath="interactive-coding-tutorial"
                pathWithDifficulty
              />
            </Box>
            {howTos.length ? <Box as="hr" borderColor="gray.300" margin="0 18px" /> : null}
          </>
        )}
        {howTos.length > 0 && (
          <Box display="flex" flexDirection="column" gridGap="18px">
            <Heading size="sm" p="0">
              {t('howTos-section')}
            </Heading>
            <ProjectList
              projects={howTos}
              withoutImage
              projectPath="how-to"
            />
          </Box>
        )}
      </Flex>
    </Box>
  );
};

LessonByTechnology.propTypes = {
  lessons: PropTypes.arrayOf(PropTypes.object),
  technologyData: PropTypes.objectOf(PropTypes.any).isRequired,
  projects: PropTypes.arrayOf(PropTypes.object),
  exercises: PropTypes.arrayOf(PropTypes.object),
  howTos: PropTypes.arrayOf(PropTypes.object),
};

LessonByTechnology.defaultProps = {
  lessons: [],
  projects: [],
  exercises: [],
  howTos: [],
};

export default LessonByTechnology;
