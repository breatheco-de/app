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

function Container({ course, courses, borderRadius, children, ...rest }) {
  const router = useRouter();
  const { fontColor } = useStyle();
  const bgColor = useColorModeValue('gray.light3', 'featuredDark');
  const langConnector = router.locale === 'en' ? '' : `/${router.locale}`;

  const { width: screenWidth } = getBrowserSize();

  if (screenWidth < 768) {
    return (
      <Link href={`${ORIGIN_HOST}${langConnector}/${course?.slug}`} _hover={{ textDecoration: 'none' }} minWidth={{ base: courses?.length > 1 ? '285px' : '100%', md: 'auto' }} justifyContent="space-between" display="flex" flexDirection={{ base: 'row', md: 'column' }} gridGap="10px" background={bgColor} color={fontColor} borderRadius={borderRadius} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <Box minWidth={{ base: courses?.length > 1 ? '285px' : '100%', md: 'auto' }} justifyContent="space-between" display="flex" flexDirection={{ base: 'row', md: 'column' }} gridGap="10px" background={bgColor} color={fontColor} borderRadius={borderRadius} {...rest}>
      {children}
    </Box>
  );
}

function MktSideRecommendedCourses({ title, endpoint, technologies, containerPadding, ...rest }) {
  const { t, lang } = useTranslation('common');
  const { hexColor } = useStyle();
  const [isLoading, setIsLoading] = useState(true);
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const [courses, setCourses] = useState([]);
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

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${BREATHECODE_HOST}${endpoint}${qs}`, { headers });
      const data = await res.json();

      if (res?.status < 400 && data.length > 0) {
        const coursesSorted = [];
        for (let i = 0; i < technologiesArray.length; i += 1) {
          const course = data.find((c) => c?.technologies?.includes(technologiesArray[i]));
          const alreadyExists = coursesSorted.some((c) => c?.slug === course?.slug);

          if (course && !alreadyExists) {
            coursesSorted.push(course);
          }
        }

        const list = coursesSorted?.length > 0 ? coursesSorted : data;
        setIsLoading(false);

        setCourses(list?.filter((course) => course?.course_translation && course?.visibility !== 'UNLISTED').slice(0, coursesLimit));
      }
    } catch (e) {
      error(e);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return courses?.length > 0 && (
    <>
      <Box color="white" zIndex="10" borderRadius="11px 11px 0 0" background={hexColor.greenLight} padding="10px 20px" bottom="0" position="sticky" marginBottom="20px" display={{ base: 'block', md: 'none' }} textAlign="left">
        {courses.map((course) => {
          const courseLink = course?.course_translation?.landing_url;
          const link = courseLink || `${ORIGIN_HOST}${langConnector}/${course?.slug}`;

          return (
            <>
              <Box display="flex" alignItems="center" gap="10px">
                <Image src={course?.icon_url} width="46px" height="46px" borderRadius="8px" background={course?.color || 'green.400'} />
                <Heading as="span" size="18px">
                  {course?.course_translation?.title}
                </Heading>
              </Box>
              <Link
                variant="buttonDefault"
                onClick={() => {
                  setStorageItem('redirected-from', link);
                  reportDatalayer({
                    dataLayer: {
                      event: 'ad_interaction',
                      course_slug: course.slug,
                      course_title: course.title,
                      ad_position: 'top-left',
                      ad_type: 'course',
                    },
                  });
                }}
                href={`${link}?internal_cta_placement=mktsiderecommendedcourses&internal_cta_content=${course?.slug}&internal_cta_campaign=null`}
                alignItems="center"
                display="flex"
                justifyContent="center"
                colorScheme="success"
                color="success"
                background="white"
                gridGap="10px"
                width="100%"
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
        {!isLoading && courses?.length > 0 ? (
          <Box display="flex" flexDirection={{ base: 'row', md: 'column' }} overflow="auto" gridGap="14px">
            {courses.map((course) => {
              const courseLink = course?.course_translation?.landing_url;
              const link = courseLink || `${ORIGIN_HOST}${langConnector}/${course?.slug}`;
              // const tags = course?.technologies?.length > 0 && typeof course?.technologies === 'string'
              //   ? course?.technologies?.split(',').map((tag) => toCapitalize(tag?.trim()))
              //   : [];
              const tags = [];
              // const tags = ['Free course'];

              return (
                <Container border="1px solid" borderColor={{ base: 'default', md: 'success' }} key={course?.slug} course={course} courses={courses} borderRadius={rest.borderRadius} padding={containerPadding}>
                  <TagCapsule tags={tags} background="green.light" color="green.500" fontWeight={700} fontSize="13px" marginY="0" paddingX="0" variant="rounded" gap="10px" display={{ base: 'none', md: 'inherit' }} />
                  <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="8px">
                    <TagCapsule tags={tags} background="green.light" color="green.500" fontWeight={700} fontSize="13px" marginY="0" paddingX="0" variant="rounded" gap="10px" display={{ base: 'inherit', md: 'none' }} />

                    <Image display={{ base: 'none', md: 'inherit' }} src={course?.icon_url} width="46px" height="46px" borderRadius="8px" background={course?.color || 'green.400'} />
                    <Heading as="span" size="18px">
                      {course?.course_translation?.title}
                    </Heading>
                  </Box>
                  <Text display={{ base: 'none', md: 'inherit' }} fontSize="12px" lineHeight="14px" padding="0 20px">
                    {course?.course_translation?.short_description || course?.course_translation?.description}
                  </Text>
                  <Link
                    variant={{ base: '', md: 'buttonDefault' }}
                    onClick={() => {
                      setStorageItem('redirected-from', link);
                      reportDatalayer({
                        dataLayer: {
                          event: 'ad_interaction',
                          course_slug: course.slug,
                          course_title: course.title,
                          ad_position: 'top-left',
                          ad_type: 'course',
                        },
                      });
                    }}
                    href={`${link}?internal_cta_placement=mktsiderecommendedcourses&internal_cta_content=${course?.slug}&internal_cta_campaign=null`}
                    alignItems="center"
                    display="flex"
                    colorScheme={{ base: 'default', md: 'success' }}
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

MktSideRecommendedCourses.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  endpoint: PropTypes.string,
  containerPadding: PropTypes.string,
  technologies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.string])),
};

MktSideRecommendedCourses.defaultProps = {
  title: '',
  endpoint: defaultEndpoint,
  containerPadding: '9px 8px',
  technologies: [],
};

Container.propTypes = {
  course: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.string])),
  courses: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.string])),
  children: PropTypes.node.isRequired,
  borderRadius: PropTypes.string,
};

Container.defaultProps = {
  course: {},
  courses: [],
  borderRadius: '8px',
};

export default MktSideRecommendedCourses;
