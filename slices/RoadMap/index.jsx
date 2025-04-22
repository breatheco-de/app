import React from 'react';
import PropTypes from 'prop-types';
import MktRoadmap from '../../src/components/MktRoadmap';

/**
 * @typedef {import("@prismicio/client").Content.ShowPricesSlice} ShowPricesSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ShowPricesSlice>} ShowPricesProps
 * @param { ShowPricesProps }
 */
function ShowPrices({ slice }) {
  return (
    <MktRoadmap
      id={slice?.primary?.id_key}
      course={slice?.primary?.course_slug || ''}
      title={slice?.primary?.title}
      margin={slice?.primary?.margin || '3rem auto 3rem auto'}
    />
  );
}
ShowPrices.propTypes = {
  slice: PropTypes.objectOf(PropTypes.oneOfType(PropTypes.any)),
};

ShowPrices.defaultProps = {
  slice: {},
};

export default ShowPrices;
