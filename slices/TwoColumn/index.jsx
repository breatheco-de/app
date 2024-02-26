import React from 'react';
import PropTypes from 'prop-types';
import MktTwoColumnSideImage from '../../src/common/components/MktTwoColumnSideImage';

/**
 * @typedef {import("@prismicio/client").Content.TwoColumnSlice} TwoColumnSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<TwoColumnSlice>} TwoColumnProps
 * @param { TwoColumnProps }
 */
function TwoColumn({ slice }) {
  return (
    <MktTwoColumnSideImage
      id={slice?.primary?.id_key}
      title={slice?.primary?.title}
      subTitle={slice?.primary?.subtitle}
      slice={slice}
      background={slice?.primary?.background_color}
      linkButton={slice?.primary?.link_button}
      buttonUrl={slice?.primary?.button_url?.url || slice.primary.button_url}
      buttonLabel={slice?.primary?.button_label}
      imageUrl={slice?.primary?.image?.url}
      imageAlt={slice?.primary?.image?.alt}
      imagePosition={slice?.primary?.image_position}
      margin={slice?.primary?.margin || ''}
      gridGap={slice?.primary?.grid_gap || '24px'}
      informationSize={slice?.primary?.information_size}
      titleColor={slice.primary?.title_color}
      subtitleColor={slice?.primary?.subtitle_color}
      textBackgroundColor={slice?.primary?.text_background_color}
      buttonColor={slice?.primary?.button_color}
      fontFamily={slice?.primary?.fontFamily}
    />
  );
}

TwoColumn.propTypes = {
  slice: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

TwoColumn.defaultProps = {
  slice: {},
};

export default TwoColumn;
