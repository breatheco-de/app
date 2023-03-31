import React from 'react';
import PropTypes from 'prop-types';
import MktRoadmap from '../../src/common/components/MktRoadmap';

/**
 * @typedef {import("@prismicio/client").Content.ShowPricesSlice} ShowPricesSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ShowPricesSlice>} ShowPricesProps
 * @param { ShowPricesProps }
 */
const ShowPrices = ({ slice }) => {
  console.log(slice);

  return (
    <MktRoadmap
      course={slice?.primary?.course_slug || ''}
      buttonTitle={slice.primary.more_content_title || ''}
      buttonLink={slice?.primary?.more_content_link?.url || ''}
      moreContent={slice?.primary?.more_content_button || false}
    />
  );
};
ShowPrices.propTypes = {
  slice: PropTypes.objectOf(PropTypes.any),
};

ShowPrices.defaultProps = {
  slice: {},
};

export default ShowPrices;
