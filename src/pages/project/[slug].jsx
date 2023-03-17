import {
  Box, useColorModeValue, Flex, useColorMode, Skeleton,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useTranslation from 'next-translate/useTranslation';
import getT from 'next-translate/getT';
import Heading from '../../common/components/Heading';
import Link from '../../common/components/NextChakraLink';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import SimpleTable from '../../js_modules/projects/SimpleTable';
import MarkDownParser from '../../common/components/MarkDownParser';
import { MDSkeleton } from '../../common/components/Skeleton';
import getMarkDownContent from '../../common/components/MarkDownParser/markdown';
import redirectsFromApi from '../../../public/redirects-from-api.json';

export const getStaticPaths = async ({ locales }) => {
  let projects = [];
  const response = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?asset_type=project&limit=2000`);
  const data = await response.json();

  projects = Object.values(data.results);
  if (response.status >= 200 && response.status <= 400) {
    console.log(`SUCCESS: ${projects.length} Projects fetched for /project/[slug]`);
  } else {
    console.error(`Error ${response.status}: fetching Projects list for /project/[slug]`);
  }

  for (let i = 0; i < projects.length; i += 1) {
    if (projects[i].difficulty === null) projects[i].difficulty = 'unknown';
    if (typeof projects[i].difficulty === 'string') {
      if (projects[i].difficulty === 'junior') projects[i].difficulty = 'easy';
      else if (projects[i].difficulty === 'semi-senior') projects[i].difficulty = 'intermediate';
      else if (projects[i].difficulty === 'senior') projects[i].difficulty = 'hard';
    }
  }

  const paths = projects.flatMap((res) => locales.map((locale) => ({
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
  const t = await getT(locale, 'projects');
  const { slug } = params;
  const staticImage = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });
  const response = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}?asset_type=project`);
  const result = await response.json();
  const difficulty = typeof result.difficulty === 'string' ? result.difficulty?.toLowerCase() : 'unknown';

  const isNotCurrentPageLanguage = locale === 'en' ? result?.translations?.us !== slug : result?.translations?.[locale] !== slug;

  if (response.status >= 400 || response.status_code >= 400 || result.asset_type !== 'PROJECT' || isNotCurrentPageLanguage) {
    return {
      notFound: true,
    };
  }

  if (typeof difficulty === 'string') {
    if (difficulty === 'junior') result.difficulty = 'easy';
    else if (difficulty === 'semi-senior') result.difficulty = 'intermediate';
    else if (difficulty === 'senior') result.difficulty = 'hard';
  }

  const {
    title, translations, description, preview,
  } = result;
  const defaultSlug = translations?.us || translations?.en;

  const markdown = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}.md`)
    .then((res) => res.text());

  const ogUrl = {
    en: `/project/${defaultSlug}`,
    us: `/project/${defaultSlug}`,
  };

  if (result?.difficulty) {
    return {
      redirect: {
        destination: `/${locale}/interactive-coding-tutorial/${difficulty}/${locale === 'en' ? result?.translations?.us : result?.translations?.[locale]}`,
      },
    };
  }

  const translationArray = [
    {
      value: 'us',
      lang: 'en',
      slug: translations?.us,
      link: `/project/${translations?.us}`,
    },
    {
      value: 'en',
      lang: 'en',
      slug: translations?.en,
      link: `/project/${translations?.en}`,
    },
    {
      value: 'es',
      lang: 'es',
      slug: translations?.es,
      link: `/es/project/${translations?.es}`,
    },
  ].filter((item) => translations?.[item?.value] !== undefined);

  return {
    props: {
      seo: {
        type: 'article',
        title,
        image: preview || staticImage,
        description: description || '',
        url: ogUrl.en,
        slug,
        pathConnector: '/project',
        translations,
        keywords: result?.seo_keywords || '',
        card: 'default',
        publishedTime: result?.created_at || '',
        modifiedTime: result?.updated_at || '',
        locales,
        locale,
      },
      fallback: false,
      project: {
        ...result,
        difficulty: result?.difficulty,
      },
      markdown,
      translations: translationArray,
    },
  };
};

const TableInfo = ({ t, project, commonTextColor }) => (
  <>
    <Box d="flex" alignItems="baseline" justifyContent="center">
      <Heading size="l" textAlign="center" justify="center" mt="0px" mb="0px">
        {t('table.title')}
      </Heading>
    </Box>

    <Box d="flex" alignItems="baseline" justifyContent="center" flexDirection="column">
      <Text size="md" color={commonTextColor} textAlign="center" my="10px" px="0px">
        {t('table.description')}
      </Text>
      <SimpleTable
        href="/interactive-coding-tutorial"
        difficulty={project?.difficulty}
        repository={project.url}
        duration={project.duration}
        videoAvailable={project.solution_video_url}
        technologies={project.technologies}
        liveDemoAvailable={project.intro_video_url}
      />
    </Box>
  </>
);

const ProjectSlug = ({ project, markdown }) => {
  const { t } = useTranslation('projects');
  const markdownData = markdown ? getMarkDownContent(markdown) : '';
  const translations = project?.translations || { es: '', en: '' };
  const commonBorderColor = useColorModeValue('gray.250', 'gray.900');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  const { colorMode } = useColorMode();
  const router = useRouter();
  const { slug } = router.query;
  const { locale } = router;

  useEffect(async () => {
    const redirect = redirectsFromApi?.find((r) => r?.source === `${locale === 'en' ? '' : `/${locale}`}/project/${slug}`);

    if (redirect) {
      router.push(redirect?.destination);
    }
  }, [router, router.locale, translations]);

  return (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      margin={{ base: '2% 4% 0 4%', lg: '2% 10% 0 10%' }}
    >
      <Link
        href="/interactive-coding-tutorial"
        color={useColorModeValue('blue.default', 'blue.300')}
        display="inline-block"
        letterSpacing="0.05em"
        fontWeight="700"
        paddingBottom="10px"
      >
        {`← ${t('projects:backToProjects')}`}
      </Link>

      <Flex height="100%" gridGap="26px">
        <Box flex="1">
          {project?.title ? (
            <Heading
              as="h1"
              size="25px"
              fontWeight="700"
              padding="10px 0 35px 0"
              transition="color 0.2s ease-in-out"
              color={useColorModeValue('black', 'white')}
              textTransform="uppercase"
            >
              {project.title}
            </Heading>
          ) : (
            <Skeleton height="45px" width="100%" m="22px 0 35px 0" borderRadius="10px" />
          )}
          <Box
            display={{ base: 'flex', lg: 'none' }}
            flexDirection="column"
            backgroundColor={useColorModeValue('white', 'featuredDark')}
            margin="30px 0"
            // width={{ base: '100%', md: '350px' }}
            minWidth={{ base: '100%', md: '300px' }}
            maxWidth="350px"
            height="fit-content"
            borderWidth="0px"
            borderRadius="17px"
            overflow="hidden"
            border={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
          >
            <Box d="flex" justifyContent="center">
              <Icon icon="sideSupport" width="300px" height="70px" />
            </Box>
            <Box px="22px" pb="30px" pt="20px">
              {project?.difficulty ? (
                <TableInfo t={t} project={project} commonTextColor={commonTextColor} />
              ) : (
                <Skeleton height="646px" width="300px" borderRadius="17px" />
              )}
            </Box>
          </Box>

          {/* MARKDOWN SIDE */}
          <Box
            padding="28px 32px"
            maxWidth="1012px"
            borderRadius="3px"
            background={useColorModeValue('#F2F6FA', 'featuredDark')}
            // width={{ base: '34rem', md: '54rem' }}
            className={`markdown-body ${colorMode === 'light' ? 'light' : 'dark'}`}
            transition="background .2s ease"
          >
            {typeof markdown === 'string' ? (
              <MarkDownParser content={markdownData.content} withToc />
            ) : (
              <MDSkeleton />
            )}
          </Box>
        </Box>

        {project?.difficulty ? (
          <Box
            display={{ base: 'none', lg: 'flex' }}
            flexDirection="column"
            backgroundColor={useColorModeValue('white', 'featuredDark')}
            margin="30px 0"
            // minWidth={{ base: '100%', md: '250px' }}
            minWidth={{ base: '100%', md: '300px' }}
            maxWidth="350px"
            height="fit-content"
            borderWidth="0px"
            borderRadius="17px"
            overflow="hidden"
            border={1}
            borderStyle="solid"
            borderColor={commonBorderColor}
          >
            <Box d="flex" justifyContent="center">
              <Icon icon="sideSupport" width="300px" height="70px" />
            </Box>
            <Box px="22px" pb="30px" pt="20px">
              <TableInfo t={t} project={project} commonTextColor={commonTextColor} />
            </Box>
          </Box>
        ) : (
          <Box px="22px" pb="30px" pt="20px">
            <Skeleton height="646px" width="300px" borderRadius="17px" />
          </Box>
        )}
      </Flex>
    </Box>
  );
};

ProjectSlug.propTypes = {
  project: PropTypes.objectOf(PropTypes.any).isRequired,
  markdown: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

TableInfo.propTypes = {
  project: PropTypes.objectOf(PropTypes.any).isRequired,
  commonTextColor: PropTypes.string.isRequired,
  t: PropTypes.func,
};

TableInfo.defaultProps = {
  t: () => {},
};

export default ProjectSlug;
