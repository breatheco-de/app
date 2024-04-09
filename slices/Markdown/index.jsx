/* eslint-disable react/prop-types */
import React from 'react';
import * as prismicH from '@prismicio/helpers';
import PropTypes from 'prop-types';
import { Box, useColorModeValue } from '@chakra-ui/react';
import MarkDownParser from '../../src/common/components/MarkDownParser';
import Heading from '../../src/common/components/Heading';
import Text from '../../src/common/components/Text';

function Markdown({ slice }) {
  const rawText = prismicH.asText(slice.primary.markdown);
  const padding = slice?.primary?.padding?.length > 0 && slice?.primary?.padding;

  return (
    <Box
      id={slice?.primary?.id_key}
      display="grid"
      flexDirection="column"
      alignItems="center"
      gridTemplateColumns="repeat(12, 1fr)"
      flex="1"
      maxWidth="1280px"
      margin={slice?.primary?.margin || '2rem auto 0 auto'}
    >
      <Box
        display="grid"
        gridColumn="1 / span 12"
        padding={padding || { base: '28px 10px', md: '28px 0px' }}
        borderRadius="3px"
        // background={useColorModeValue('#F2F6FA', 'featuredDark')}
        width="100%"
        className={`markdown-body ${useColorModeValue('light', 'dark')}`}
        transition="background .2s ease"
      >
        {slice?.primary?.title && (
          <Heading as="h1" size="xl">
            {slice?.primary?.title}
          </Heading>
        )}
        {slice.primary.description && (
          <Text size="l">
            {slice.primary.description}
          </Text>
        )}
        {rawText?.length > 0 && (
          <MarkDownParser content={rawText} isPublic withToc={slice?.primary?.enable_table_of_content} />
        )}
      </Box>
    </Box>
  );
}
Markdown.propTypes = {
  slice: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

Markdown.defaultProps = {
  slice: {},
};

export default Markdown;
