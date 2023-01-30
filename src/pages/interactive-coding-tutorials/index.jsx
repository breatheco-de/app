/* eslint-disable no-continue */
import {
  Box, useColorModeValue, Button, Flex, useDisclosure,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import getT from 'next-translate/getT';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import FilterModal from '../../common/components/FilterModal';
import TitleContent from '../../js_modules/projects/TitleContent';
import ProjectList from '../../js_modules/projects/ProjectList';
import useFilter from '../../common/store/actions/filterAction';
import Search from '../../js_modules/projects/Search';
import { isWindow } from '../../utils';
import GridContainer from '../../common/components/GridContainer';

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'projects');
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const image = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });
  const currentLang = locale === 'en' ? 'us' : 'es';
  const projects = []; // filtered projects after removing repeated
  let arrProjects = []; // incoming projects

  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?asset_type=project&limit=1000`);
  const data = await resp.json();
  // .then((res) => res.json())
  // .catch((err) => console.error(err));

  arrProjects = Object.values(data.results);
  if (resp.status >= 200 && resp.status < 400) {
    console.log(`SUCCESS: ${arrProjects.length} Projects fetched`);
  } else {
    console.error(`Error ${resp.status}: fetching Projects list for /interactive-coding-tutorials`);
  }

  let technologyTags = [];
  let difficulties = [];

  // const technologiesResponse = await fetch(
  //   `${process.env.BREATHECODE_HOST}/v1/registry/technology?asset_type=project&limit=1000`,
  //   {
  //     Accept: 'application/json, text/plain, */*',
  //   },
  // );

  const technologiesResponse = await fetch(
    `${process.env.BREATHECODE_HOST}/v1/registry/technology?type=project&limit=1000`,
    {
      Accept: 'application/json, text/plain, */*',
    },
  );

  if (technologiesResponse.status >= 200 && technologiesResponse.status < 400) {
    console.log(`SUCCESS: ${technologiesResponse.length} Technologies fetched for /interactive-coding-tutorials`);
  } else {
    console.error(`Error ${technologiesResponse.status}: fetching Exercises list for /interactive-coding-tutorials`);
  }

  const technologies = await technologiesResponse.json();

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

    if (arrProjects[i].difficulty === null) arrProjects[i].difficulty = 'unknown';
    if (typeof arrProjects[i].difficulty === 'string' || arrProjects[i].difficulty === null) {
      if (arrProjects[i].difficulty?.toLowerCase() === 'junior') arrProjects[i].difficulty = 'easy';
      else if (arrProjects[i].difficulty?.toLowerCase() === 'semi-senior') arrProjects[i].difficulty = 'intermediate';
      else if (arrProjects[i].difficulty?.toLowerCase() === 'senior') arrProjects[i].difficulty = 'hard';

      difficulties.push(arrProjects[i].difficulty);
    }
  }

  technologyTags = [...new Set(technologyTags)];
  difficulties = [...new Set(difficulties)];

  technologyTags = technologies.filter((technology) => technologyTags.includes(technology.slug.toLowerCase()));

  // Verify if difficulty exist in expected position, else fill void array with 'nullString'
  const verifyDifficultyExists = (difficultiesArray, difficulty) => {
    if (difficultiesArray.some((el) => el?.toLowerCase() === difficulty)) {
      return difficulty;
    }
    return 'nullString';
  };

  // Fill common difficulties in expected position
  const difficultiesSorted = [];
  ['beginner', 'easy', 'intermediate', 'hard'].forEach((difficulty) => {
    difficultiesSorted.push(verifyDifficultyExists(difficulties, difficulty));
  });

  const ogUrl = {
    en: '/interactive-coding-tutorials',
    us: '/interactive-coding-tutorials',
  };

  return {
    props: {
      seo: {
        title: t('seo.title'),
        description: t('seo.description'),
        image,
        keywords,
        locales,
        locale,
        url: ogUrl.en || `/${locale}/interactive-coding-tutorials`,
        pathConnector: '/interactive-coding-tutorials',
        card: 'default',
      },

      fallback: false,
      projects: projects.filter((project) => project.lang === currentLang).map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
      technologyTags,
      difficulties: difficultiesSorted,
    },
  };
};

const Projects = ({ projects, technologyTags, difficulties }) => {
  const { t } = useTranslation('projects');
  const { filteredBy, setProjectFilters } = useFilter();
  const iconColor = useColorModeValue('#FFF', '#283340');
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(10);
  const router = useRouter();
  const projectsFiltered = projects.slice(0, offset);
  const queryExists = Object.keys(router.query).length > 0;
  const projectsSearched = projects.filter(
    (project) => project.title.toLowerCase()
      .includes(router?.query?.search?.toLocaleLowerCase() || false),
  );

  const { technologies, difficulty, videoTutorials } = filteredBy.projectsOptions;
  const techsQuery = router.query.techs;
  const difficultyQuery = router.query.difficulty;

  const technologiesActived = technologies.length || techsQuery?.split(',')?.length || 0;
  const difficultyIsActive = () => {
    if (difficultyQuery?.length > 0) return 1;
    if (difficulty !== undefined && difficulty?.length > 0) return 1;
    return 0;
  };

  const currentFilters = technologiesActived
    + difficultyIsActive()
    + videoTutorials;

  const { isOpen, onClose, onOpen } = useDisclosure();

  const handleScroll = () => {
    const scrollTop = isWindow && document.documentElement.scrollTop;
    const offsetHeight = isWindow && document.documentElement.offsetHeight;
    const innerHeight = isWindow && window.innerHeight;
    if ((innerHeight + scrollTop) <= offsetHeight) return;
    setIsLoading(true);
  };

  useEffect(() => {
    if (!queryExists) {
      if (projectsSearched.length > 0) return () => { };
      if (offset <= projects.length) {
        console.log('loading projects...');
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      }
      console.log('All projects loaded');
    }
    return () => { };
  }, [offset, queryExists]);

  useEffect(() => {
    if (!isLoading) return;
    if (offset >= projects.length) setIsLoading(false);
    setTimeout(() => {
      setOffset(offset + 10);
      setIsLoading(false);
    }, 200);
  }, [isLoading]);

  const getProjects = () => {
    if (queryExists) {
      return projects;
    }
    if (projectsSearched.length > 0) {
      return projectsSearched;
    }
    return projectsFiltered;
  };

  return (
    <Box height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <TitleContent title={t('title')} mobile color={iconColor} />
      <Box
        display="grid"
        gridTemplateColumns={{
          base: '.5fr repeat(12, 1fr) .5fr',
          md: '1.5fr repeat(12, 1fr) 1.5fr',
        }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Flex
          gridColumn="2 / span 12"
          width="100%"
          margin="0 auto"
          maxWidth="1280px"
          justifyContent="space-between"
          flex="1"
          gridGap="20px"
          padding={{ base: '3% 15px 4% 15px', md: '1.5% 0 1.5% 0' }}
        >
          <TitleContent title={t('title')} mobile={false} color={iconColor} />

          <Search placeholder={t('search')} />

          <Button
            variant="outline"
            backgroundColor={useColorModeValue('', 'gray.800')}
            _hover={{ backgroundColor: useColorModeValue('', 'gray.700') }}
            border={currentFilters >= 1 ? 2 : 1}
            onClick={onOpen}
            borderStyle="solid"
            minWidth="125px"
            borderColor={useColorModeValue(
              `${currentFilters >= 1 ? 'blue.default' : '#DADADA'}`,
              'gray.800',
            )}
          >
            <Icon icon="setting" width="20px" height="20px" style={{ minWidth: '20px' }} />
            <Text textTransform="uppercase" pl="10px">
              {currentFilters >= 2 ? t('filters') : t('filter')}
            </Text>
            {currentFilters >= 1 && (
              <Text
                as="span"
                margin="0 10px"
                textTransform="uppercase"
                display="flex"
                justifyContent="center"
                alignItems="center"
                backgroundColor="blue.default"
                color="white"
                borderRadius="30px"
                minWidth="20px"
                height="20px"
              >
                {currentFilters}
              </Text>
            )}
          </Button>

          <FilterModal
            isModalOpen={isOpen}
            onClose={onClose}
            contextFilter={filteredBy.projectsOptions}
            cardHeight="348px"
            isLoading={isLoading}
            setFilter={setProjectFilters}
            technologyTags={technologyTags}
            difficulties={difficulties}
          />
        </Flex>
      </Box>

      <GridContainer>
        <Text
          size="md"
          display="flex"
          padding={{ base: '30px 8%', md: '30px 28%' }}
          textAlign="center"
        >
          {t('description')}
        </Text>

        <ProjectList
          projects={getProjects()}
          contextFilter={filteredBy.projectsOptions}
          isLoading={isLoading}
          projectPath="interactive-coding-tutorial"
          pathWithDifficulty
        />
      </GridContainer>
    </Box>
  );
};

Projects.propTypes = {
  technologyTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  difficulties: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Projects;
