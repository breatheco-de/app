/* eslint-disable react/prop-types */
import React from 'react';
import MktRecommendedCourses from '../../src/common/components/MktRecommendedCourses';

/**
 * @typedef {import("@prismicio/client").Content.RecommendedCoursesSlice} RecommendedCoursesSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<RecommendedCoursesSlice>} RecommendedCoursesProps
 * @param { RecommendedCoursesProps }
 */
const RecommendedCourses = ({ slice }) => (
  <MktRecommendedCourses
    id={slice?.primary?.componentId}
    background={slice?.primary?.background}
    technologies={slice.primary.technologies}
    title={slice?.primary?.title}
    margin={slice?.primary?.margin || '20px auto 0 auto'}
    mx={{ base: '10px', md: '2rem' }}
    gridColumn="2 / span 8"
  />
);

export default RecommendedCourses;
