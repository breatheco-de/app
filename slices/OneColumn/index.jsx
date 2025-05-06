/* eslint-disable react/prop-types */
import React from 'react';
// import { SliderFilledTrack } from '@chakra-ui/react';
import MktOneColumnSection from '../../src/components/MktOneColumnSection';

/**
 * @typedef {import("@prismicio/client").Content.OneColumnSlice} OneColumnSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<OneColumnSlice>} OneColumnProps
 * @param { OneColumnProps }
 */
function OneColumn({ slice }) {
  return (
    <MktOneColumnSection
      id={slice?.primary?.id_key}
      slice={slice}
      justifyItems={slice?.primary?.justify_items}
      padding={slice?.primary?.padding}
      fontFamily={slice?.primary?.font_family}
    />
  );
}

export default OneColumn;
