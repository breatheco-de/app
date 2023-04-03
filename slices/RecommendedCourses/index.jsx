/* eslint-disable react/prop-types */
import React from 'react';
import MktRecommendedCourses from '../../src/common/components/MktRecommendedCourses';

/**
 * @typedef {import("@prismicio/client").Content.RecommendedCoursesSlice} RecommendedCoursesSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<RecommendedCoursesSlice>} RecommendedCoursesProps
 * @param { RecommendedCoursesProps }
 */
const RecommendedCourses = ({ slice }) => (
  <MktRecommendedCourses id={slice.primary.componentId} endpoint={slice.primary.endpoint} endpoint={slice.primary.background} title={slice.primary.title} />
);

export default RecommendedCourses;
