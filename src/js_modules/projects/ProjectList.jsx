import { useEffect, useState } from 'react';
import {
  Box, useColorModeValue, Grid, Flex,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { resizeAllMasonryItems, toCapitalize, unSlugify } from '../../utils/index';
import Heading from '../../common/components/Heading';
import Link from '../../common/components/NextChakraLink';
// import Image from '../../common/components/Image';
import TagCapsule from '../../common/components/TagCapsule';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import useStyle from '../../common/hooks/useStyle';
import LoaderScreen from '../../common/components/LoaderScreen';
import { CardSkeleton } from '../../common/components/Skeleton';

const ProjectList = ({
  projects, contextFilter, projectPath, pathWithDifficulty,
  withoutImage, isLoading, withoutDifficulty, containerPadding, isDynamic,
}) => {
  const { t } = useTranslation('common');
  const arrOfTechs = contextFilter?.technologies || [];
  const [isLoaded, setIsLoaded] = useState(false);
  // const difficulty = contextFilter?.difficulty || [];
  const videoTutorials = contextFilter?.videoTutorials || [];
  const router = useRouter();
  const { featuredColor, fontColor2 } = useStyle();
  // const defaultImage = exampleImage || '/static/images/code1.png';
  // const { query } = router;
  const query = router?.query;
  const techTagsQuery = (query?.techs && decodeURI(query?.techs?.toLowerCase())?.split(',')) || false;
  const withVideoQuery = query?.withVideo === 'true';
  const difficultyQuery = query?.difficulty?.toLowerCase() || false;

  // const bgBlur = '/static/images/codeBlur.png';

  // const projectLimited = projects.slice(0, limiter);
  const getAssetPath = (asset) => {
    if (asset?.asset_type?.toUpperCase() === 'LESSON') return 'lesson';
    if (asset?.asset_type?.toUpperCase() === 'EXERCISE') return 'interactive-exercise';
    if (asset?.asset_type?.toUpperCase() === 'PROJECT') return 'interactive-coding-tutorial';
    if (asset?.category?.slug === 'how-to' || asset?.category?.slug === 'como') return 'how-to';
    return 'lesson';
  };

  const checkIsPathDifficulty = (thisDifficulty) => (pathWithDifficulty ? `/${thisDifficulty}` : '');

  const getDifficultyPosition = (currDifficulty) => {
    if (currDifficulty === 'beginner' || currDifficulty === 'easy') {
      return 'junior';
    }
    if (currDifficulty === 'intermediate') {
      return 'mid-level';
    }
    if (currDifficulty === 'hard') {
      return 'senior';
    }
    return 'junior';
  };

  const isOldDifficulty = () => {
    if (difficultyQuery === 'beginner' || difficultyQuery === 'easy' || difficultyQuery === 'intermediate' || difficultyQuery === 'hard') {
      return true;
    }
    return false;
  };

  const contains = (project, selectedTechs) => {
    // search with title and slug
    const projectDifficulty = isOldDifficulty() ? project.difficulty?.toLowerCase() : getDifficultyPosition(project.difficulty?.toLowerCase());
    const projectTitle = project.title?.toLowerCase() || unSlugify(project.slug);
    if (
      typeof videoTutorials === 'boolean'
      && (withVideoQuery || videoTutorials === true)
      && !project.solution_video_url === true
    ) return false;
    if (typeof query?.search === 'string' && !projectTitle.includes(query?.search)) return false;
    if (difficultyQuery && projectDifficulty !== difficultyQuery) return false;
    // Match checked technologies
    const res = (techTagsQuery || selectedTechs.length > 0) ? (
      (techTagsQuery || selectedTechs).some((tech) => project.technologies.includes(tech))
    ) : true;
    return res;
  };

  // const [filteredProjects, setFilteredProjects] = useState([]);
  const filteredProjects = projects.filter(
    (project) => contains(project, arrOfTechs),
  );

  useEffect(() => {
    resizeAllMasonryItems();
  }, [filteredProjects]);

  useEffect(() => {
    setIsLoaded(true);
    const masonryEvents = ['resize'];
    masonryEvents.forEach((event) => {
      if (window !== undefined) window.addEventListener(event, resizeAllMasonryItems);
    });
  }, []);

  const getDifficultyColors = (currDifficulty) => {
    // 'beginner', 'easy', 'intermediate', 'hard'
    const background = {
      beginner: 'green.light',
      easy: 'green.light',
      intermediate: 'yellow.100',
      hard: 'red.light',
    };
    const color = {
      beginner: 'green.400',
      easy: 'green.400',
      intermediate: '#FFB718',
      hard: 'danger',
    };
    return {
      bg: background[currDifficulty],
      color: color[currDifficulty],
    };
  };

  return isLoaded ? (
    <>
      <Grid
        className="masonry"
        gridTemplateColumns={{
          base: 'repeat(auto-fill, minmax(15rem, 1fr))',
          md: 'repeat(auto-fill, minmax(20rem, 1fr))',
          lg: 'repeat(3, 1fr)',
        }}
        gridGap="1em"
        gridAutoRows="0"
        padding={containerPadding}
      >
        {filteredProjects.map((ex) => {
          const isLesson = isDynamic && getAssetPath(ex) === 'lesson';
          const isExercise = isDynamic && getAssetPath(ex) === 'interactive-exercise';
          const isProject = isDynamic && getAssetPath(ex) === 'interactive-coding-tutorial';
          const isHowTo = isDynamic && getAssetPath(ex) === 'how-to';

          const getLink = () => {
            if (isLesson) {
              return `/lesson/${ex.slug}`;
            }
            if (isExercise) {
              return `/interactive-exercise/${ex.slug}`;
            }
            if (isProject) {
              return `/interactive-coding-tutorial/${ex.difficulty}/${ex.slug}`;
            }
            if (isHowTo) {
              return `/how-to/${ex.slug}`;
            }
            return `/${projectPath}${checkIsPathDifficulty(ex.difficulty)}/${ex.slug}`;
          };
          return (
            <Box
              // py={2}
              key={`${ex.slug}-${ex.difficulty}`}
              border={useColorModeValue('1px solid #DADADA', 'none')}
              className="card pointer masonry-brick"
              bg={useColorModeValue('white', 'gray.800')}
              borderRadius="16px"
              padding="21px 22px 22px 22px"
            >
              <Box
                display={{ base: 'flex', md: 'inline-block' }}
                gridGap="15px"
                flexDirection={{ base: withoutImage ? 'column' : 'row', md: 'row' }}
                role="group"
                w="full"
                zIndex={1}
                borderRadius="10px"
                className="masonry-content"
              >
                <Box display="flex" flexDirection="column">
                  {ex.technologies.length >= 1 && (
                    <TagCapsule
                      tags={ex.technologies.slice(0, 3)}
                      variant="rounded"
                      borderRadius="10px"
                      marginY="8px"
                      style={{
                        padding: '4px 10px',
                        margin: '0',
                      }}
                      gap="10px"
                      paddingX="0"
                      key={`${ex.slug}-${ex.difficulty}`}
                    />
                  )}
                  <Heading
                    size="m"
                    textAlign="left"
                    wordBreak="break-word"
                    width="100%"
                    fontFamily="body"
                    fontWeight={700}
                  >
                    {ex.title || t('no-title')}
                  </Heading>
                  {!withoutDifficulty && (
                    <Flex alignItems="center" justifyContent="space-between">
                      <Box>
                        <TagCapsule
                          tags={[ex.difficulty]}
                          background={getDifficultyColors(ex.difficulty).bg}
                          color={getDifficultyColors(ex.difficulty).color}
                          fontWeight={700}
                        />
                      </Box>
                      {ex.solution_video_url && (
                        <Box background={featuredColor} borderRadius="15px" padding="6px 12px">
                          <Icon icon="camera" width="22px" height="22px" />
                        </Box>
                      )}
                    </Flex>
                  )}

                  {ex?.description && (
                    <Text
                      color={fontColor2}
                      textAlign="left"
                      width="100%"
                      size="l"
                      // textTransform="uppercase"
                    >
                      {ex.description}
                    </Text>
                  )}

                  <Link
                    variant="buttonDefault"
                    mt="13px"
                    width="fit-content"
                    href={getLink()}
                    display="inline-block"
                    zIndex={1}
                    // color="blue.default"
                    padding="6px 15px"
                    fontSize="15px"
                    letterSpacing="0.05em"
                  >
                    {toCapitalize(t(`asset-button.${ex.asset_type.toLowerCase()}`))}
                  </Link>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Grid>

      {isLoading && (
        <Box display="flex" justifyContent="center" mt="2rem" mb="10rem" position="relative">
          <LoaderScreen width="80px" height="80px" />
        </Box>
      )}

      {filteredProjects.length === 0 && (
        <Box height="50vh" width="100%">
          <Text size="20px" padding="30px 0" textAlign="center" fontWeight={500}>
            {t('search-not-found')}
          </Text>
        </Box>
      )}
    </>
  ) : (
    <CardSkeleton quantity={6} />
  );
};

ProjectList.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  contextFilter: PropTypes.objectOf(PropTypes.any),
  projectPath: PropTypes.string,
  pathWithDifficulty: PropTypes.bool,
  withoutImage: PropTypes.bool,
  isLoading: PropTypes.bool,
  withoutDifficulty: PropTypes.bool,
  containerPadding: PropTypes.string,
  isDynamic: PropTypes.bool,
};

ProjectList.defaultProps = {
  projectPath: '',
  pathWithDifficulty: false,
  withoutImage: false,
  isLoading: false,
  contextFilter: {},
  withoutDifficulty: false,
  containerPadding: '0 15px',
  isDynamic: true,
};

export default ProjectList;
