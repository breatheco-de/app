/* eslint-disable react/prop-types */
/* eslint-disable no-continue */
import { Box, useColorMode } from '@chakra-ui/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Heading from '../common/components/Heading';
import Link from '../common/components/NextChakraLink';
import Text from '../common/components/Text';

export const getStaticProps = async ({ locale }) => {
  const projects = []; // filtered projects after removing repeated
  let arrProjects = []; // incoming projects
  const resp = await fetch('https://breathecode.herokuapp.com/v1/registry/asset?type=project')
    .then((res) => res.json())
    .catch((err) => console.error(err));
  // .then((res) => res.filter((l) => l.status === 'draft' || l.status === 'published'))

  arrProjects = Object.values(resp);
  if (resp.status >= 200 && resp.status < 400) {
    console.log(`Original projects: ${arrProjects}`);
  } else {
    console.error(`Error fetching projects with ${resp.status}`);
  }

  let technologyTags = [];
  let difficulties = [];

  for (let i = 0; i < arrProjects.length; i += 1) {
    // skip repeated projects
    if (projects.find((p) => arrProjects[i].slug === p.slug)) {
      continue;
    }
    projects.push(arrProjects[i]);

    if (typeof arrProjects[i].technology === 'string') technologyTags.push(arrProjects[i].technology);
    if (Array.isArray(
      arrProjects[i].technologies,
    )) technologyTags = technologyTags.concat(arrProjects[i].technologies);

    if (typeof arrProjects[i].difficulty === 'string') {
      if (arrProjects[i].difficulty === 'junior') arrProjects[i].difficulty = 'easy';
      else if (arrProjects[i].difficulty === 'semi-senior') arrProjects[i].difficulty = 'intermediate';
      else if (arrProjects[i].difficulty === 'senior') arrProjects[i].difficulty = 'hard';

      difficulties.push(arrProjects[i].difficulty);
    }
  }

  technologyTags = [...new Set(technologyTags)];
  difficulties = [...new Set(difficulties)];

  return {
    // props: { data:..., slug:..., more... },
    props: {
      fallback: false,
      ...(await serverSideTranslations(locale, ['navbar', 'footer'])),
      projects,
      technologyTags,
      difficulties,
    },
  };
};

const Projects = ({
  projects, technologyTags, difficulties,
}) => {
  console.log('PROJECTS:', projects);
  console.log('TECHNOLOGY TAGS:', technologyTags);
  console.log('DIFFICULTIES:', difficulties);

  const { colorMode } = useColorMode();

  return (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      margin={{ base: '4% 4% 0 4%', md: '4% 10% 0 10%' }}
    >
      <Link href="/" display="inline-block" w="full" borderRadius="15px">
        {'< Back to Home'}
      </Link>

      <Box flex="1" margin={{ base: '4% 4% 0 4%', md: '4% 10% 0 10%' }}>
        {projects.map((project) => (
          <Box padding="15px 0" key={`${project.url}-gitpod:${project.gitpod}`}>
            <Heading
              as="h1"
              size="l"
              fontWeight="700"
              color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
              textTransform="uppercase"
            >
              {project.title}
            </Heading>
            <Text size="lg">{project.url}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Projects;
