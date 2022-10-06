import {
  Box, useColorModeValue, Flex, useToast, useColorMode, Skeleton,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useEffect } from 'react';
import useTranslation from 'next-translate/useTranslation';
import getT from 'next-translate/getT';
import Heading from '../../../common/components/Heading';
import Link from '../../../common/components/NextChakraLink';
import Text from '../../../common/components/Text';
import Icon from '../../../common/components/Icon';
import SimpleTable from '../../../js_modules/projects/SimpleTable';
import MarkDownParser from '../../../common/components/MarkDownParser/ReactMarkdown';
import { MDSkeleton } from '../../../common/components/Skeleton';
import getMarkDownContent from '../../../common/components/MarkDownParser/markdown';
import { publicRedirectByAsset } from '../../../lib/redirectsHandler';

export const getStaticPaths = async ({ locales }) => {
  let projects = [];
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?type=project`);
  const data = await resp.json();

  projects = Object.values(data);
  if (resp.status >= 200 && resp.status < 400) {
    console.log(`SUCCESS: ${projects.length} Projects fetched for /interactive-coding-tutorial`);
  } else {
    console.error(`Error ${resp.status}: fetching Projects list for /interactive-coding-tutorial`);
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
      difficulty: res.difficulty?.toLowerCase(),
    },
    locale,
  })));
  return {
    fallback: true,
    paths,
  };
};

export const getStaticProps = async ({ params, locale, locales }) => {
  const t = await getT(locale, 'projects');
  const { slug } = params;
  const staticImage = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });
  const response = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}?type=project`);
  const result = await response.json();

  if (response.status > 400 || result.asset_type !== 'PROJECT') {
    return {
      notFound: true,
    };
  }

  const {
    title, description, translations, preview,
  } = result;
  const markdownResp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}.md`);
  const markdown = await markdownResp.text();

  const difficulty = result.difficulty.toLowerCase();
  const ogUrl = {
    en: `/interactive-coding-tutorial/${difficulty}/${slug}`,
    us: `/interactive-coding-tutorial/${difficulty}/${slug}`,
  };

  return {
    props: {
      seo: {
        title,
        url: ogUrl.en || `/${locale}/interactive-coding-tutorial/${difficulty}/${slug}`,
        description: description || '',
        image: preview || staticImage,
        translations,
        pathConnector: `/interactive-coding-tutorial/${difficulty}`,
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
      },
      markdown,
      // translations: result?.translations || false,
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
        href="/interactive-coding-tutorials"
        difficulty={project.difficulty !== null && project.difficulty.toLowerCase()}
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
  const { slug, difficulty } = router.query;
  const language = router.locale === 'en' ? 'us' : 'es';
  const currentLanguageLabel = router.language === 'en' ? t('common:english') : t('common:spanish');

  const toast = useToast();

  useEffect(async () => {
    const alias = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/alias/redirect`);
    const aliasList = await alias.json();
    const redirectSlug = aliasList[slug] || slug;
    const dataRedirect = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${redirectSlug}`);
    const redirectResults = await dataRedirect.json();

    // const pathWithoutSlug = router.asPath.slice(0, router.asPath.lastIndexOf('/'));
    if (typeof redirectResults.difficulty === 'string') {
      if (redirectResults.difficulty === 'junior') redirectResults.difficulty = 'easy';
      else if (redirectResults.difficulty === 'semi-senior') redirectResults.difficulty = 'intermediate';
      else if (redirectResults.difficulty === 'senior') redirectResults.difficulty = 'hard';
    }

    const userPathName = `/${router.locale}/interactive-coding-tutorial/${redirectResults?.difficulty?.toLowerCase()}/${redirectResults?.slug || project?.slug || slug}`;
    const aliasRedirect = aliasList[slug] !== undefined && userPathName;
    const pagePath = `interactive-coding-tutorial/${difficulty}`;

    publicRedirectByAsset({
      router, aliasRedirect, translations, userPathName, pagePath,
    });
  }, [router, router.locale, translations]);

  useEffect(() => {
    axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}?type=project`)
      .then(({ data }) => {
        let currentlocaleLang = data.translations[language];
        if (currentlocaleLang === undefined) currentlocaleLang = `${slug}-${language}`;
        axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${currentlocaleLang}?asset_type=EXERCISE`)
          .catch(() => {
            toast({
              title: t('alert-message:language-not-found', { currentLanguageLabel }),
              status: 'warning',
              duration: 5500,
              isClosable: true,
            });
          });
      });
  }, [language]);

  return (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      margin={{ base: '2% 4% 0 4%', lg: '2% 10% 0 10%' }}
    >
      <Link
        href="/interactive-coding-tutorials"
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
          </Box>
        </Box>

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
      </Flex>
    </Box>
  );
};

ProjectSlug.propTypes = {
  project: PropTypes.objectOf(PropTypes.any).isRequired,
  markdown: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  // translations: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]).isRequired,
};

TableInfo.propTypes = {
  project: PropTypes.objectOf(PropTypes.any).isRequired,
  commonTextColor: PropTypes.string.isRequired,
  t: PropTypes.func,
};

TableInfo.defaultProps = {
  t: () => { },
};

export default ProjectSlug;
