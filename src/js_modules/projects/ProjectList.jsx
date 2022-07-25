import { useEffect } from 'react';
import {
  Box, useColorModeValue, Stack, Img,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { unSlugify } from '../../utils/index';
import Heading from '../../common/components/Heading';
import Link from '../../common/components/NextChakraLink';
import Image from '../../common/components/Image';
import TagCapsule from '../../common/components/TagCapsule';
import Text from '../../common/components/Text';

const ProjectList = ({
  projects, contextFilter, projectPath, pathWithDifficulty, exampleImage,
  withoutImage, isLoading,
}) => {
  const { t } = useTranslation('common');
  const arrOfTechs = contextFilter?.technologies || [];
  const difficulty = contextFilter?.difficulty || [];
  const videoTutorials = contextFilter?.videoTutorials || [];
  const router = useRouter();
  const defaultImage = exampleImage || '/static/images/code1.png';
  const { query } = router;
  const techTagsQuery = (query.techs && decodeURI(query.techs?.toLowerCase())?.split(',')) || false;
  const withVideoQuery = query.withVideo === 'true';
  const difficultyQuery = query.difficulty?.toLowerCase() || false;

  // const bgBlur = '/static/images/codeBlur.png';

  // const projectLimited = projects.slice(0, limiter);

  const checkIsPathDifficulty = (thisDifficulty) => (pathWithDifficulty ? `/${thisDifficulty}` : '');

  const contains = (project, selectedTechs) => {
    // search with title and slug
    const projectDifficulty = project.difficulty?.toLowerCase();
    const projectTitle = project.title?.toLowerCase() || unSlugify(project.slug);
    if (
      typeof videoTutorials === 'boolean'
      && (withVideoQuery || videoTutorials === true)
      && !project.solution_video_url === true
    ) return false;
    if (typeof query.search === 'string' && !projectTitle.includes(query.search)) return false;
    if ((typeof difficulty === 'string'
      && projectDifficulty !== difficulty)
      || (difficultyQuery && projectDifficulty !== difficultyQuery)) return false;
    // Match checked technologies
    const res = (techTagsQuery || selectedTechs.length > 0) ? (
      (techTagsQuery || selectedTechs).some((tech) => project.technologies.includes(tech))
    ) : true;
    return res;
    // const res = selectedTechs.map((techs) => project.technologies.includes(techs));
    // if response not match with current checked technologies return false
    // return !res.includes(false);
  };

  // const [filteredProjects, setFilteredProjects] = useState([]);
  const filteredProjects = projects.filter(
    (project) => contains(project, arrOfTechs),
  );

  const resizeMasonryItem = (item) => {
    /* Get the grid object, its row-gap, and the size of its implicit rows */
    const grid = document.getElementsByClassName('masonry')[0];
    // eslint-disable-next-line radix
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
    // eslint-disable-next-line radix
    const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));

    /*
     * Spanning for any brick = S
     * Grid's row-gap = G
     * Size of grid's implicitly create row-track = R
     * Height of item content = H
     * Net height of the item = H1 = H + G
     * Net height of the implicit row-track = T = G + R
     * S = H1 / T
     */

    // We add the 2 to include the height od the 'Read Lesson' link
    const rowSpan = Math.ceil((item.querySelector('.masonry-content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap)) + 2;

    /* Set the spanning as calculated above (S) */
    // eslint-disable-next-line no-param-reassign
    item.style.gridRowEnd = `span ${rowSpan}`;
  };

  const resizeAllMasonryItems = () => {
    // Get all item class objects in one list
    const allItems = document.getElementsByClassName('masonry-brick');

    /*
     * Loop through the above list and execute the spanning function to
     * each list-item (i.e. each masonry item)
     */
    for (let i = 0; i < allItems.length; i += 1) {
      resizeMasonryItem(allItems[i]);
    }
  };

  const onImageNotFound = (event) => {
    event.target.setAttribute('src', defaultImage);
    event.target.setAttribute('srcset', `${defaultImage} 1x`);
  };

  useEffect(() => {
    resizeAllMasonryItems();
  }, [filteredProjects]);

  useEffect(() => {
    const masonryEvents = ['resize'];
    masonryEvents.forEach((event) => {
      if (window !== undefined) window.addEventListener(event, resizeAllMasonryItems);
    });
  }, []);

  return (
    <>
      <StyledContainer className="masonry">
        {/* <Grid
        gridTemplateColumns={{
          base: 'repeat(auto-fill, minmax(15rem, 1fr))',
          md: 'repeat(auto-fill, minmax(20rem, 1fr))',
        }}
        gridGap="12px"
      > */}
        {filteredProjects.map((ex) => {
          const getImage = ex.preview || defaultImage;
          return (
            <Box
              py={2}
              key={`${ex.slug}-${ex.difficulty}`}
              border={useColorModeValue('1px solid #DADADA', 'none')}
              className="card pointer masonry-brick"
              bg={useColorModeValue('white', 'gray.800')}
              // transition="transform .3s ease-in-out"
              // _hover={{
              //   transform: 'scale(1.05)',
              //   boxShadow: '0 10px 20px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06)',
              // }}
              borderRadius="16px"
              padding="22px"
              // style={{ breakInside: 'avoid', marginBottom: '1em', gap: '1em' }}
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
                {withoutImage && (
                <Heading
                  size="m"
                  textAlign="left"
                  wordBreak="break-word"
                  width="100%"
                  fontFamily="body"
                  fontWeight={700}
                  // lineHeight={filteredProjects.length < 70 ? 1.1 : lineHeight}
                >
                  {ex.title || t('no-title')}
                </Heading>
                )}
                {/* CARD IMAGE */}
                {!withoutImage && (
                <Link
                  href={`/${projectPath}${checkIsPathDifficulty(ex.difficulty)}/${ex.slug}`}
                  display="inline-block"
                  w={{ base: 'auto', md: 'full' }}
                  zIndex={1}
                  borderRadius="15px"
                >
                  <Image
                    priority
                    borderRadius="15px"
                    classNameImg="centerImageForBlur"
                    pos="relative"
                    height={{ base: '60px', sm: '90px', md: '180px' }}
                    width={{ base: '60px', sm: '90px', md: 'auto' }}
                    maxWidth={{ base: '300px', sm: '230px', md: 'none' }}
                      // _after={{
                      //   transition: 'all .8s ease',
                      //   content: '""',
                      //   w: 'full',
                      //   h: 'full',
                      //   pos: 'absolute',
                      //   top: 0,
                      //   left: 0,
                      //   backgroundImage: `url(${bgBlur})`,
                      //   filter: 'blur(15px)',
                      //   zIndex: 0,
                      // }}
                      // _groupHover={{
                      //   _after: {
                      //     filter: 'blur(50px)',
                      //   },
                      // }}
                    onError={(e) => onImageNotFound(e)}
                    style={{ borderRadius: '15px', overflow: 'hidden' }}
                    objectFit="cover"
                    src={getImage}
                    alt={ex.title}
                  />
                </Link>
                )}
                <Box display="flex" flexDirection="column" paddingTop="4px">
                  {ex.technologies.length >= 1 && (
                  <TagCapsule
                    tags={ex.technologies}
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

                  {!withoutImage && (
                  <Stack align="center" padding="18px 0 0 0">
                    <Link
                      href={`/${projectPath}${checkIsPathDifficulty(ex.difficulty)}/${ex.slug}`}
                      display="inline-block"
                      w="full"
                      zIndex={1}
                      color="blue.default"
                    >
                      <Heading
                        size="20px"
                        textAlign="left"
                        wordBreak="break-word"
                        width="100%"
                        fontFamily="body"
                        fontWeight={700}
                      >
                        {ex.title || t('no-title')}
                      </Heading>
                    </Link>
                  </Stack>
                  )}

                  {withoutImage && ex?.description && (
                  <Text
                    color="gray.500"
                    textAlign="left"
                    width="100%"
                    size="sm"
                    textTransform="uppercase"
                  >
                    {ex.description}
                  </Text>
                  )}

                  {withoutImage && (
                  <Link
                    mt="8px"
                    width="fit-content"
                    href={`/${projectPath}${checkIsPathDifficulty(ex.difficulty)}/${ex.slug}`}
                    display="inline-block"
                    zIndex={1}
                    color="blue.default"
                    fontSize="15px"
                    letterSpacing="0.05em"
                  >
                    {`${t('read-lesson')} >`}
                  </Link>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}

        {/* </Grid> */}
      </StyledContainer>

      {isLoading && (
        <Box display="flex" justifyContent="center" mt="2rem" mb="10rem">
          <Img src="/4Geeks.ico" width="35px" height="35px" position="absolute" mt="6px" zIndex="40" boxShadow="0px 0px 16px 0px #0097cd" borderRadius="40px" />
          <Box className="loader" />
        </Box>
      )}

      {filteredProjects.length === 0 && (
        <Box height="50vh" width="100%">
          <Text size="20px" padding="30px 0" textAlign="center" fontWeight={500}>
            {t('search-not-found')}
          </Text>
        </Box>
      )}
      {/* {projects.length >= limiter && (
        <Button variant="default" onClick={() => setLimiter(limiter + 12)}>
          load more
        </Button>
      )} */}
    </>
  );
};

// const StyledContainer = styled.div`
//   /* column-count: 3; */
//   columns: 3;
//   grid-auto-flow: dense;
//   @media screen and (max-width: 1000px){
//     column-count: 2;
//   }
//   @media screen and (max-width: 820px){
//     column-count: 1;
//   }
// `;

const StyledContainer = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: repeat(auto-fill, minmax(250px,1fr));
  grid-auto-rows: 0;
  
  @media screen and (max-width: 700px){
    display: block;
    .masonry-brick{
      margin-bottom: 1em;
    }
  }

`;

ProjectList.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  contextFilter: PropTypes.objectOf(PropTypes.any),
  projectPath: PropTypes.string.isRequired,
  pathWithDifficulty: PropTypes.bool,
  exampleImage: PropTypes.string,
  withoutImage: PropTypes.bool,
  isLoading: PropTypes.bool,
};

ProjectList.defaultProps = {
  pathWithDifficulty: false,
  exampleImage: '',
  withoutImage: false,
  isLoading: false,
  contextFilter: {},
};

export default ProjectList;
