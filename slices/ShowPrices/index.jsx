import React from 'react';
import PropTypes from 'prop-types';
import MktShowPrices from '../../src/common/components/MktShowPrices';

/**
 * @typedef {import("@prismicio/client").Content.ShowPricesSlice} ShowPricesSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ShowPricesSlice>} ShowPricesProps
 * @param { ShowPricesProps }
 */
const ShowPrices = ({ slice }) => (
  <MktShowPrices
    title={slice.primary.title}
    description={slice.primary.description}
    plan={'coding-introduction-free-trial' || slice.primary.plan}
    bullets={slice.primary.bullets}
  />
);
ShowPrices.propTypes = {
  slice: PropTypes.objectOf(PropTypes.any),
};

ShowPrices.defaultProps = {
  slice: {},
};

export default ShowPrices;
