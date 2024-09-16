import { Box, Image, Link, useColorModeValue } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Heading from './Heading';
import Text from './Text';
import Icon from './Icon';
import { CardSkeleton } from './Skeleton';
// import Link from './NextChakraLink';
import modifyEnv from '../../../modifyEnv';
// import { toCapitalize } from '../../utils';
import TagCapsule from './TagCapsule';
import { getBrowserSize, setStorageItem } from '../../utils';
import { ORIGIN_HOST, WHITE_LABEL_ACADEMY } from '../../utils/variables';
import useStyle from '../hooks/useStyle';
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
  const [isLoading, setIsLoading] = useState(true);
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
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

  const fetchAndSetCourses = async () => {
    const response = await fetch(`${BREATHECODE_HOST}${endpoint}${qs}`, { headers });
    if (!response.ok) throw new Error(`Failed to fetch courses: ${response.statusText}`);
    const coursesData = await response.json();

    if (coursesData.length > 0) {
      const sortedCourses = coursesData.sort((a, b) => {
        const aMatches = a.technologies.split(',').filter((tech) => technologiesArray.includes(tech)).length;
        const bMatches = b.technologies.split(',').filter((tech) => technologiesArray.includes(tech)).length;
        return bMatches - aMatches;
      });
      setRecommendations(sortedCourses.slice(0, coursesLimit));
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

      setIsLoading(false);
    } catch (err) {
      handleFetchError(err);
    }
  };

  const getLink = (recommendation) => {
    if (recommendation?.course_translation?.landing_url) return recommendation?.course_translation?.landing_url;
    return `${ORIGIN_HOST}${langConnector}/interactive-exercise/${recommendation?.slug}`;
  };

  const getMainTechIcon = () => {
    const techWithURL = technologies.find((tech) => tech.icon_url !== null);
    return techWithURL.icon_url;
  };

  const determineIconBackgroundColor = (recom) => {
    if (recom?.color) {
      return recom.color;
    }
    return 'blue.50';
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return recommendations?.length > 0 && (
    <>
      <Box color="white" zIndex="10" borderRadius="11px 11px 0 0" background={hexColor.greenLight} padding="10px 20px" bottom="0" position="sticky" marginBottom="20px" display={{ base: 'block', md: 'none' }} textAlign="left">
        {recommendations.map((recom) => {
          const recomLink = getLink(recom);
          const link = `${recomLink}?internal_cta_placement=mktsiderecommendedcourses&internal_cta_content=${recom?.slug}`;

          return (
            <>
              <Box display="flex" alignItems="center" gap="10px">
                <Image src={recom.icon_url ? recom.icon_url : getMainTechIcon()} width="46px" height="46px" borderRadius="8px" padding={!recom.icon_url && '8px'} color="white" background={determineIconBackgroundColor(recom)} />
                <Heading as="span" size="18px">
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
                  {t('learn-more')}
                </Box>
                <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
              </Link>
            </>
          );
        })}
      </Box>
      <Box display={{ base: 'none', md: 'block' }} as="aside" minWidth={{ base: '100%', md: '214px' }} width="auto" margin="0 auto" {...rest}>
        {title && (
          <Heading as="span" size="18px" lineHeight="21px" m="10px 0 20px 0">
            {title || t('continue-learning-course')}
          </Heading>
        )}
        {!isLoading ? (
          <Box display="flex" flexDirection={{ base: 'row', md: 'column' }} overflow="auto" gridGap="14px">
            {recommendations.map((recom) => {
              const recomLink = getLink(recom);
              const link = `${recomLink}?internal_cta_placement=mktsiderecommendedcourses&internal_cta_content=${recom?.slug}`;
              const tags = [];

              return (
                <Container border="1px solid" borderColor={recom.color || { base: 'default', md: 'success' }} key={recom?.slug} course={recom} courses={recommendations} borderRadius={rest.borderRadius} padding={containerPadding}>
                  <TagCapsule tags={tags} background="green.light" color="green.500" fontWeight={700} fontSize="13px" marginY="0" paddingX="0" variant="rounded" gap="10px" display={{ base: 'none', md: 'inherit' }} />
                  <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="8px" alignItems="center">
                    <TagCapsule tags={tags} background="green.light" color="green.500" fontWeight={700} fontSize="13px" marginY="0" paddingX="0" variant="rounded" gap="10px" display={{ base: 'inherit', md: 'none' }} />

                    <Image display={{ base: 'none', md: 'inherit' }} src={recom.icon_url ? recom.icon_url : getMainTechIcon()} width="46px" height="46px" borderRadius="8px" padding={!recom.icon_url && '8px'} background={determineIconBackgroundColor(recom)} />
                    <Heading as="span" size="18px">
                      {recom?.course_translation?.title || recom.title}
                    </Heading>
                  </Box>
                  <Text display={{ base: 'none', md: 'inherit' }} fontSize="12px" lineHeight="14px" padding="0 20px">
                    {recom?.course_translation?.description || recom?.course_translation?.short_description || recom.description}
                  </Text>
                  <Link
                    variant={{ base: '', md: 'buttonDefault' }}
                    onClick={() => {
                      setStorageItem('redirected-from', link);
                      reportDatalayer({
                        dataLayer: {
                          event: 'ad_interaction',
                          course_slug: recom.slug,
                          course_title: recom?.course_translation?.title ? recom.course_translation.title : recom.title,
                          ad_position: 'top-left',
                          ad_type: 'course',
                        },
                      });
                    }}
                    href={link}
                    alignItems="center"
                    display="flex"
                    colorScheme={{ base: 'default', md: 'blue.400' }}
                    width="auto"
                    color={{ base: 'green.light', md: 'white' }}
                    gridGap="10px"
                    margin="0 20px"
                  >
                    <Box as="span" display={{ base: 'none', md: 'flex' }}>
                      {t('learn-more')}
                    </Box>
                    <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
                  </Link>
                </Container>
              );
            })}
          </Box>
        ) : (
          <CardSkeleton withoutContainer quantity={1} height={rest.skeletonHeight} borderRadius={rest.skeletonBorderRadius} />
        )}
      </Box>
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
  containerPadding: '9px 8px',
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
