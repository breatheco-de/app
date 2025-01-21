import PropTypes from 'prop-types';
import React from 'react';
import Faq from '../../src/common/components/Faq';
/**
 * @typedef {import("@prismicio/client").Content.FaqsSlice} FaqsSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<FaqsSlice>} FaqsProps
 * @param {FaqsProps}
 */
function Faqs({ slice }) {
  console.log("slice", slice)
  return (
    <Faq
      id={slice?.primary?.id_key}
      title={slice?.primary?.title}
      titleFontSize={slice?.primary?.title_font_size}
      titleLineHeight={slice?.primary?.title_line_height}
      titleFontWeight={slice?.primary?.title_font_weight}
      titleColor={slice?.primary?.title_color}
      faqBackgroundColor={slice?.primary?.background_color}
      faqMarginBottom={slice?.primary?.margin_bottom}
      maxWidth={slice?.primary?.max_width}
      marginTop={slice?.primary?.margin_top}
      items={slice?.items}
    />
  );
}

Faqs.propTypes = {
  slice: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

Faqs.defaultProps = {
  slice: {},
};

export default Faqs;
