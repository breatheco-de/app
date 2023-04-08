import React from 'react';
import PropTypes from 'prop-types';
import MktTwoColumnSideImage from '../../src/common/components/MktTwoColumnSideImage';

/**
 * @typedef {import("@prismicio/client").Content.TwoColumnSlice} TwoColumnSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<TwoColumnSlice>} TwoColumnProps
 * @param { TwoColumnProps }
 */
const TwoColumn = ({ slice }) => (
  <MktTwoColumnSideImage
    id={slice?.primary?.id_key}
    title={slice?.primary?.title}
    subTitle={slice?.primary?.subtitle}
    slice={slice}
    background={slice?.primary?.background_color}
    linkButton={slice?.primary?.link_button}
    buttonUrl={slice?.primary?.button_url.url}
    buttonLabel={slice?.primary?.button_label}
    imageUrl={slice?.primary?.image?.url}
    imageAlt={slice?.primary?.image?.alt}
    imagePosition={slice?.primary?.image_position}
    margin={slice?.primary?.margin || ''}
    gridGap={slice?.primary?.grid_gap}
  />
);

TwoColumn.propTypes = {
  slice: PropTypes.objectOf(PropTypes.any),
};

TwoColumn.defaultProps = {
  slice: {},
};

export default TwoColumn;
