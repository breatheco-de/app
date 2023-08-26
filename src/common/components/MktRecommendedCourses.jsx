import { useEffect, useState, useRef } from 'react';
import {
  Box,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Icon from './Icon';
import Heading from './Heading';
import PublicCourseCard from './PublicCourseCard';
import GridContainer from './GridContainer';
import useStyle from '../hooks/useStyle';
import modifyEnv from '../../../modifyEnv';
import { parseQuerys } from '../../utils/url';

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

  const qsConnector = parseQuerys({
    featured: true,
    academy: process.env.WHITE_LABEL_ACADEMY || '4,5,6,47',
  }, true);
  const defaultHostAndEndpoint = `${BREATHECODE_HOST}/v1/marketing/course`;

  const headers = {
    'Accept-Language': lang,
  };

  const getCourses = async () => {
    try {
      if (typeof technologies === 'string' && technologies.length > 0) {
        const res = await fetch(`${endpoint || defaultHostAndEndpoint}?technologies=${technologies}${qsConnector}`, { headers });
        const data = await res.json();
        const filteredData = data.filter((course) => course.course_translation).slice(0, coursesLimit);
        if (filteredData.length > 0) {
          setCourses(filteredData);
          return;
        }
      }
      const res = await fetch(endpoint || defaultHostAndEndpoint, { headers });
      const data = await res.json();
      setCourses(data.filter((course) => course.course_translation).slice(0, coursesLimit));
    } catch (e) {
      console.log(e);
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
    const walk = (x - startX) * 3; //scroll-fast
    ref.current.scrollLeft = scrollLeft - walk;
  };

  return courses.length > 0 && (
    <GridContainer
      maxW="container.xl"
      gridTemplateColumns="repeat(10, 1fr)"
      padding="0"
      {...rest}
    >
      <Box
        // flexWrap={{ base: 'wrap', xl: 'nowrap' }}
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
              programName={course.course_translation.title}
              programSlug={course.slug}
              programDescription={course.course_translation.description}
              flexShrink="0"
            />
          ))}
        </Box>
      </Box>
    </GridContainer>
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
