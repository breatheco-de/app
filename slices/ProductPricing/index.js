/* eslint-disable linebreak-style */
import React from 'react';
import PropTypes from 'prop-types';
import MktProductPricing from '../../src/components/MktProductPricing';
/**
 * @typedef {import("@prismicio/client").Content.ProductPricingSlice} ProductPricingSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ProductPricingSlice>} ProductPricingProps
 * @param {ProductPricingProps}
 */

const ProductPricing = ({ slice }) => {
  const planSlug = slice?.primary?.plan_slug || '';
  const imageUrl = slice?.primary?.image?.url || null;
  return (
      <MktProductPricing planSlug={planSlug} mainImage={imageUrl} />
  );
};

ProductPricing.propTypes = {
  slice: PropTypes.shape({
    slice_type: PropTypes.string,
    variation: PropTypes.string,
    primary: PropTypes.shape({
      plan_slug: PropTypes.string,
      planSlug: PropTypes.string,
      slug: PropTypes.string,
      main_image: PropTypes.shape({ url: PropTypes.string }),
      image: PropTypes.shape({ url: PropTypes.string }),
      hero_image: PropTypes.shape({ url: PropTypes.string }),
    }),
  }).isRequired,
};

export default ProductPricing;
