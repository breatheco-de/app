/* eslint-disable no-console */
import { Box, useColorModeValue, Flex } from '@chakra-ui/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PropTypes from 'prop-types';
import Heading from '../../../common/components/Heading';
import Link from '../../../common/components/NextChakraLink';
import Text from '../../../common/components/Text';
import Icon from '../../../common/components/Icon';
import SimpleTable from '../../../js_modules/projects/SimpleTable';

export const getStaticPaths = async () => {
  const data = await fetch('https://breathecode.herokuapp.com/v1/registry/asset?type=project')
    .then((res) => res.json())
    .catch((err) => console.log(err));
  const paths = data.map((res) => ({
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

const ProjectSlug = ({ project }) => {
  console.log('PROJECT_DATA:', project);
  const commonBorderColor = useColorModeValue('#DADADA', 'gray.900');
  const commonTextColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      margin={{ base: '4% 4% 0 4%', md: '4% 10% 0 10%' }}
    >
      <Link
        href="/interactive-exercises"
        color={useColorModeValue('blue.600', 'blue.300')}
        display="inline-block"
        borderRadius="15px"
      >
        {'< Back to Projects'}
      </Link>

      <Flex height="100%">
        <Box flex="1">
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

          <Link
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            size="12px"
            color={useColorModeValue('blue.600', 'blue.300')}
          >
            {project.url}
          </Link>
        </Box>

        <Box
          backgroundColor={useColorModeValue('white', 'featuredDark')}
          width="350px"
          minWidth="250px"
          height="auto"
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
            <Box d="flex" alignItems="baseline" justifyContent="center">
              <Heading size="l" textAlign="center" justify="center" mt="0px" mb="0px">
                Goal
              </Heading>
            </Box>

            <Box d="flex" alignItems="baseline" justifyContent="center" flexDirection="column">
              <Text size="md" color={commonTextColor} textAlign="center" mt="10px" px="0px">
                BreatheCode Coding Projects tutorials and exercises for people learning to code or
                improving their coding skills
              </Text>
              <SimpleTable
                difficulty={project.difficulty}
                repository={project.url}
                duration={project.duration}
                videoAvailable={project.intro_video_url}
                technologies={project.technologies}
                liveDemoAvailable={project.intro_video_url}
              />
            </Box>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

ProjectSlug.propTypes = {
  project: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default ProjectSlug;
