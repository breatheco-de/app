import React from 'react';
import MktHeroSection from '../../src/components/PrismicComponents/MktHeroSection';

/**
 * @typedef {import("@prismicio/client").Content.HeroSectionSlice} HeroSectionSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<HeroSectionSlice>} HeroSectionProps
 * @param {HeroSectionProps}
 */
const HeroSection = ({ slice }) => {
  return (
    <MktHeroSection slice={slice} />
  );
};

export default HeroSection;
