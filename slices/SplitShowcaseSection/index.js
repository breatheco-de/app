import React from 'react';
import PropTypes from 'prop-types';
import MktSplitShowcaseSection from '../../src/components/PrismicComponents/MktSplitShowcaseSection';

/**
 * @typedef {import("@prismicio/client").Content.SplitShowcaseSectionSlice} SplitShowcaseSectionSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<SplitShowcaseSectionSlice>} SplitShowcaseSectionProps
 * @param {SplitShowcaseSectionProps}
 */
const SplitShowcaseSection = ({ slice }) => {
  return (
    <MktSplitShowcaseSection
      title={slice.primary.title}
      description={slice.primary.description}
      images={slice.items}
    />
  );
};

export default SplitShowcaseSection;

SplitShowcaseSection.propTypes = {
  slice: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

SplitShowcaseSection.defaultProps = {
  slice: {},
};