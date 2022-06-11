/* eslint-disable no-continue */
import {
  Box, useColorModeValue, Button, Flex, useDisclosure,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import getT from 'next-translate/getT';
import Text from '../common/components/Text';
import Icon from '../common/components/Icon';
import FilterModal from '../common/components/FilterModal';
import TitleContent from '../js_modules/projects/TitleContent';
import ProjectList from '../js_modules/projects/ProjectList';
import useFilter from '../common/store/actions/filterAction';
import Search from '../js_modules/projects/Search';

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'lesson');
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const image = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });
  const currentLang = locale === 'en' ? 'us' : 'es';
  const lessons = []; // filtered lessons after removing repeated
  let arrProjects = []; // incoming lessons

  const data = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?type=lesson`);
  const resp = await data.json();
  // .then((res) => res.json())
  // .catch((err) => console.error(err));

  arrProjects = Object.values(resp);
  if (resp.status >= 200 && resp.status < 400) {
    console.log(`Original lessons: ${arrProjects}`);
  } else {
    console.error(`Error fetching lessons with ${resp.status}`);
  }

  let technologyTags = [];
  let difficulties = [];

  for (let i = 0; i < arrProjects.length; i += 1) {
    // skip repeated lessons
    if (lessons.find((p) => arrProjects[i].slug === p.slug)) {
      continue;
    }
    lessons.push(arrProjects[i]);

    if (typeof arrProjects[i].technology === 'string') technologyTags.push(arrProjects[i].technology);
    if (Array.isArray(arrProjects[i].technologies)) {
      technologyTags = technologyTags.concat(arrProjects[i].technologies);
    }

    if (arrProjects[i].difficulty === null) arrProjects[i].difficulty = 'unknown';
    if (typeof arrProjects[i].difficulty === 'string' || arrProjects[i].difficulty === null) {
      if (arrProjects[i].difficulty === 'junior') arrProjects[i].difficulty = 'easy';
      else if (arrProjects[i].difficulty === 'semi-senior') arrProjects[i].difficulty = 'intermediate';
      else if (arrProjects[i].difficulty === 'senior') arrProjects[i].difficulty = 'hard';

      difficulties.push(arrProjects[i].difficulty);
    }
  }

  technologyTags = [...new Set(technologyTags)];
  difficulties = [...new Set(difficulties)];

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
    en: '/lesson',
    us: '/lesson',
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
        url: ogUrl.en || `/${locale}/lesson`,
        pathConnector: '/lesson',
        card: 'default',
      },

      fallback: false,
      lessons: lessons.filter((project) => project.lang === currentLang).map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() }),
      ),
      technologyTags,
      difficulties: difficultiesSorted,
    },
  };
};

const Projects = ({ lessons, technologyTags, difficulties }) => {
  const { t } = useTranslation('lesson');
  const { filteredBy, setProjectFilters } = useFilter();
  const { technologies, difficulty, videoTutorials } = filteredBy.projectsOptions;
  const currentFilters = technologies.length
    + (difficulty === undefined || difficulty.length === 0 ? 0 : 1)
    + videoTutorials;

  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <Box height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <TitleContent title={t('title')} mobile />
      <Flex
        justifyContent="space-between"
        flex="1"
        gridGap="20px"
        padding={{ base: '3% 4% 4% 4%', md: '1.5% 10% 1.5% 10%' }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
      >
        <TitleContent title={t('title')} mobile={false} />

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
          setFilter={setProjectFilters}
          technologyTags={technologyTags}
          difficulties={difficulties}
        />
      </Flex>

      <Box flex="1" margin={{ base: '0 4% 0 4%', md: '0 10% 0 10%' }}>
        <Text
          size="md"
          display="flex"
          padding={{ base: '30px 8%', md: '30px 28%' }}
          textAlign="center"
        >
          {t('description')}
        </Text>

        <ProjectList
          projects={lessons}
          contextFilter={filteredBy.projectsOptions}
          projectPath="lesson"
        />
      </Box>
    </Box>
  );
};

Projects.propTypes = {
  technologyTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  lessons: PropTypes.arrayOf(PropTypes.object).isRequired,
  difficulties: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Projects;
