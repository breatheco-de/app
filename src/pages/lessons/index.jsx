/* eslint-disable no-continue */
import {
  Box, useColorModeValue, Button, Flex, useDisclosure,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import getT from 'next-translate/getT';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
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
  const t = await getT(locale, 'lesson');
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const image = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });
  const currentLang = locale === 'en' ? 'us' : 'es';
  const lessons = []; // filtered lessons after removing repeated
  let arrLessons = []; // incoming lessons

  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?asset_type=lesson&limit=1000`);
  const data = await resp.json();
  // .then((res) => res.json())
  // .catch((err) => console.error(err));

  arrLessons = Object.values(data.results);
  if (resp.status !== undefined && resp.status >= 200 && resp.status < 400) {
    console.log(`SUCCESS: ${arrLessons.length} Lessons fetched for /lessons`);
  } else {
    console.error(`Error ${resp.status}: fetching Lessons list for /lessons`);
  }

  const technologiesResponse = await fetch(
    `${process.env.BREATHECODE_HOST}/v1/registry/technology?asset_type=exercise&limit=1000`,
    {
      Accept: 'application/json, text/plain, */*',
    },
  );

  if (technologiesResponse.status >= 200 && technologiesResponse.status < 400) {
    console.log(`SUCCESS: ${technologiesResponse.length} Technologies fetched for /interactive-exercises`);
  } else {
    console.error(`Error ${technologiesResponse.status}: fetching Exercises list for /interactive-exercises`);
  }

  const technologies = await technologiesResponse.json();

  let technologyTags = [];
  let difficulties = [];

  for (let i = 0; i < arrLessons.length; i += 1) {
    // skip repeated lessons
    if (lessons.find((p) => arrLessons[i].slug === p.slug)) {
      continue;
    }
    lessons.push(arrLessons[i]);

    if (typeof arrLessons[i].technology === 'string') technologyTags.push(arrLessons[i].technology);
    if (Array.isArray(arrLessons[i].technologies)) {
      technologyTags = technologyTags.concat(arrLessons[i].technologies);
    }

    if (arrLessons[i].difficulty === null) arrLessons[i].difficulty = 'unknown';
    if (typeof arrLessons[i].difficulty === 'string' || arrLessons[i].difficulty === null) {
      if (arrLessons[i].difficulty === 'junior') arrLessons[i].difficulty = 'easy';
      else if (arrLessons[i].difficulty === 'semi-senior') arrLessons[i].difficulty = 'intermediate';
      else if (arrLessons[i].difficulty === 'senior') arrLessons[i].difficulty = 'hard';

      difficulties.push(arrLessons[i].difficulty);
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
    en: '/lessons',
    us: '/lessons',
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
        url: ogUrl.en || `/${locale}/lessons`,
        pathConnector: '/lessons',
        card: 'default',
      },

      fallback: false,
      lessons: lessons.filter((lesson) => lesson?.lang === currentLang && lesson?.asset_type === 'LESSON').map(
        (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
      ),
      technologyTags,
      difficulties: difficultiesSorted,
    },
  };
};

const Projects = ({ lessons, technologyTags, difficulties }) => {
  const { t } = useTranslation('lesson');
  const { filteredBy, setProjectFilters } = useFilter();
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(10);
  const { technologies, difficulty, videoTutorials } = filteredBy.projectsOptions;
  const router = useRouter();
  const iconColor = useColorModeValue('#FFF', '#283340');
  const queryExists = Object.keys(router.query).length > 0;

  const lessonsFiltered = lessons.slice(0, offset);
  const lessonsSearched = lessons.filter(
    (lesson) => lesson.title.toLowerCase()
      .includes(router?.query?.search?.toLocaleLowerCase() || false),
  );

  const handleScroll = () => {
    const scrollTop = isWindow && document.documentElement.scrollTop;
    const offsetHeight = isWindow && document.documentElement.offsetHeight;
    const innerHeight = isWindow && window.innerHeight;
    if ((innerHeight + scrollTop) <= offsetHeight) return;
    setIsLoading(true);
  };

  useEffect(() => {
    if (!queryExists) {
      if (lessonsSearched.length > 0) return () => {};
      if (offset <= lessons.length) {
        console.log('loading lessons...');
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      }
      console.log('All lessons loaded');
    }
    return () => {};
  }, [offset, queryExists]);

  useEffect(() => {
    if (!isLoading) return;
    if (offset >= lessons.length) setIsLoading(false);
    setTimeout(() => {
      setOffset(offset + 10);
      setIsLoading(false);
    }, 200);
  }, [isLoading]);

  const getLessons = () => {
    if (queryExists) {
      return lessons;
    }
    if (lessonsSearched.length > 0) {
      return lessonsSearched;
    }
    return lessonsFiltered;
  };

  // const currentFilters = technologies.length
  //   + (difficulty === undefined || difficulty.length === 0 ? 0 : 1)
  //   + videoTutorials;

  const { isOpen, onClose, onOpen } = useDisclosure();
  const techsQuery = router.query.techs;
  const difficultyQuery = router.query.difficulty;

  const technologiesActived = technologies.length || (techsQuery?.length > 0 ? techsQuery?.split(',')?.length : 0);
  const difficultyIsActive = () => {
    if (difficultyQuery?.length > 0) return 1;
    if (difficulty !== undefined && difficulty?.length > 0) return 1;
    return 0;
  };

  const currentFilters = technologiesActived
    + difficultyIsActive()
    + videoTutorials;

  return (
    <Box height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <TitleContent title={t('title')} icon="book" mobile color={iconColor} />
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
          <TitleContent title={t('title')} icon="book" color={iconColor} mobile={false} />

          <Search placeholder={t('search')} onChange={() => setIsLoading(true)} />

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
              {currentFilters >= 2 ? t('common:filters') : t('common:filter')}
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
      </Box>

      <GridContainer
        flex="1"
        gridTemplateColumns="0fr repeat(12, 1fr) 0fr"
        // margin={[
        //   '0 5% 0 5%', // 0-30em
        //   '0 5% 0 5%', // 30em-48em
        //   '0 5% 0 5%', // 48em-62em
        //   '0 10% 0 10%', // 62em+
        // ]}
        // margin={{ base: '0 4% 0 4%', md: '0 10% 0 10%' }}
      >
        <Text
          size="md"
          display="flex"
          padding={{ base: '30px 8%', md: '30px 28%' }}
          textAlign="center"
        >
          {t('description')}
        </Text>

        <ProjectList
          projects={getLessons()}
          withoutDifficulty
          isLoading={isLoading}
          contextFilter={filteredBy.projectsOptions}
          projectPath="lesson"
        />
      </GridContainer>
    </Box>
  );
};

Projects.propTypes = {
  technologyTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  lessons: PropTypes.arrayOf(PropTypes.object).isRequired,
  difficulties: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Projects;
