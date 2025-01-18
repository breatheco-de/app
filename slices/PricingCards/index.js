import React from 'react';
import PropTypes from 'prop-types';
import MktPricingCards from '../../src/common/components/MktPricingCards';

/**
 * @typedef {import("@prismicio/client").Content.PricingCardsSlice} PricingCardsSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<PricingCardsSlice>} PricingCardsProps
 * @param {PricingCardsProps}
 */
function PricingCards({ slice }) {
  return (
    <MktPricingCards
      id={slice?.primary?.id_key}
      title={slice?.primary?.title}
      url={slice?.primary?.url}
    />
  );
}

PricingCards.propTypes = {
  slice: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

PricingCards.defaultProps = {
  slice: {},
};

export default PricingCards;
