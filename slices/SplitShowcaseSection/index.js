import React from 'react';
import PropTypes from 'prop-types';
import MktSplitShowcaseSection from '../../src/components/MktSplitShowcaseSection';

/**
 * @typedef {import("@prismicio/client").Content.SplitShowcaseSectionSlice} SplitShowcaseSectionSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<SplitShowcaseSectionSlice>} SplitShowcaseSectionProps
 * @param {SplitShowcaseSectionProps}
 */
const SplitShowcaseSection = ({ slice }) => {
  return (
    <MktSplitShowcaseSection slice={slice} />
  );
};

export default SplitShowcaseSection;

SplitShowcaseSection.propTypes = {
  slice: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

SplitShowcaseSection.defaultProps = {
  slice: {},
};