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
import { getBrowserSize } from '../../utils';
import useStyle from '../hooks/useStyle';
import { parseQuerys } from '../../utils/url';

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
      <Link href={`https://4geeks.com${langConnector}/${course?.slug}`} _hover={{ textDecoration: 'none' }} minWidth={{ base: courses?.length > 1 ? '285px' : '100%', md: 'auto' }} justifyContent="space-between" display="flex" flexDirection={{ base: 'row', md: 'column' }} gridGap="10px" background={bgColor} color={fontColor} borderRadius={borderRadius} {...rest}>
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

function MktSideRecommendedCourses({ title, endpoint, containerPadding, ...rest }) {
  const { t, lang } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(true);
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const [courses, setCourses] = useState([]);
  const router = useRouter();
  const qs = parseQuerys({
    featured: true,
    academy: process.env.WHITE_LABEL_ACADEMY || '4,5,6,47',
  });
  const langConnector = router.locale === 'en' ? '' : `/${router.locale}`;

  const headers = {
    'Accept-Language': lang,
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${BREATHECODE_HOST}${endpoint}${qs}`, { headers });
      const data = await res.json();

      if (res?.status < 400 && data.length > 0) {
        setIsLoading(false);
        setCourses(data?.filter((course) => course.course_translation).slice(0, coursesLimit));
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <Box minWidth={{ base: '100%', md: '214px' }} width="auto" padding="8px" margin="0 auto" {...rest}>
      {title && (
        <Heading size="18px" lineHeight="21px" m="10px 0 20px 0">
          {title || t('continue-learning-course')}
        </Heading>
      )}
      {!isLoading && courses?.length > 0 ? (
        <Box display="flex" flexDirection={{ base: 'row', md: 'column' }} overflow="auto" gridGap="14px">
          {courses.map((course) => {
            // const tags = course?.technologies?.length > 0 && typeof course?.technologies === 'string'
            //   ? course?.technologies?.split(',').map((tag) => toCapitalize(tag?.trim()))
            //   : [];
            const tags = ['Free course'];

            return (
              <Container key={course?.slug} course={course} courses={courses} borderRadius={rest.borderRadius} padding={containerPadding}>
                <TagCapsule tags={tags} background="green.light" color="green.500" fontWeight={700} fontSize="13px" marginY="0" paddingX="0" variant="rounded" gap="10px" display={{ base: 'none', md: 'inherit' }} />
                <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="8px">
                  <TagCapsule tags={tags} background="green.light" color="green.500" fontWeight={700} fontSize="13px" marginY="0" paddingX="0" variant="rounded" gap="10px" display={{ base: 'inherit', md: 'none' }} />

                  <Image display={{ base: 'none', md: 'inherit' }} src={course?.icon_url} width="46px" height="46px" borderRadius="8px" background="green.400" />
                  <Heading size="18px">
                    {course?.course_translation?.title}
                  </Heading>
                </Box>
                <Text display={{ base: 'none', md: 'inherit' }} fontSize="12px" lineHeight="14px" padding="0 20px">
                  {course?.course_translation?.short_description || course?.course_translation?.description}
                </Text>
                <Link
                  display={{ base: 'none', md: 'flex' }}
                  variant="buttonDefault"
                  href={`https://4geeks.com${langConnector}/${course?.slug}`}
                  alignItems="center"
                  colorScheme="success"
                  width="auto"
                  gridGap="10px"
                  margin="0 20px"
                >
                  {t('learn-more')}
                  <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
                </Link>
                <Link
                  display={{ base: 'flex', md: 'none' }}
                  href={`https://4geeks.com${langConnector}/${course?.slug}`}
                  alignItems="center"
                  width="auto"
                  color="green.light"
                  gridGap="10px"
                  margin="0 20px"
                >
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
  );
}

MktSideRecommendedCourses.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  endpoint: PropTypes.string,
  containerPadding: PropTypes.string,
};

MktSideRecommendedCourses.defaultProps = {
  title: '',
  endpoint: defaultEndpoint,
  containerPadding: '9px 8px',
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
