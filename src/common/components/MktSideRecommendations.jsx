import { Box, Image, Link, useColorModeValue } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Heading from './Heading';
import Text from './Text';
import { CardSkeleton } from './Skeleton';
// import Link from './NextChakraLink';
// import modifyEnv from '../../../modifyEnv';
// import { toCapitalize } from '../../utils';
import TagCapsule from './TagCapsule';
import { getBrowserSize, setStorageItem, getBrowserInfo } from '../../utils';
import { ORIGIN_HOST, WHITE_LABEL_ACADEMY, BREATHECODE_HOST } from '../../utils/variables';
import useStyle from '../hooks/useStyle';
import useSession from '../hooks/useSession';
import { parseQuerys } from '../../utils/url';
import { error } from '../../utils/logging';
import { reportDatalayer } from '../../utils/requests';

const defaultEndpoint = '/v1/marketing/course';
const coursesLimit = 1;

function Container({ recommendation, recommendations, borderRadius, children, ...rest }) {
  const router = useRouter();
  const { fontColor } = useStyle();
  const bgColor = useColorModeValue('gray.light3', 'featuredDark');
  const langConnector = router.locale === 'en' ? '' : `/${router.locale}`;

  const { width: screenWidth } = getBrowserSize();

  if (screenWidth < 768) {
    return (
      <Link href={`${ORIGIN_HOST}${langConnector}/${recommendation?.slug}`} _hover={{ textDecoration: 'none' }} minWidth={{ base: recommendations?.length > 1 ? '285px' : '100%', md: 'auto' }} justifyContent="space-between" display="flex" flexDirection={{ base: 'row', md: 'column' }} gridGap="10px" background={bgColor} color={fontColor} borderRadius={borderRadius} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <Box minWidth={{ base: recommendations?.length > 1 ? '285px' : '100%', md: 'auto' }} justifyContent="space-between" display="flex" flexDirection={{ base: 'row', md: 'column' }} gridGap="10px" background={bgColor} color={fontColor} borderRadius={borderRadius} {...rest}>
      {children}
    </Box>
  );
}

function MktSideRecommendations({ title, endpoint, technologies, containerPadding, ...rest }) {
  const { t, lang } = useTranslation('common');
  const { hexColor } = useStyle();
  const { location } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const router = useRouter();
  const langConnector = router.locale === 'en' ? '' : `/${router.locale}`;
  const qs = parseQuerys({
    academy: WHITE_LABEL_ACADEMY,
    featured: true,
  });

  const headers = {
    'Accept-Language': lang,
  };

  const technologiesList = technologies.map((tech) => tech?.slug || tech);
  const technologiesArray = typeof technologiesList === 'string' ? technologiesList.split(',') : technologiesList;

  const fetchTutorials = async () => {
    const response = await fetch(`${BREATHECODE_HOST}/v1/registry/asset?asset_type=EXERCISE&status=PUBLISHED&technologies=${technologiesArray.join(',')}`, { headers });
    if (!response.ok) throw new Error(`Failed to fetch tutorials: ${response.statusText}`);
    return response.json();
  };

  const filterMatchingTutorials = (tutorialsData) => tutorialsData.filter((tutorial) => {
    const matchingTechnologies = tutorial.technologies.filter((tech) => technologiesArray.includes(tech));
    return matchingTechnologies.length >= 2;
  });

  const sortAndSetRecommendations = (tutorials) => {
    tutorials.sort((a, b) => {
      const aMatches = a.technologies.filter((tech) => technologiesArray.includes(tech)).length;
      const bMatches = b.technologies.filter((tech) => technologiesArray.includes(tech)).length;
      return bMatches - aMatches;
    });
    setRecommendations([tutorials[0]]);
  };

  const gradeCourseBasedOnTech = (courses) => {
    const coursesGraded = [];
    courses.forEach((course) => {
      const courseTechnologies = course.technologies.split(',');
      const techCount = courseTechnologies.length;

      const eachTechValue = 1 / techCount;

      const techsRelated = courseTechnologies
        .filter((tech) => technologiesArray.includes(tech));

      const relatedTechCount = techsRelated.length;
      const score = relatedTechCount * eachTechValue;

      coursesGraded.push({ ...course, score, relatedTechCount });
    });

    return coursesGraded;
  };

  const fetchAndSetCourses = async () => {
    try {
      const response = await fetch(`${BREATHECODE_HOST}${endpoint}${qs}`, { headers });
      if (!response.ok) throw new Error(`Failed to fetch courses: ${response.statusText}`);

      const coursesData = await response.json();
      const coursesGraded = gradeCourseBasedOnTech(coursesData);

      if (coursesData.length > 0) {
        const sortedCourses = coursesGraded.sort((a, b) => {
          if (b.relatedTechCount !== a.relatedTechCount) {
            return b.relatedTechCount - a.relatedTechCount;
          }
          return b.score - a.score;
        });

        setRecommendations(sortedCourses.slice(0, coursesLimit));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchError = (err) => {
    error(err);
    setIsLoading(false);
  };

  const fetchContent = async () => {
    try {
      const tutorialsData = await fetchTutorials();
      const matchingTutorials = filterMatchingTutorials(tutorialsData);

      if (matchingTutorials.length > 1) {
        sortAndSetRecommendations(matchingTutorials);
      } else {
        await fetchAndSetCourses();
      }
    } catch (err) {
      handleFetchError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getLink = (recommendation) => {
    if (recommendation?.course_translation?.landing_url) return recommendation?.course_translation?.landing_url;
    return `${ORIGIN_HOST}${langConnector}/interactive-exercise/${recommendation?.slug}`;
  };

  const getMainTechIcon = () => {
    const techWithURL = technologies.find((tech) => tech.icon_url !== null);
    if (!techWithURL) return undefined;
    return techWithURL.icon_url;
  };

  const determineIconBackgroundColor = (recom) => {
    if (recom?.color) {
      return recom.color;
    }
    return 'blue.50';
  };

  useEffect(() => {
    setIsLoading(true);
    fetchContent();
  }, [lang]);

  if (location?.countryShort === 'ES') return null;

  return recommendations?.length > 0 && (
    <>
      <Box color="white" zIndex="10" borderRadius="11px 11px 0 0" background={hexColor.greenLight} padding="10px 20px" bottom="0" position="sticky" marginBottom="20px" display={{ base: 'block', md: 'none' }} textAlign="left">
        {recommendations.map((recom) => {
          const recomLink = getLink(recom);
          const link = `${recomLink}?internal_cta_placement=mktsiderecommendedcourses&internal_cta_content=${recom?.slug}`;

          return (
            <>
              <Box display="flex" alignItems="center" gap="10px">
                {(recom.icon_url || getMainTechIcon())
                  && <Image src={recom.icon_url ? recom.icon_url : getMainTechIcon()} width="46px" height="46px" borderRadius="8px" padding={!recom.icon_url && '8px'} color="white" background={determineIconBackgroundColor(recom)} />}
                <Heading as="span" size="18px" paddingLeft={!recom.icon_url && !getMainTechIcon() && '20px'}>
                  {recom?.course_translation?.title || recom.title}
                </Heading>
              </Box>
              <Link
                variant="buttonDefault"
                onClick={() => {
                  setStorageItem('redirected-from', link);
                  reportDatalayer({
                    dataLayer: {
                      event: 'ad_interaction',
                      course_slug: recom.slug,
                      course_title: recom?.course_translation?.title || recom.title,
                      ad_position: 'top-left',
                      ad_type: 'course',
                      agent: getBrowserInfo(),
                    },
                  });
                }}
                href={link}
                alignItems="center"
                display="flex"
                justifyContent="center"
                colorScheme="success"
                color="success"
                background="white"
                gridGap="10px"
                width="100%"
                _hover="none"
                marginTop="10px"
              >
                <Box as="span" display="flex">
                  {t('start-tutorial')}
                </Box>
              </Link>
            </>
          );
        })}
      </Box>
      {!isLoading ? (
        <Box display={{ base: 'none', md: 'block' }} as="aside" minWidth={{ base: '100%', md: '214px' }} width="auto" margin="0 auto" {...rest}>
          {title && (
            <Heading as="span" size="18px" lineHeight="21px" m="10px 0 20px 0">
              {title || t('continue-learning-course')}
            </Heading>
          )}
          <Box display="flex" flexDirection={{ base: 'row', md: 'column' }} overflow="auto" gridGap="14px">
            {recommendations.map((recom) => {
              const recomLink = getLink(recom);
              const link = `${recomLink}?internal_cta_placement=mktsiderecommendedcourses&internal_cta_content=${recom?.slug}`;
              const tags = [];

              return (
                <Box key={recom?.slug} overflow="hidden" border="1px solid" borderColor={recom.color || { base: 'default', md: 'success' }} borderRadius={rest.borderRadius || '8px'}>
                  {recom?.banner_image
                  && <Image src={recom?.banner_image} width="100%" height="120px" />}
                  <Container borderRadius="none" padding={containerPadding} course={recom} courses={recommendations}>
                    <TagCapsule tags={tags} background="green.light" color="green.500" fontWeight={700} fontSize="13px" marginY="0" paddingX="0" variant="rounded" gap="10px" display={{ base: 'none', md: 'inherit' }} />
                    <Box mb="10px" display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="8px" alignItems="center">
                      <TagCapsule tags={tags} background="green.light" color="green.500" fontWeight={700} fontSize="13px" marginY="0" paddingX="0" variant="rounded" gap="10px" display={{ base: 'inherit', md: 'none' }} />
                      {(recom.icon_url || getMainTechIcon())
                        && <Image display={{ base: 'none', md: 'inherit' }} src={recom.icon_url ? recom.icon_url : getMainTechIcon()} width="46px" height="46px" borderRadius="8px" padding={!recom.icon_url && '8px'} />}
                      <Heading as="span" fontWeight="400" size="xsm">
                        {recom?.course_translation?.title || recom.title}
                      </Heading>
                    </Box>
                    <Text display={{ base: 'none', md: 'inherit' }} fontSize="sm" lineHeight="14px">
                      {recom?.course_translation?.description || recom?.course_translation?.short_description || recom.description}
                    </Text>
                    <Link
                      onClick={() => {
                        setStorageItem('redirected-from', link);
                        reportDatalayer({
                          dataLayer: {
                            event: 'ad_interaction',
                            course_slug: recom.slug,
                            course_title: recom?.course_translation?.title ? recom.course_translation.title : recom.title,
                            ad_position: 'top-left',
                            ad_type: 'course',
                            agent: getBrowserInfo(),
                          },
                        });
                      }}
                      href={link}
                      _hover={{ textDecoration: 'none' }}
                      textAlign="center"
                      padding="7px 16px"
                      fontWeight="700"
                      borderRadius="4px"
                      width="100%"
                      color="white"
                      backgroundColor={recom.color || 'blue.default'}
                    >
                      {t('start-tutorial')}
                    </Link>
                  </Container>
                </Box>
              );
            })}
          </Box>
        </Box>
      ) : (
        <CardSkeleton quantity={1} cardHeight="350px" cardWidth="250px" gridTemplateColumns="none" />
      )}
    </>
  );
}

MktSideRecommendations.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  endpoint: PropTypes.string,
  containerPadding: PropTypes.string,
  technologies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.string])),
};

MktSideRecommendations.defaultProps = {
  title: '',
  endpoint: defaultEndpoint,
  containerPadding: '8px',
  technologies: [],
};

Container.propTypes = {
  recommendation: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.string])),
  recommendations: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.string])),
  children: PropTypes.node.isRequired,
  borderRadius: PropTypes.string,
};

Container.defaultProps = {
  recommendation: {},
  recommendations: [],
  borderRadius: '8px',
};

export default MktSideRecommendations;
