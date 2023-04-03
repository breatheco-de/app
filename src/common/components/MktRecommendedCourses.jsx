/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import {
  Box,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Heading from './Heading';
import PublicCourseCard from './PublicCourseCard';
import useStyle from '../hooks/useStyle';

const MktRecommendedCourses = ({ id, endpoint, background, title }) => {
  const [courses, setCourses] = useState([]);
  const { hexColor, featuredColor, fontColor } = useStyle();

  const getCourses = async () => {
    try {
      const res = await fetch(`${process.env.BREATHECODE_HOST}${endpoint}`);
      const data = await res.json();
      setCourses(data.filter((course) => course.course_translation).slice(0, 3));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  const dummyText = 'Aprende Javascript desde cero en una Semana con este gran curso. En el podrás aprender sobre condicionales, funciones, el manejo de arrays y mucho más!';

  return courses.length > 0 && (
    <>
      <Box flexWrap={{ base: 'wrap', md: 'nowrap' }} id={id} borderRadius="13px" padding="20px" background={background || featuredColor} display="flex">
        {title && (
          <Box flexShrink="2" maxWidth="350px">
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
        <Box width="100%" justifyContent="space-evenly" display="flex" gridGap="10px" flexWrap="wrap">
          {courses.map((course) => (
            <PublicCourseCard
              icon_url={course.icon_url}
              iconBackground="#25BF6C"
              programName={course.course_translation.title}
              programDescription={course.course_translation.description}
            />
          ))}
          {/* <PublicCourseCard
            icon_url="https://storage.googleapis.com/breathecode/logos-workshops/javascript-event-type.svg"
            iconBackground="#25BF6C"
            programName="Curso Interactivo de Javascript"
            programDescription={dummyText}
          />
          <PublicCourseCard
            icon_url="https://storage.googleapis.com/breathecode/logos-workshops/javascript-event-type.svg"
            iconBackground="#25BF6C"
            programName="Curso Interactivo de Javascript"
            programDescription={dummyText}
          /> */}
        </Box>
      </Box>
    </>
  );
};

MktRecommendedCourses.propTypes = {
  id: PropTypes.string,
  background: PropTypes.string,
  title: PropTypes.string,
  endpoint: PropTypes.string,
};

MktRecommendedCourses.defaultProps = {
  id: null,
  background: null,
  title: null,
  endpoint: '/v1/marketing/course',
};

export default MktRecommendedCourses;
