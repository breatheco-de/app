import React from 'react';
import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';

function PageBubble({ url, children, ...rest }) {
  if (!url) return null;
  return (
    <Box
      as="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      position="fixed"
      bottom="32px"
      right="32px"
      borderRadius="full"
      width="60px"
      height="60px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      {...rest}
    >
      {children}
    </Box>
  );
}

PageBubble.propTypes = {
  url: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default PageBubble;
