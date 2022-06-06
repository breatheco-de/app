import {
  Box, useColorModeValue, Flex, useToast, useColorMode,
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
import MarkDownParser from '../../../common/components/MarkDownParser';
import { MDSkeleton } from '../../../common/components/Skeleton';
import getMarkDownContent from '../../../common/components/MarkDownParser/markdown';

export const getStaticPaths = async ({ locales }) => {
  let projects = [];
  const data = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?type=project`)
    .then((res) => res.json())
    .catch((err) => console.log(err));

  projects = Object.values(data);
  if (data.status >= 200 && data.status < 400) {
    console.log(`Original projects: ${projects}`);
  } else {
    console.error(`Error fetching projects with ${data.status}`);
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
      difficulty: res.difficulty,
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
  const result = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}?type=project`)
    .then((res) => res.json())
    .catch((err) => ({
      status: err.response.status,
    }));

  const {
    title, description, translations, preview,
  } = result;
  const markdown = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}.md`)
    .then((res) => res.text())
    .catch((err) => ({
      status: err.response.status,
    }));

  if (result.status === 404) {
    return {
      notFound: true,
    };
  }

  const ogUrl = {
    en: `/interactive-coding-tutorial/${result.difficulty}/${slug}`,
    us: `/interactive-coding-tutorial/${result.difficulty}/${slug}`,
  };

  return {
    props: {
      seo: {
        title,
        url: ogUrl[locale] || `/${locale}/interactive-coding-tutorial/${result.difficulty}/${slug}`,
        description: description || '',
        image: preview || staticImage,
        translations,
        pathConnector: `/interactive-coding-tutorial/${result.difficulty}`,
        type: 'article',
        keywords: result?.seo_keywords || '',
        card: 'large',
        locales,
        locale,
        publishedTime: result?.created_at || '',
        modifiedTime: result?.updated_at || '',
      },
      fallback: false,
      project: result,
      markdown,
      // translations: result.translations,
    },
  };
};

const TableInfo = ({ project, commonTextColor }) => (
  <>
    <Box d="flex" alignItems="baseline" justifyContent="center">
      <Heading size="l" textAlign="center" justify="center" mt="0px" mb="0px">
        Goal
      </Heading>
    </Box>

    <Box d="flex" alignItems="baseline" justifyContent="center" flexDirection="column">
      <Text size="md" color={commonTextColor} textAlign="center" my="10px" px="0px">
        4Geeks Coding Projects tutorials and exercises for people learning
        to code or improving their coding skills
      </Text>
      <SimpleTable
        difficulty={project.difficulty}
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
  const { t } = useTranslation(['projects']);
  const markdownData = getMarkDownContent(markdown);
  // const defaultImage = '/static/images/code1.png';
  // const getImage = project.preview !== '' ? project.preview : defaultImage;
  const commonBorderColor = useColorModeValue('#DADADA', 'gray.900');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  const { colorMode } = useColorMode();
  const router = useRouter();
  const { slug } = router.query;
  const language = router.locale === 'en' ? 'us' : 'es';
  const currentLanguageLabel = router.language === 'en' ? t('common:english') : t('common:spanish');

  const toast = useToast();

  const EventIfNotFound = () => {
    toast({
      title: t('alert-message:content-not-found', { lesson: t('common:project') }),
      // description: 'Content not found',
      status: 'error',
      duration: 7000,
      isClosable: true,
    });
  };

  useEffect(() => {
    if (typeof markdown !== 'string') {
      setTimeout(() => {
        EventIfNotFound();
      }, 4000);
    }
  }, [markdown]);

  useEffect(() => {
    axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}?type=exercise`)
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
  // const onImageNotFound = (event) => {
  //   event.target.setAttribute('src', defaultImage);
  //   event.target.setAttribute('srcset', `${defaultImage} 1x`);
  // };

  return (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      margin={{ base: '2% 4% 0 4%', lg: '2% 10% 0 10%' }}
    >
      <Link
        href="/projects"
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
          {/* <TagCapsule
            variant="rounded"
            tags={project.technologies}
            fontSize="13px"
            marginY="18px"
            fontWeight="700"
            style={{
              padding: '4px 12px',
              margin: '0',
            }}
            gap="10px"
            paddingX="0"
          /> */}
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

          {/* <Image
            width="100%"
            height={{ base: '190px', md: '400px' }}
            margin="30px 0"
            maxWidth="55rem"
            maxHeight="500px"
            minHeight={{ base: 'auto', md: '300px' }}
            priority
            borderRadius="3px"
            pos="relative"
            _groupHover={{
              _after: {
                filter: 'blur(50px)',
              },
            }}
            onError={(e) => onImageNotFound(e)}
            style={{ overflow: 'hidden' }}
            objectFit="cover"
            src={getImage}
            alt={project.title}
          /> */}
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
              <TableInfo project={project} commonTextColor={commonTextColor} />
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
            <TableInfo project={project} commonTextColor={commonTextColor} />
          </Box>
        </Box>
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
};

export default ProjectSlug;
