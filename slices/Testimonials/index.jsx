import PropTypes from 'prop-types';
import React from 'react';
import MktTestimonials from '../../src/components/PrismicComponents/MktTestimonials';

/**
 * @typedef {import("@prismicio/client").Content.TestimonialsSlice} TestimonialsSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<TestimonialsSlice>} TestimonialsProps
 * @param { TestimonialsProps }
 */
function Testimonials({ slice }) {
  return (
    <MktTestimonials
      id={slice?.primary?.id_key}
      title={slice?.primary?.title}
      endpoint={slice?.primary?.endpoint}
      testimonials={slice?.items}
      margin={slice?.primary?.margin || '0 auto 20px auto'}
      px={{ base: '20px', md: '0px' }}
      version={slice?.primary?.version || 'v1'}
    />
  );
}
Testimonials.propTypes = {
  slice: PropTypes.shape({
    primary: PropTypes.shape({
      id_key: PropTypes.string,
      title: PropTypes.string,
      endpoint: PropTypes.string,
      margin: PropTypes.string,
      version: PropTypes.string,
    }),
    items: PropTypes.arrayOf(PropTypes.shape({
      first_name: PropTypes.string,
      second_name: PropTypes.string,
      avatar_url: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ url: PropTypes.string }),
      ]),
      total_rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      comments: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
        PropTypes.object,
      ]),
    })),
  }),
};

Testimonials.defaultProps = {
  slice: {},
};

export default Testimonials;
