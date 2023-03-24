/* eslint-disable react/prop-types */
import React from 'react';
import MktTwoColumnSideImage from '../../src/common/components/MktTwoColumnSideImage';

/**
 * @typedef {import("@prismicio/client").Content.TwoColumnSlice} TwoColumnSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<TwoColumnSlice>} TwoColumnProps
 * @param { TwoColumnProps }
 */
const TwoColumn = ({ slice }) => (
  <MktTwoColumnSideImage
    title={slice.primary.title}
    subTitle={slice.primary.subtitle}
    slice={slice}
    background={slice.primary.background_color}
    buttonUrl={slice.primary.button_url.url}
    buttonLabel={slice.primary.button_label}
    imageUrl={slice.primary?.image?.url}
    imageAlt={slice.primary?.image?.alt}
    imagePosition={slice.primary.image_position}
  />
);

export default TwoColumn;
