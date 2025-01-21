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
