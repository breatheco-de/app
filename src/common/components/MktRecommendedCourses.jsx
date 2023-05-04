import { useEffect, useState, useRef } from 'react';
import {
  Box,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Heading from './Heading';
import PublicCourseCard from './PublicCourseCard';
import GridContainer from './GridContainer';
import useStyle from '../hooks/useStyle';

const defaultEndpoint = '/v1/marketing/course';
const coursesLimit = 2;

const MktRecommendedCourses = ({ id, technologies, background, title, gridColumn, endpoint, ...rest }) => {
  const ref = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [courses, setCourses] = useState([]);
  const { hexColor, featuredColor, fontColor } = useStyle();

  const getCourses = async () => {
    try {
      if (typeof technologies === 'string' && technologies.length > 0) {
        const res = await fetch(`${endpoint}?technologies=${technologies}`);
        const data = await res.json();
        const filteredData = data.filter((course) => course.course_translation).slice(0, coursesLimit);
        if (filteredData.length > 0) {
          setCourses(filteredData);
          return;
        }
      }
      const res = await fetch(endpoint);
      const data = await res.json();
      setCourses(data.filter((course) => course.course_translation).slice(0, coursesLimit));
    } catch (e) {
      console.log(e);
    }
  };

  // const dummyCourse = {
  //   icon_url: 'https://storage.googleapis.com/breathecode/logos-workshops/javascript-event-type.svg',
  //   slug: 'dummy',
  //   course_translation: {
  //     title: 'Curso Interactivo de Javascript',
  //     description: 'Aprende Javascript desde cero en una Semana con este gran curso. En el podrás aprender sobre condicionales, funciones, el manejo de arrays y mucho más!',
  //   },
  // };

  // if (courses.length === 1) setCourses([...courses, dummyCourse]);

  useEffect(() => {
    getCourses();
  }, []);

  useEffect(() => {
    if (ref.current?.clientWidth !== ref.current?.scrollWidth) ref.current.scrollLeft = 25;
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
    <>
      <GridContainer
        maxW="container.xl"
        gridTemplateColumns="repeat(10, 1fr)"
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
            >
              {title}
              <Icon icon="longArrowRight" style={{ margin: '10px 0' }} color={hexColor.blueDefault} width="80px" />
            </Heading>
          </Box>
          )}
          <Box
            ref={ref}
            flexGrow="1"
            flexDirection={{ base: 'row', md: 'row-reverse' }}
            justifyContent="space-between"
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
    </>
  );
};

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
  endpoint: `${process.env.BREATHECODE_HOST}${defaultEndpoint}`,
};

export default MktRecommendedCourses;
