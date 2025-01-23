import PropTypes from 'prop-types';
import React from 'react';
import Faq from '../../src/common/components/Faq';
/**
 * @typedef {import("@prismicio/client").Content.FaqsSlice} FaqsSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<FaqsSlice>} FaqsProps
 * @param {FaqsProps}
 */
function Faqs({ slice }) {
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
      asElement={slice?.primary?.as_element}
      labelColor={slice?.primary?.label_color}
      labelWeight={slice?.primary?.label_weight}
      labelFontSize={slice?.primary?.label_font_size}
      labelLineHeight={slice?.primary?.label_line_height}
      answerColor={slice?.primary?.answer_color}
      answerWeight={slice?.primary?.answer_weight}
      answerFontSize={slice?.primary?.answer_font_size}
      answerlineHeight={slice?.primary?.answer_line_height}
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
