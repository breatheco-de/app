import React from 'react';
import PropTypes from 'prop-types';
import MktPageBubble from '../../src/components/MktPageBubble';

/**
 * @typedef {import("@prismicio/client").Content.PageBubbleSlice} PageBubbleSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<PageBubbleSlice>} PageBubbleProps
 * @param {PageBubbleProps}
 */
function PageBubble({ slice }) {
  const supportAvatars = slice.items
    .map((item) => item.support_avatar?.url)
    .filter(Boolean);

  return (
    <MktPageBubble
      url={slice.primary.url}
      supportAvatars={supportAvatars}
      topText={slice.primary.top_text}
      bottomText={slice.primary.bottom_text}
      iconString={slice.primary.icon_string}
      slice={slice}
    />
  );
}

PageBubble.propTypes = {
  slice: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

PageBubble.defaultProps = {
  slice: {},
};

export default PageBubble;
