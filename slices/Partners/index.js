/* eslint-disable linebreak-style */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import MktPartners from '../../src/common/components/MktPartners';

/**
 * @typedef {import("@prismicio/client").Content.PartnersSlice} PartnersSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<PartnersSlice>} PartnersProps
 * @param { PartnersProps }
 */
const Partners = ({ slice }) => (
  <MktPartners
    imagesContent={slice?.primary?.images_content || 'default'}
    title={slice.primary.title}
    titleSize={slice?.primary?.title_size}
    images={slice.primary.images}
    description={slice?.primary?.description}
  />
);

export default Partners;
