import React from 'react';
import PropTypes from 'prop-types';
import MktPartners from '../../src/common/components/MktPartners';

/**
 * @typedef {import("@prismicio/client").Content.PartnersSlice} PartnersSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<PartnersSlice>} PartnersProps
 * @param { PartnersProps }
 */
const Partners = ({ slice }) => (
  <MktPartners
    id={slice?.primary?.id_key}
    title={slice.primary.title}
    images={slice.primary.images}
  />
);

Partners.propTypes = {
  slice: PropTypes.objectOf(PropTypes.any),
};

Partners.defaultProps = {
  slice: {},
};

export default Partners;
