import { Box, Image } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useStyle from '../hooks/useStyle';
import Heading from './Heading';
import Text from './Text';
import Icon from './Icon';
import { CardSkeleton } from './Skeleton';
import Link from './NextChakraLink';
import modifyEnv from '../../../modifyEnv';

const defaultEndpoint = '/v1/marketing/course';
const coursesLimit = 1;

function MktSideRecommendedCourses({ title, endpoint }) {
  const { t, lang } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(true);
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const [courses, setCourses] = useState([]);

  const { featuredColor } = useStyle();

  const headers = {
    'Accept-Language': lang,
  };

  useEffect(async () => {
    try {
      const res = await fetch(`${BREATHECODE_HOST}${endpoint}`, { headers });
      const data = await res.json();

      if (res?.status < 400 && data.length > 0) {
        setIsLoading(false);
        setCourses(data?.filter((course) => course.course_translation).slice(0, coursesLimit));
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  const featuredCourse = courses?.[0];

  return (
    <Box background={featuredColor} minWidth="214px" width="auto" padding="8px" borderRadius="8px" margin="0 auto">
      <Heading size="18px" lineHeight="21px" m="10px 0 20px 0">
        {title || t('continue-learning-course')}
      </Heading>
      {!isLoading ? (
        <Box display="flex" flexDirection="column" gridGap="10px" background="white" color="black" padding="9px 8px" borderRadius="8px">
          <Box display="flex" gridGap="8px">
            <Image src={featuredCourse?.icon_url} width="46px" height="46px" borderRadius="8px" background="green.400" />
            <Heading size="18px">
              {featuredCourse?.course_translation?.title}
            </Heading>
          </Box>
          <Text fontSize="12px" lineHeight="14px" padding="0 20px">
            {featuredCourse?.course_translation?.short_description || featuredCourse?.course_translation?.description}
          </Text>
          <Link
            variant="buttonDefault"
            display="flex"
            href={`https://4geeks.com/${featuredCourse?.slug}`}
            alignItems="center"
            width="auto"
            gridGap="10px"
            margin="0 20px"
          >
            {t('learn-more')}
            <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
          </Link>
        </Box>
      ) : (
        <CardSkeleton withoutContainer quantity={1} />
      )}
    </Box>
  );
}

MktSideRecommendedCourses.propTypes = {
  title: PropTypes.string,
  endpoint: PropTypes.string,
};

MktSideRecommendedCourses.defaultProps = {
  title: '',
  endpoint: defaultEndpoint,
};

export default MktSideRecommendedCourses;
