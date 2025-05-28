import React from 'react';
import PropTypes from 'prop-types';
import MktMultipleColumnCard from '../../src/components/PrismicComponents/MktMultipleColumnCard';
/**
 * @typedef {import("@prismicio/client").Content.MultipleColumnCardSlice} MultipleColumnCardSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<MultipleColumnCardSlice>} MultipleColumnCardProps
 * @param {MultipleColumnCardProps}
 */
function MultipleColumnCard({ slice }) {
  return (
    <MktMultipleColumnCard
      id={slice?.primary?.id_key}
      slice={slice}
      marginTop={slice?.primary?.margin_top}
      marginBottom={slice?.primary?.margin_bottom}
    />
  );
}

MultipleColumnCard.propTypes = {
  slice: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

MultipleColumnCard.defaultProps = {
  slice: {},
};

export default MultipleColumnCard;
