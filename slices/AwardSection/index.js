import MktAwardsSection from '../../src/components/MktAwardsSection';

/**
 * @typedef {import("@prismicio/client").Content.AwardSectionSlice} AwardSectionSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<AwardSectionSlice>} AwardSectionProps
 * @param {AwardSectionProps}
 */
const AwardSection = ({ slice }) => {
  return (
    <MktAwardsSection
      slice={slice}
    />
  );
};

export default AwardSection;
