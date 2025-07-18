import React from 'react';
import { Box, useBreakpointValue } from '@chakra-ui/react';
import PropTypes from 'prop-types';

function PageBubble({
  url,
  isCtaVisible,
  content,
  ...rest
}) {
  if (!url) {
    return null;
  }

  const showFullBubble = useBreakpointValue({ base: false, md: true });

  return (
    <Box
      as="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      position="fixed"
      bottom={isCtaVisible ? '72px' : '10px'}
      right="12px"
      zIndex={2000}
      {...rest}
    >
      {!showFullBubble ? content.base : content.md}
    </Box>
  );
}

PageBubble.propTypes = {
  url: PropTypes.string.isRequired,
  content: PropTypes.shape({
    base: PropTypes.node,
    md: PropTypes.node,
  }).isRequired,
  isCtaVisible: PropTypes.bool.isRequired,
};

export default PageBubble;
