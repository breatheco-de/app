import React from 'react';
import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';

function PageBubble({
  url,
  children,
  ...rest
}) {
  if (!url) {
    return null;
  }

  return (
    <Box
      as="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      position="fixed"
      right="12px"
      zIndex={2000}
      {...rest}
    >
      {children}
    </Box>
  );
}

PageBubble.propTypes = {
  url: PropTypes.string.isRequired,
  isCtaVisible: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default PageBubble;
