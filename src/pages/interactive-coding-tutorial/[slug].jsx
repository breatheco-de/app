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
import { cleanObject, unSlugifyCapitalize } from '../../utils/index';
import { ORIGIN_HOST } from '../../utils/variables';
import { getCacheItem, setCacheItem } from '../../utils/requests';
import { log } from '../../utils/logging';
import RelatedContent from '../../common/components/RelatedContent';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';

export const getStaticPaths = async ({ locales }) => {
  const assetList = await import('../../lib/asset-list.json');
  const data = assetList.projects;

  if (data?.length) {
    log(`SUCCESS: ${data?.length} Projects fetched for /interactive-coding-tutorial`);
  } else {
    console.error('Error: fetching Projects list for /interactive-coding-tutorial');
  }

  const paths = data.flatMap((res) => locales.map((locale) => ({
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
  const staticImage = t('seo.image', { domain: ORIGIN_HOST });

  try {
    let result;
    let markdown;
    result = await getCacheItem(slug);
    const langPrefix = locale === 'en' ? '' : `/${locale}`;

    if (!result) {
      console.log(`${slug} not found on cache`);
      const assetList = await import('../../lib/asset-list.json')
        .then((res) => res.default)
        .catch(() => []);
      result = assetList.projects.find((l) => l?.slug === slug);

      const engPrefix = {
        us: 'en',
        en: 'en',
      };

      const isCurrenLang = locale === engPrefix[result?.lang] || locale === result?.lang;

      if (result.asset_type !== 'PROJECT' || !isCurrenLang) {
        return {
          notFound: true,
        };
      }
      const markdownResp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}.md`);

      if (markdownResp.status >= 400) {
        return {
          notFound: true,
        };
      }
      markdown = await markdownResp.text();

      await setCacheItem(slug, { ...result, markdown });
    } else {
      markdown = result.markdown;
    }

    const {
      title, description, translations, preview,
    } = result;
    const difficulty = typeof result.difficulty === 'string' ? result.difficulty.toLowerCase() : 'unknown';
    const translationInEnglish = translations?.en || translations?.us;

    const translationArray = [
      {
        value: 'en',
        lang: 'en',
        slug: (result?.lang === 'en' || result?.lang === 'us') ? result?.slug : translationInEnglish,
        link: `/interactive-coding-tutorial/${(result?.lang === 'en' || result?.lang === 'us') ? result?.slug : translationInEnglish}`,
      },
      {
        value: 'es',
        lang: 'es',
        slug: result?.lang === 'es' ? result.slug : translations?.es,
        link: `/es/interactive-coding-tutorial/${result?.lang === 'es' ? result.slug : translations?.es}`,
      },
    ].filter((item) => item?.slug !== undefined);

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      name: result?.title,
      description: result?.description,
      url: `${ORIGIN_HOST}${langPrefix}/interactive-coding-tutorial/${slug}`,
      image: preview || staticImage,
      datePublished: result?.published_at,
      dateModified: result?.updated_at,
      author: result?.author ? {
        '@type': 'Person',
        name: `${result?.author?.first_name} ${result?.author?.last_name}`,
      } : null,
      keywords: result?.seo_keywords,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${ORIGIN_HOST}${langPrefix}/interactive-coding-tutorial/${slug}`,
      },
    };

    const cleanedStructuredData = cleanObject(structuredData);

    return {
      props: {
        seo: {
          title,
          url: `/interactive-coding-tutorial/${slug}`,
          slug,
          description: description || '',
          image: cleanedStructuredData.image,
          translations: translationArray,
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
  } catch (error) {
    console.error(`Error fetching page type PROJECT for /${locale}/interactive-coding-tutorial/${slug}`, error);
    return {
      notFound: true,
    };
  }
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
        <ReactPlayerV2
          title="Video tutorial"
          withModal
          url={project?.intro_video_url}
          withThumbnail
        />
        <SimpleTable
          href="/interactive-coding-tutorials"
          difficulty={typeof project.difficulty === 'string' ? project.difficulty.toLowerCase() : 'unknown'}
          repository={project?.url}
          duration={project.duration}
          videoAvailable={project.intro_video_url}
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
                title={t('common:continue-learning', { technologies: project?.technologies.map((tech) => tech?.title || unSlugifyCapitalize(tech)).slice(0, 4).join(', ').replace(/-|_/g, ' ') })}
                technologies={project?.technologies}
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
        {project?.slug && (
          <RelatedContent
            slug={project.slug}
            type="PROJECT"
            extraQuerys={{}}
            technologies={project?.technologies}
            gridColumn="2 / span 10"
            maxWidth="1280px"
          />
        )}
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
