import React from 'react';
import PropTypes from 'prop-types';
import MktLearningPlatformSection from '../../src/components/PrismicComponents/MktLearningPlatformSection';
/**
 * @typedef {import("@prismicio/client").Content.LearningPlatformSectionSlice} LearningPlatformSectionSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<LearningPlatformSectionSlice>} LearningPlatformSectionProps
 * @param {LearningPlatformSectionProps}
 */
const LearningPlatformSection = ({ slice }) => (
  <MktLearningPlatformSection
    slice={slice}
  />
);

LearningPlatformSection.propTypes = {
  slice: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)),
};

LearningPlatformSection.defaultProps = {
  slice: {},
};

export default LearningPlatformSection;
