import PropTypes from 'prop-types';
import React from 'react';
import MktTestimonials from '../../src/components/PrismicComponents/MktTestimonials';

/**
 * @typedef {import("@prismicio/client").Content.TestimonialsSlice} TestimonialsSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<TestimonialsSlice>} TestimonialsProps
 * @param { TestimonialsProps }
 */
const Testimonials = ({ slice }) => (
  <MktTestimonials
    id={slice?.primary?.id_key}
    title={slice?.primary?.title}
    endpoint={slice?.primary?.endpoint}
    margin={slice?.primary?.margin || '0 auto 20px auto'}
    px={{ base: '20px', md: '0px' }}
    version={slice?.primary?.version || 'v1'}
  />
);
Testimonials.propTypes = {
  slice: PropTypes.objectOf(PropTypes.any),
};

Testimonials.defaultProps = {
  slice: {},
};

export default Testimonials;
