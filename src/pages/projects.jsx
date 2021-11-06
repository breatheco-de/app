/* eslint-disable no-continue */
/* eslint-disable no-console */
import {
  Box,
  useColorModeValue,
  Input,
  Button,
  Flex,
  InputLeftElement,
  InputGroup,
  useDisclosure,
} from '@chakra-ui/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PropTypes from 'prop-types';
import Text from '../common/components/Text';
import Icon from '../common/components/Icon';
import FilterModal from '../common/components/FilterModal';
import TitleContent from '../js_modules/projects/TitleContent';
import ProjectList from '../js_modules/projects/ProjectList';

export const getStaticProps = async ({ locale }) => {
  const projects = []; // filtered projects after removing repeated
  let arrProjects = []; // incoming projects
  const resp = await fetch('https://breathecode.herokuapp.com/v1/registry/asset?type=project')
    .then((res) => res.json())
    .catch((err) => console.error(err));

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
    if (Array.isArray(arrProjects[i].technologies)) {
      technologyTags = technologyTags.concat(arrProjects[i].technologies);
    }

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
    props: {
      fallback: false,
      ...(await serverSideTranslations(locale, ['navbar', 'footer'])),
      projects,
      technologyTags,
      difficulties,
    },
  };
};

const Projects = ({ projects, technologyTags, difficulties }) => {
  console.log('PROJECTS:', projects);
  console.log('TECHNOLOGY TAGS:', technologyTags);
  console.log('DIFFICULTIES:', difficulties);

  // const filtered = projects.filter((item) => Helpers.contains(item.tags, filter));

  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <Box height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <TitleContent title="Projects" mobile />
      <Flex
        justifyContent="space-between"
        flex="1"
        gridGap="20px"
        padding={{ base: '3% 4% 4% 4%', md: '1.5% 10% 1.5% 10%' }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
      >
        <TitleContent title="Projects" mobile={false} />

        <InputGroup width={{ base: '-webkit-fill-available', md: '36rem' }}>
          <InputLeftElement pointerEvents="none">
            <Icon icon="search" color="gray" width="16px" height="16px" />
          </InputLeftElement>
          <Input
            id="search"
            width="100%"
            placeholder="Search Project"
            transition="all .2s ease"
            style={{
              borderRadius: '3px',
              backgroundColor: useColorModeValue('white', '#2D3748'),
            }}
          />
        </InputGroup>

        <Button
          variant="outline"
          backgroundColor={useColorModeValue('', 'gray.800')}
          _hover={{ backgroundColor: useColorModeValue('', 'gray.700') }}
          border={1}
          onClick={onOpen}
          borderStyle="solid"
          minWidth="125px"
          borderColor={useColorModeValue('#DADADA', 'gray.800')}
        >
          <Icon icon="setting" width="20px" height="20px" style={{ minWidth: '20px' }} />
          <Text textTransform="uppercase" pl="10px">
            Filter
          </Text>
        </Button>
        <FilterModal isOpen={isOpen} onClose={onClose} technologyTags={technologyTags} />
      </Flex>

      <Box flex="1" margin={{ base: '0 4% 0 4%', md: '0 10% 0 10%' }}>
        <Text
          size="md"
          display="flex"
          padding={{ base: '30px 8%', md: '30px 28%' }}
          textAlign="center"
        >
          Practice and develop your coding skills by building real live interactive autograded
          projects with solutions and video tutorials
        </Text>

        <ProjectList projects={projects} />
      </Box>
    </Box>
  );
};

Projects.propTypes = {
  technologyTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  difficulties: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Projects;
