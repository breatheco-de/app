import { useEffect, useState } from 'react';
import {
  Box,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Heading from './Heading';
import PublicCourseCard from './PublicCourseCard';
import useStyle from '../hooks/useStyle';

const defaultEndpoint = '/v1/marketing/course';
const coursesLimit = 2;

const MktRecommendedCourses = ({ id, technologies, background, title, ...rest }) => {
  const [courses, setCourses] = useState([]);
  const { hexColor, featuredColor, fontColor } = useStyle();

  const getCourses = async () => {
    try {
      if (typeof technologies === 'string' && technologies.length > 0) {
        const res = await fetch(`${process.env.BREATHECODE_HOST}${defaultEndpoint}?technologies=${technologies}`);
        const data = await res.json();
        const filteredData = data.filter((course) => course.course_translation).slice(0, coursesLimit);
        if (filteredData.length > 0) {
          setCourses(filteredData);
          return;
        }
      }
      const res = await fetch(`${process.env.BREATHECODE_HOST}${defaultEndpoint}`);
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

  return courses.length > 0 && (
    <>
      <Box
        // flexWrap={{ base: 'wrap', xl: 'nowrap' }}
        flexWrap="wrap"
        id={id}
        borderRadius="13px"
        padding={{ base: '20px', lg: '30px' }}
        background={background || featuredColor}
        maxWidth="1280px"
        display="flex"
        {...rest}
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
          flexGrow="1"
          flexDirection="row-reverse"
          justifyContent="space-between"
          display="flex"
          gridGap="10px"
          // maxWidth="790px"
          flexWrap={{ base: 'wrap', lg: 'nowrap' }}
        >
          {courses.map((course) => (
            <PublicCourseCard
              // width="280px"
              icon_url={course.icon_url}
              iconBackground="#25BF6C"
              programName={course.course_translation.title}
              programSlug={course.slug}
              programDescription={course.course_translation.description}
            />
          ))}
        </Box>
      </Box>
    </>
  );
};

MktRecommendedCourses.propTypes = {
  id: PropTypes.string,
  background: PropTypes.string,
  title: PropTypes.string,
  technologies: PropTypes.string,
};

MktRecommendedCourses.defaultProps = {
  id: null,
  background: null,
  title: null,
  technologies: null,
};

export default MktRecommendedCourses;
