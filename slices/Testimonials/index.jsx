/* eslint-disable react/prop-types */
import React from 'react';
import MktTestimonials from '../../src/common/components/MktTestimonials';

/**
 * @typedef {import("@prismicio/client").Content.TestimonialsSlice} TestimonialsSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<TestimonialsSlice>} TestimonialsProps
 * @param { TestimonialsProps }
 */
const Testimonials = ({ slice }) => (
  <MktTestimonials
    title={slice?.primary?.title}
    endpoint={slice?.primary?.endpoint || '/v1/feedback/review'}
    slice={slice}
  />
);

export default Testimonials;
