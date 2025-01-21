import React from 'react';
import PropTypes from 'prop-types';
import MktMultipleColumnCard from '../../src/common/components/MktMultipleColumnCard';
/**
 * @typedef {import("@prismicio/client").Content.MultipleColumnCardSlice} MultipleColumnCardSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<MultipleColumnCardSlice>} MultipleColumnCardProps
 * @param {MultipleColumnCardProps}
 */
function MultipleColumnCard({ slice }) {
  return (
    <MktMultipleColumnCard
      id={slice?.primary?.id_key}
      title={slice?.primary?.title}
      marginBottom={slice?.primary?.margin_bottom}
      marginTop={slice?.primary?.margin_top}
      maxWidth={slice?.primary?.max_width}
      columns={slice.items}
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
