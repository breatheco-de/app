import React from 'react';
import PropTypes from 'prop-types';
import MktRoadmap from '../../src/common/components/MktRoadmap';

/**
 * @typedef {import("@prismicio/client").Content.ShowPricesSlice} ShowPricesSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ShowPricesSlice>} ShowPricesProps
 * @param { ShowPricesProps }
 */
const ShowPrices = ({ slice }) => (
  <MktRoadmap
    course={slice?.primary?.course_slug || ''}
  />
);
ShowPrices.propTypes = {
  slice: PropTypes.objectOf(PropTypes.any),
};

ShowPrices.defaultProps = {
  slice: {},
};

export default ShowPrices;
