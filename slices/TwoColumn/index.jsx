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
      descriptionTitle={slice?.primary?.description_title}
      descriptionFontSize={slice?.primary?.description_font_size}
      background={slice?.primary?.background_color}
      linkButton={slice?.primary?.link_button}
      buttonUrl={slice?.primary?.button_url?.url || slice.primary.button_url}
      buttonLabel={slice?.primary?.button_label}
      buttonLabelSize={slice?.primary?.button_label_size}
      imageUrl={slice?.primary?.image?.url}
      imageAlt={slice?.primary?.image?.alt}
      imagePosition={slice?.primary?.image_position}
      margin={slice?.primary?.margin || ''}
      maxwidth={slice?.primary?.max_width}
      gridGap={slice?.primary?.grid_gap || '24px'}
      informationSize={slice?.primary?.information_size}
      titleColor={slice.primary?.title_color}
      subtitleColor={slice?.primary?.subtitle_color}
      textBackgroundColor={slice?.primary?.text_background_color}
      buttonColor={slice?.primary?.button_color}
      fontFamily={slice?.primary?.fontFamily}
      fontFamilySubtitle={slice?.primary?.font_family_subtitle}
      customTitleSize={slice?.primary?.custom_title_size}
      customSubTitleSize={slice?.primary?.custom_subtitle_size}
      studentsAvatars={slice?.primary?.students_avatars}
      studentsAvatarsDescriptions={slice?.primary?.student_avatar_description}
      multiDescription={slice?.items}
      transparent={slice?.primary?.transparent}
      marginTop={slice?.primary?.margin_top}
      marginBottom={slice?.primary?.margin_bottom}
      borderRadius={slice?.primary.border_radius}
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
