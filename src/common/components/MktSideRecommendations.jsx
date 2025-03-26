import { Box, Image, Link, useColorModeValue } from '@chakra-ui/react';
import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import Heading from './Heading';
import Text from './Text';
import TagCapsule from './TagCapsule';
import { CardSkeleton } from './Skeleton';
import { getBrowserSize, setStorageItem, getBrowserInfo } from '../../utils';
import { ORIGIN_HOST } from '../../utils/variables';
import { reportDatalayer } from '../../utils/requests';
import useStyle from '../hooks/useStyle';
import useSession from '../hooks/useSession';
import useRecommendations from '../hooks/useRecommendations';
import ReactPlayerV2 from './ReactPlayerV2';

const defaultEndpoint = '/v1/marketing/course';

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
  const { isLoading, error, recommendations } = useRecommendations(endpoint, technologies, lang);
  const router = useRouter();

  const langConnector = useMemo(
    () => (router.locale === 'en' ? '' : `/${router.locale}`),
    [router.locale],
  );

  const getLink = useCallback((recommendation) => {
    if (recommendation?.course_translation?.landing_url) {
      return recommendation.course_translation.landing_url;
    }
    return `${ORIGIN_HOST}${langConnector}/interactive-exercise/${recommendation?.slug}`;
  }, [langConnector]);

  const getMainTechIcon = useCallback(() => {
    const techWithURL = technologies.find((tech) => tech.icon_url !== null);
    return techWithURL?.icon_url;
  }, [technologies]);

  const determineIconBackgroundColor = useCallback(
    (recom) => recom?.color || 'blue.50',
    [],
  );

  const handleInteraction = useCallback((link, recom) => {
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
  }, []);

  if (location?.countryShort === 'ES') return null;
  if (error) {
    return (
      <Box>
        Error:
        {error.message}
      </Box>
    );
  }
  if (isLoading) return <CardSkeleton quantity={1} cardHeight="350px" cardWidth="250px" gridTemplateColumns="none" />;
  if (!recommendations?.length) return null;

  return recommendations?.length > 0 && (
    <>
      <Box color="white" zIndex="10" borderRadius="11px 11px 0 0" background={hexColor.greenLight} padding="10px 20px" bottom="0" position="sticky" marginBottom="20px" display={{ base: 'block', md: 'none' }} textAlign="left">
        {recommendations.map((recom) => {
          const recomLink = getLink(recom);
          const link = `${recomLink}?internal_cta_placement=mktsiderecommendedcourses&internal_cta_content=${recom?.slug}`;

          return (
            <>
              <Box display="flex" alignItems="center" gap="10px">
                {(recom.icon_url || getMainTechIcon()) && (
                  <Image
                    src={recom.icon_url ? recom.icon_url : getMainTechIcon()}
                    width="46px"
                    height="46px"
                    borderRadius="8px"
                    padding={!recom.icon_url && '8px'}
                    color="white"
                    background={determineIconBackgroundColor(recom)}
                  />
                )}
                <Heading as="span" size="18px" paddingLeft={!recom.icon_url && !getMainTechIcon() && '20px'}>
                  {recom?.course_translation?.title || recom.title}
                </Heading>
              </Box>
              <Link
                variant="buttonDefault"
                onClick={() => {
                  handleInteraction(link, recom);
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
                <Box
                  key={recom?.slug}
                  overflow="hidden"
                  border="1px solid"
                  borderColor={recom.color || { base: 'default', md: 'success' }}
                  borderRadius={rest.borderRadius || '8px'}
                >
                  {recom?.course_translation?.video_url && (
                    <ReactPlayerV2
                      width="100%"
                      withModal
                      url={recom?.course_translation?.video_url}
                      withThumbnail
                      thumbnailStyle={{
                        borderRadius: '0 0 0 0',
                      }}
                    />
                  )}
                  {recom?.banner_image && !recom?.course_translation?.video_url && (
                    <Image src={recom?.banner_image} width="100%" height="120px" />
                  )}
                  <Container
                    borderRadius="none"
                    padding={containerPadding}
                    course={recom}
                    courses={recommendations}
                  >
                    <TagCapsule
                      tags={tags}
                      background="green.light"
                      color="green.500"
                      fontWeight={700}
                      fontSize="13px"
                      marginY="0"
                      paddingX="0"
                      variant="rounded"
                      gap="10px"
                      display={{ base: 'none', md: 'inherit' }}
                    />
                    <Box
                      mb="10px"
                      display="flex"
                      flexDirection={{ base: 'column', md: 'row' }}
                      gridGap="8px"
                      alignItems="center"
                    >
                      <TagCapsule
                        tags={tags}
                        background="green.light"
                        color="green.500"
                        fontWeight={700}
                        fontSize="13px"
                        marginY="0"
                        paddingX="0"
                        variant="rounded"
                        gap="10px"
                        display={{ base: 'inherit', md: 'none' }}
                      />
                      {(recom.icon_url || getMainTechIcon()) && (
                        <Image
                          display={{ base: 'none', md: 'inherit' }}
                          src={recom.icon_url ? recom.icon_url : getMainTechIcon()}
                          width="46px"
                          height="46px"
                          borderRadius="8px"
                          padding={!recom.icon_url && '8px'}
                        />
                      )}
                      <Heading as="span" fontWeight="400" size="xsm">
                        {recom?.course_translation?.title || recom.title}
                      </Heading>
                    </Box>
                    <Text display={{ base: 'none', md: 'inherit' }} fontSize="sm" lineHeight="14px">
                      {recom?.course_translation?.description || recom?.course_translation?.short_description || recom.description}
                    </Text>
                    <Link
                      onClick={() => {
                        handleInteraction(link, recom);
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
