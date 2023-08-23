import {
  Box, useColorModeValue, Flex, useColorMode, Skeleton,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useTranslation from 'next-translate/useTranslation';
import getT from 'next-translate/getT';
import Head from 'next/head';
import Heading from '../../common/components/Heading';
import Link from '../../common/components/NextChakraLink';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import SimpleTable from '../../js_modules/projects/SimpleTable';
import MarkDownParser from '../../common/components/MarkDownParser';
import { MDSkeleton } from '../../common/components/Skeleton';
import getMarkDownContent from '../../common/components/MarkDownParser/markdown';
import GridContainer from '../../common/components/GridContainer';
import MktRecommendedCourses from '../../common/components/MktRecommendedCourses';
import redirectsFromApi from '../../../public/redirects-from-api.json';
// import MktSideRecommendedCourses from '../../common/components/MktSideRecommendedCourses';
import { parseQuerys } from '../../utils/url';
import { cleanObject, unSlugifyCapitalize } from '../../utils/index';

export const getStaticPaths = async ({ locales }) => {
  const querys = parseQuerys({
    asset_type: 'PROJECT',
    visibility: 'PUBLIC',
    status: 'PUBLISHED',
    academy: process.env.WHITE_LABEL_ACADEMY || '4,5,6,47',
    limit: 2000,
  });
  let projects = [];
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset${querys}`);
  const data = await resp.json();

  projects = Object.values(data.results);
  if (resp.status >= 200 && resp.status < 400) {
    console.log(`SUCCESS: ${projects.length} Projects fetched for /interactive-coding-tutorial`);
  } else {
    console.error(`Error ${resp.status}: fetching Projects list for /interactive-coding-tutorial`);
  }

  for (let i = 0; i < projects.length; i += 1) {
    if (projects[i].difficulty === null) projects[i].difficulty = 'unknown';
    if (typeof projects[i].difficulty === 'string') {
      if (projects[i].difficulty?.toLowerCase() === 'junior') projects[i].difficulty = 'easy';
      else if (projects[i].difficulty?.toLowerCase() === 'semi-senior') projects[i].difficulty = 'intermediate';
      else if (projects[i].difficulty?.toLowerCase() === 'senior') projects[i].difficulty = 'hard';
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
  const engPrefix = {
    us: 'en',
    en: 'en',
  };

  const isCurrenLang = locale === engPrefix[result?.lang] || locale === result?.lang;

  if (response.status > 400 || result.asset_type !== 'PROJECT' || !isCurrenLang) {
    return {
      notFound: true,
    };
  }

  const {
    title, description, translations, preview,
  } = result;
  const markdownResp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}.md`);

  if (markdownResp.status >= 400) {
    return {
      notFound: true,
    };
  }
  const markdown = await markdownResp.text();

  const difficulty = typeof result.difficulty === 'string' ? result.difficulty.toLowerCase() : 'unknown';
  const ogUrl = {
    en: `/interactive-coding-tutorial/${slug}`,
    us: `/interactive-coding-tutorial/${slug}`,
  };

  const translationArray = [
    {
      value: 'us',
      lang: 'en',
      slug: translations?.us,
      link: `/interactive-coding-tutorial/${translations?.us}`,
    },
    {
      value: 'en',
      lang: 'en',
      slug: translations?.en,
      link: `/interactive-coding-tutorial/${translations?.en}`,
    },
    {
      value: 'es',
      lang: 'es',
      slug: translations?.es,
      link: `/es/interactive-coding-tutorial/${translations?.es}`,
    },
  ].filter((item) => translations?.[item?.value] !== undefined);

  const eventStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    name: result?.title,
    description: result?.description,
    url: `https://4geeks.com/${slug}`,
    image: `https://4geeks.com/thumbnail?slug=${slug}`,
    datePublished: result?.published_at,
    dateModified: result?.updated_at,
    author: result?.author ? {
      '@type': 'Person',
      name: `${result?.author?.first_name} ${result?.author?.last_name}`,
    } : null,
    keywords: result?.seo_keywords,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://4geeks.com/${slug}`,
    },
  };

  const cleanedStructuredData = cleanObject(eventStructuredData);

  return {
    props: {
      seo: {
        title,
        url: ogUrl.en || `/${locale}/interactive-coding-tutorial/${slug}`,
        slug,
        description: description || '',
        image: preview || staticImage,
        translations,
        pathConnector: '/interactive-coding-tutorial',
        type: 'article',
        keywords: result?.seo_keywords || '',
        card: 'large',
        locales,
        locale,
        publishedTime: result?.created_at || '',
        modifiedTime: result?.updated_at || '',
      },
      project: {
        ...result,
        difficulty,
        structuredData: cleanedStructuredData,
      },
      markdown,
      translations: translationArray,
    },
  };
};

function TableInfo({ t, project, commonTextColor }) {
  return (
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
          href="/interactive-coding-tutorials"
          difficulty={typeof project.difficulty === 'string' ? project.difficulty.toLowerCase() : 'unknown'}
          repository={project?.url}
          duration={project.duration}
          videoAvailable={project.solution_video_url}
          technologies={project.technologies}
          liveDemoAvailable={project.intro_video_url}
        />
      </Box>
    </>
  );
}

function ProjectSlug({ project, markdown }) {
  const { t } = useTranslation('projects');
  const markdownData = markdown ? getMarkDownContent(markdown) : '';
  const translations = project?.translations || { es: '', en: '' };
  const commonBorderColor = useColorModeValue('gray.250', 'gray.900');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  const { colorMode } = useColorMode();
  const router = useRouter();
  const { slug } = router.query;
  const { locale } = router;

  useEffect(() => {
    const redirect = redirectsFromApi?.find((r) => r?.source === `${locale === 'en' ? '' : `/${locale}`}/interactive-coding-tutorial/${slug}`);

    if (redirect) {
      router.push(redirect?.destination);
    }
  }, [router, router.locale, translations]);

  return (
    <>
      {project?.structuredData?.name && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(project.structuredData) }}
          />
        </Head>
      )}
      <GridContainer
        height="100%"
        flexDirection="column"
        justifyContent="center"
        margin="0 auto 2rem auto"
        padding="0 15px"
        gridGap="36px"
        gridTemplateColumns={{ base: 'repeat(12, 1fr)', lg: 'repeat(12, 1fr)' }}
        display={{ base: 'block', sm: 'grid' }}
      >
        <Flex display={{ base: 'block', lg: 'flex' }} gridColumn={{ base: '2 / span 10', lg: '2 / span 7' }} height="100%" gridGap="26px">
          <Box flex="1" width="-webkit-fill-available">
            <Link
              margin="3rem 0 32px 0"
              href="/interactive-coding-tutorials"
              color={useColorModeValue('blue.default', 'blue.300')}
              display="inline-block"
              letterSpacing="0.05em"
              width="fit-content"
              fontWeight="700"
            >
              {`← ${t('projects:backToProjects')}`}
            </Link>
            {project?.title ? (
              <Heading
                as="h1"
                size="l"
                fontWeight="700"
                padding="10px 0 35px 0"
                transition="color 0.2s ease-in-out"
                color={useColorModeValue('black', 'white')}
                textTransform="capitalize"
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
              minWidth={{ base: '100%', lg: '300px' }}
              maxWidth="350px"
              height="fit-content"
              borderWidth="0px"
              borderRadius="17px"
              overflow="hidden"
              border={1}
              borderStyle="solid"
              borderColor={commonBorderColor}
            >
              {project && project?.difficulty ? (
                <>
                  <Box d="flex" justifyContent="center">
                    <Icon icon="sideSupport" width="300px" height="70px" />
                  </Box>
                  <Box px="22px" pb="30px" pt="20px">
                    <TableInfo t={t} project={project} commonTextColor={commonTextColor} />
                  </Box>
                </>
              ) : (
                <Skeleton height="100%" width="100%" borderRadius="17px" />
              )}
            </Box>

            {/* MARKDOWN SIDE */}
            <Box
              maxWidth="1012px"
              borderRadius="3px"
              background={useColorModeValue('white', 'darkTheme')}
              className={`markdown-body ${colorMode === 'light' ? 'light' : 'dark'}`}
              transition="background .2s ease"
            >
              {typeof markdown === 'string' ? (
                <MarkDownParser content={markdownData.content} withToc />
              ) : (
                <MDSkeleton />
              )}
              <MktRecommendedCourses
                marginTop="15px"
                title={t('common:continue-learning', { technologies: project?.technologies.map((tech) => unSlugifyCapitalize(tech)).slice(0, 4).join(', ').replace(/-|_/g, ' ') })}
                technologies={project?.technologies.join(',')}
              />
            </Box>
          </Box>
        </Flex>
        <Box
          display={{ base: 'none', lg: 'flex' }}
          gridColumn="9 / span 3"
          flexDirection="column"
          backgroundColor={useColorModeValue('white', 'featuredDark')}
          margin="30px 0"
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
          {project && project?.difficulty ? (
            <>
              <Box d="flex" justifyContent="center">
                <Icon icon="sideSupport" width="300px" height="70px" />
              </Box>
              <Box px="22px" pb="30px" pt="20px">
                <TableInfo t={t} project={project} commonTextColor={commonTextColor} />
              </Box>
            </>
          ) : (
            <Skeleton height="646px" width="100%" borderRadius="17px" />
          )}
        </Box>
      </GridContainer>
    </>
  );
}

ProjectSlug.propTypes = {
  project: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  markdown: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  // translations: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]).isRequired,
};

TableInfo.propTypes = {
  project: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  commonTextColor: PropTypes.string.isRequired,
  t: PropTypes.func,
};

TableInfo.defaultProps = {
  t: () => { },
};

export default ProjectSlug;
