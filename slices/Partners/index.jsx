import React from 'react';
import PropTypes from 'prop-types';
import MktPartners from '../../src/components/PrismicComponents/MktPartners';

/**
 * @typedef {import("@prismicio/client").Content.PartnersSlice} PartnersSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<PartnersSlice>} PartnersProps
 * @param { PartnersProps }
 */
const Partners = ({ slice }) => (
  <MktPartners
    id={slice?.primary?.id_key}
    title={slice?.primary?.title}
    images={slice?.primary?.images}
    margin={slice?.primary?.margin || '20px auto 0 auto'}
  />
);

Partners.propTypes = {
  slice: PropTypes.objectOf(PropTypes.any),
};

Partners.defaultProps = {
  slice: {},
};

export default Partners;
