import { useEffect, useState, useRef } from 'react';
import {
  Box, Flex,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Icon from './Icon';
import Heading from './Heading';
import PublicCourseCard from './PublicCourseCard';
import useStyle from '../hooks/useStyle';
import modifyEnv from '../../../modifyEnv';
import { parseQuerys } from '../../utils/url';
import { WHITE_LABEL_ACADEMY } from '../../utils/variables';
import { error } from '../../utils/logging';
import { setStorageItem } from '../../utils';
import { reportDatalayer } from '../../utils/requests';

const coursesLimit = 2;

function MktRecommendedCourses({ id, technologies, background, title, gridColumn, endpoint, ...rest }) {
  const { lang } = useTranslation('common');
  const ref = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [courses, setCourses] = useState([]);
  const { hexColor, fontColor, featuredColor } = useStyle();

  const deafultQuerystring = parseQuerys({
    featured: true,
    academy: WHITE_LABEL_ACADEMY,
  });
  const defaultHostAndEndpoint = `${BREATHECODE_HOST}/v1/marketing/course`;

  const headers = {
    'Accept-Language': lang,
  };
  const technologiesArray = typeof technologies === 'string' ? technologies.split(',') : technologies;

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

  useEffect(() => {
    if (ref.current?.clientWidth !== ref.current?.scrollWidth) ref.current.scrollLeft = 45;
  }, [courses]);

  const onMouseDown = (e) => {
    setIsDown(true);
    const pageX = e.touches ? e.touches[0].pageX : e.pageX;
    setStartX(pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDown(false);
  };

  const onMouseUp = () => {
    setIsDown(false);
  };

  const onMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const pageX = e.touches ? e.touches[0].pageX : e.pageX;
    const x = pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1; //scroll-normal
    ref.current.scrollLeft = scrollLeft - walk;
  };

  return courses.length > 0 && (
    <Flex
      maxWidth="1280px"
      margin="0 auto"
      justifyContent="center"
      {...rest}
    >
      <Box
        gridColumn={gridColumn}
        flexWrap="wrap"
        id={id}
        borderRadius="13px"
        padding={{ base: '20px', lg: '30px' }}
        background={background || featuredColor}
        display="flex"
      >
        {title && (
          <Box
            flexShrink="2"
            minWidth="170px"
            maxWidth={{ base: 'none', lg: '300px' }}
          >
            <Heading
              as="h2"
              size="30px"
              fontWeight="700"
              color={fontColor}
              dangerouslySetInnerHTML={{ __html: title }}
            />
            <Icon icon="longArrowRight" style={{ margin: '10px 0' }} color={hexColor.blueDefault} width="100px" height="80px" />
          </Box>
        )}
        <Box
          as="aside"
          ref={ref}
          flexGrow="1"
          flexDirection={{ base: 'row', xl: courses.length === 1 && 'row-reverse' }}
          justifyContent={{ base: courses.length > 1 && 'space-between', md: courses.length > 1 ? 'space-between' : 'center', xl: 'space-between' }}
          display="flex"
          gridGap="10px"
          overflowX="hidden"
          cursor={ref.current?.clientWidth !== ref.current?.scrollWidth && 'grab'}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          onTouchStart={onMouseDown}
          onTouchMove={onMouseMove}
          onTouchEnd={onMouseLeave}
        >
          {courses.map((course) => (
            <PublicCourseCard
              key={course.slug}
              margin={{ base: courses.length === 1 && 'auto', md: '0' }}
              width={{ base: courses.length === 1 ? '99%' : '300px', sm: '300px' }}
              maxWidth="300px"
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
    </Flex>
  );
}

MktRecommendedCourses.propTypes = {
  id: PropTypes.string,
  background: PropTypes.string,
  title: PropTypes.string,
  technologies: PropTypes.string,
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
