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

function MktRecommendedCourses({ id, technologies, background, gridColumn, endpoint, ...rest }) {
  const { t, lang } = useTranslation('common');
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const [courses, setCourses] = useState([]);
  const { hexColor, fontColor, featuredLight } = useStyle();

  const deafultQuerystring = parseQuerys({
    featured: true,
    academy: WHITE_LABEL_ACADEMY,
  });
  const defaultHostAndEndpoint = `${BREATHECODE_HOST}/v1/marketing/course`;

  const headers = {
    'Accept-Language': lang,
  };
  const technologiesArray = typeof technologies === 'string' ? technologies.split(',') : technologies;
  const technologiesTitle = technologies.map((tech) => tech?.title || unSlugifyCapitalize(tech)).slice(0, 4).join(', ');

  const getCourses = async () => {
    try {
      if (typeof technologies === 'string' && technologies.length > 0) {
        const qsConnector = parseQuerys({
          academy: WHITE_LABEL_ACADEMY,
          featured: true,
        });
        const res = await fetch(`${endpoint || defaultHostAndEndpoint}${qsConnector}`, { headers });
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
          const filteredData = list.filter((course) => course.course_translation).slice(0, coursesLimit);
          setCourses(filteredData);
        }
      } else {
        const res = await fetch(`${endpoint || defaultHostAndEndpoint}${deafultQuerystring}`, { headers });
        const data = await res.json();
        setCourses(data.filter((course) => course.course_translation).slice(0, coursesLimit));
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
      margin="0 auto"
      flexWrap="wrap"
      id={id}
      borderRadius="11px"
      padding="16px 8px"
      background={background || featuredLight}
      display="flex"
      border="1px solid"
      borderColor={hexColor.borderColor}
      {...rest}
    >
      <Box
        flexShrink="2"
        minWidth="170px"
        maxWidth={{ base: 'none', lg: '270px' }}
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
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
      </Box>
      <Box
        as="aside"
        flexGrow="1"
        flexDirection={{ base: 'row', xl: courses.length === 1 && 'row-reverse' }}
        justifyContent={{ base: 'center', md: courses.length > 1 ? 'space-between' : 'center', xl: 'space-between' }}
        display="flex"
        flexWrap="wrap"
        gap="10px"
      >
        {courses.map((course) => (
          <PublicCourseCard
            key={course.slug}
            mx={{ base: courses.length === 1 && 'auto', md: '0' }}
            // width={{ base: courses.length === 1 ? '99%' : '300px', sm: '300px' }}
            width="auto"
            maxWidth="240px"
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
                },
              });
            }}
            href={course?.course_translation?.landing_url}
            programName={course.course_translation.title}
            programSlug={course.slug}
            programDescription={course.course_translation.description}
            flexShrink="0"
          />
        ))}
      </Box>
    </Box>
  );
}

MktRecommendedCourses.propTypes = {
  id: PropTypes.string,
  background: PropTypes.string,
  technologies: PropTypes.string,
  endpoint: PropTypes.string,
  gridColumn: PropTypes.string,
};

MktRecommendedCourses.defaultProps = {
  id: null,
  background: null,
  technologies: null,
  gridColumn: '1 / span 10',
  endpoint: '',
};

export default MktRecommendedCourses;
