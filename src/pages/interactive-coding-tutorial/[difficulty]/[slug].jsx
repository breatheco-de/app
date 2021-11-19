/* eslint-disable no-console */
import {
  Box, useColorModeValue, Flex, useToast, useColorMode,
} from '@chakra-ui/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Heading from '../../../common/components/Heading';
import Link from '../../../common/components/NextChakraLink';
import Text from '../../../common/components/Text';
import Icon from '../../../common/components/Icon';
import SimpleTable from '../../../js_modules/projects/SimpleTable';
import MarkDownParser from '../../../common/components/MarkDownParser';
import TagCapsule from '../../../common/components/TagCapsule';
import Image from '../../../common/components/Image';
import MDSkeleton from '../../../common/components/MDSkeleton';

export const getStaticPaths = async () => {
  let projects = [];
  const data = await fetch('https://breathecode.herokuapp.com/v1/registry/asset?type=project')
    .then((res) => res.json())
    .catch((err) => console.log(err));

  projects = Object.values(data);
  if (data.status >= 200 && data.status < 400) {
    console.log(`Original projects: ${projects}`);
  } else {
    console.error(`Error fetching projects with ${data.status}`);
  }

  for (let i = 0; i < projects.length; i += 1) {
    if (typeof projects[i].difficulty === 'string') {
      if (projects[i].difficulty === 'junior') projects[i].difficulty = 'easy';
      else if (projects[i].difficulty === 'semi-senior') projects[i].difficulty = 'intermediate';
      else if (projects[i].difficulty === 'senior') projects[i].difficulty = 'hard';
    }
  }

  const paths = projects.map((res) => ({
    params: {
      difficulty: res.difficulty,
      slug: res.slug,
    },
  }));
  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps = async ({ params, locale }) => {
  const { slug } = params;
  const results = await fetch('https://breathecode.herokuapp.com/v1/registry/asset?type=project')
    .then((res) => res.json())
    .then((data) => data.find((e) => e.slug === slug))
    .catch((err) => console.log(err));

  return {
    props: {
      fallback: false,
      ...(await serverSideTranslations(locale, ['navbar', 'footer'])),
      project: results,
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
        BreatheCode Coding Projects tutorials and exercises for people learning to code or improving
        their coding skills
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

const ProjectSlug = ({ project }) => {
  const [readme, setReadme] = useState('');
  const defaultImage = '/static/images/code1.png';
  const getImage = project.preview !== '' ? project.preview : defaultImage;
  const commonBorderColor = useColorModeValue('#DADADA', 'gray.900');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');
  const { colorMode } = useColorMode();

  const router = useRouter();
  const toast = useToast();

  const EventIfNotFound = () => {
    toast({
      title: 'The endpoint could not access the content of this Project',
      // description: 'Content not found',
      status: 'error',
      duration: 7000,
      isClosable: true,
    });
  };

  useEffect(() => {
    const language = router.query.lang || router.locale;

    if (project.readme_url !== null) {
      fetch(project.readme_url)
        .then((resp) => resp.text())
        .then((data) => {
          setReadme({ markdown: data, lang: language });
        })
        .catch((err) => {
          console.error('Error loading markdown file from github', err);
          setTimeout(() => {
            EventIfNotFound();
          }, 4000);
        });
    } else {
      setTimeout(() => {
        EventIfNotFound();
      }, 4000);
    }
  }, []);

  const onImageNotFound = (event) => {
    event.target.setAttribute('src', defaultImage);
    event.target.setAttribute('srcset', `${defaultImage} 1x`);
  };

  return (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      margin={{ base: '4% 4% 0 4%', md: '4% 10% 0 10%' }}
    >
      <Link
        href="/projects"
        color={useColorModeValue('blue.default', 'blue.300')}
        display="inline-block"
        letterSpacing="0.05em"
        fontWeight="700"
        paddingBottom="10px"
      >
        {'< Back to Projects'}
      </Link>

      <Flex height="100%" gridGap="26px">
        <Box flex="1">
          <TagCapsule
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
          />
          <Heading
            as="h1"
            size="25px"
            fontWeight="700"
            transition="color 0.2s ease-in-out"
            color={useColorModeValue('black', 'white')}
            textTransform="uppercase"
          >
            {project.title}
          </Heading>

          <Image
            width="100%"
            height={{ base: '190px', md: '400px' }}
            margin="30px 0"
            maxWidth="55rem"
            maxHeight="500px"
            minHeight={{ base: 'auto', md: '300px' }}
            priority
            borderRadius="15px"
            pos="relative"
            _groupHover={{
              _after: {
                filter: 'blur(50px)',
              },
            }}
            onError={(e) => onImageNotFound(e)}
            style={{ borderRadius: '15px', overflow: 'hidden' }}
            objectFit="cover"
            src={getImage}
            alt={project.title}
          />
          <Box
            display={{ base: 'flex', md: 'none' }}
            flexDirection="column"
            backgroundColor={useColorModeValue('white', 'featuredDark')}
            margin="30px 0"
            width={{ base: '100%', md: '350px' }}
            minWidth={{ base: '100%', md: '250px' }}
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
            borderRadius="3px"
            background={useColorModeValue('featuredLight', 'featuredDark')}
            width={{ base: '34rem', md: '54rem' }}
            className={`markdown-body ${colorMode === 'light' ? 'light' : 'dark'}`}
            transition="background .2s ease"
          >
            {readme.markdown ? <MarkDownParser content={readme.markdown} /> : <MDSkeleton />}
          </Box>
        </Box>

        <Box
          display={{ base: 'none', md: 'flex' }}
          flexDirection="column"
          backgroundColor={useColorModeValue('white', 'featuredDark')}
          margin="30px 0"
          width={{ base: '100%', md: '350px' }}
          minWidth={{ base: '100%', md: '250px' }}
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
};

TableInfo.propTypes = {
  project: PropTypes.objectOf(PropTypes.any).isRequired,
  commonTextColor: PropTypes.string.isRequired,
};

export default ProjectSlug;
