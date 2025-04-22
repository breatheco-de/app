import React from 'react';
import PropTypes from 'prop-types';
import MktShowPrices from '../../src/components/MktShowPrices';

/**
 * @typedef {import("@prismicio/client").Content.ShowPricesSlice} ShowPricesSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ShowPricesSlice>} ShowPricesProps
 * @param { ShowPricesProps }
 */
const ShowPrices = ({ slice }) => (
  <MktShowPrices
    id={slice?.primary?.id_key}
    title={slice.primary.title}
    description={slice.primary.description}
    plan={slice?.primary?.plan || 'coding-introduction-free-trial'}
    bullets={slice.primary.bullets}
    margin={slice?.primary?.margin || '0 auto 0 auto'}
  />
);
ShowPrices.propTypes = {
  slice: PropTypes.objectOf(PropTypes.any),
};

ShowPrices.defaultProps = {
  slice: {},
};

export default ShowPrices;
