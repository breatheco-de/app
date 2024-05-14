import { useEffect, useState } from 'react';
import {
  Box,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Heading from './Heading';
import Text from './Text';
import PublicCourseCard from './PublicCourseCard';
import useStyle from '../hooks/useStyle';
import modifyEnv from '../../../modifyEnv';
import { parseQuerys } from '../../utils/url';
import { WHITE_LABEL_ACADEMY } from '../../utils/variables';
import { error } from '../../utils/logging';
import { setStorageItem, unSlugifyCapitalize } from '../../utils';
import { reportDatalayer } from '../../utils/requests';

const coursesLimit = 2;

function MktRecommendedCourses({ id, technologies, background, gridColumn, endpoint, title, ...rest }) {
  const { t, lang } = useTranslation('common');
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const [courses, setCourses] = useState([]);
  const { hexColor, fontColor, featuredLight } = useStyle();

  const defaultHostAndEndpoint = `${BREATHECODE_HOST}/v1/marketing/course`;

  const headers = {
    'Accept-Language': lang,
  };

  const processTechnologies = () => {
    if (typeof technologies === 'string') return technologies.split(',');
    if (Array.isArray(technologies) && technologies[0]) {
      if (typeof technologies[0] === 'string') return technologies;

      return technologies.map((tech) => tech.slug);
    }
    return [];
  };

  const technologiesArray = processTechnologies(technologies);
  const technologiesTitle = technologiesArray.map((tech) => unSlugifyCapitalize(tech)).slice(0, 4).join(', ') || '';

  const getCourses = async () => {
    try {
      const chosenEndpoint = endpoint || defaultHostAndEndpoint;
      const qsConnector = parseQuerys({
        featured: true,
        academy: WHITE_LABEL_ACADEMY,
      }, chosenEndpoint.includes('?'));
      const res = await fetch(`${chosenEndpoint}${qsConnector}`, { headers });
      const data = await res.json();
      if (res?.status < 400 && data.length > 0) {
        const filterActiveCourses = data.filter((course) => course.visibility !== 'UNLISTED');
        const sortedCourses = filterActiveCourses.slice(0, coursesLimit).sort((a, b) => {
          if (technologiesArray.some((tech) => b.technologies.includes(tech))) return 1;
          return -1;
        });
        setCourses(sortedCourses);
      }
    } catch (e) {
      error(e);
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  return courses.length > 0 && (
    <Box
      maxWidth="1280px"
      margin="2rem auto"
      flexWrap={{ base: 'wrap', xl: 'nowrap' }}
      id={id || 'recommended-courses'}
      borderRadius="11px"
      padding="16px"
      background={background || featuredLight}
      display="flex"
      border="1px solid"
      borderColor={hexColor.borderColor}
      gap="10px"
      {...rest}
    >
      <Box
        flexShrink="2"
        // minWidth="170px"
        maxWidth={{ base: 'none', lg: '270px' }}
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        {title ? (
          <>
            <Heading
              as="h2"
              size="30px"
              fontWeight="700"
              color={fontColor}
            >
              {title}
            </Heading>
          </>
        ) : (
          <>
            <Heading
              as="h2"
              size="30px"
              fontWeight="700"
              color={fontColor}
            >
              {t('continue-learning')}
            </Heading>
            {technologiesTitle && technologiesTitle.length > 0 && (
              <Text size="18px" fontWeight="400" mt="0 !important">
                {t('technologies-and-more', { technologies: technologiesTitle })}
              </Text>
            )}
          </>
        )}
      </Box>
      <Box
        as="aside"
        flexGrow="1"
        flexShrink={{ base: '1', xl: '0' }}
        justifyContent={{
          base: 'center',
          // md: courses.length > 1 ? 'space-between' : 'center',
          xl: 'flex-end',
        }}
        display="flex"
        flexWrap={{ base: 'wrap', lg: 'nowrap' }}
        gap="10px"
      >
        {courses.map((course) => (
          <PublicCourseCard
            key={course.slug}
            mx={{ base: courses.length === 1 && 'auto', md: '0' }}
            // width={{ base: courses.length === 1 ? '99%' : '300px', sm: '300px' }}
            width={{ base: '100%', md: 'auto' }}
            maxWidth={{ base: 'none', md: '240px' }}
            icon_url={course.icon_url}
            iconBackground="#25BF6C"
            onClick={() => {
              setStorageItem('redirected-from', course?.course_translation?.landing_url);
              reportDatalayer({
                dataLayer: {
                  event: 'ad_interaction',
                  course_slug: course.slug,
                  course_title: course.title,
                  ad_position: 'bottom-center',
                  ad_type: 'course',
                },
              });
            }}
            href={course?.course_translation?.landing_url}
            programName={course.course_translation.title}
            programSlug={course.slug}
            programDescription={course.course_translation.description}
            // flexShrink="0"
          />
        ))}
      </Box>
    </Box>
  );
}

MktRecommendedCourses.propTypes = {
  id: PropTypes.string,
  background: PropTypes.string,
  title: PropTypes.string,
  technologies: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  endpoint: PropTypes.string,
  gridColumn: PropTypes.string,
};

MktRecommendedCourses.defaultProps = {
  id: null,
  background: null,
  title: null,
  technologies: null,
  gridColumn: '1 / span 10',
  endpoint: '',
};

export default MktRecommendedCourses;
