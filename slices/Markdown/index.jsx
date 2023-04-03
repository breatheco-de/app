/* eslint-disable react/prop-types */
import React from 'react';
import * as prismicH from '@prismicio/helpers';
import PropTypes from 'prop-types';
import { Box, useColorModeValue } from '@chakra-ui/react';
import MarkDownParser from '../../src/common/components/MarkDownParser';
import Heading from '../../src/common/components/Heading';
import Text from '../../src/common/components/Text';

const Markdown = ({ slice }) => {
  const rawText = prismicH.asText(slice.primary.markdown);

  return (
    <Box
      id={slice?.primary?.id_key}
      display="grid"
      flexDirection="column"
      alignItems="center"
      gridTemplateColumns={{
        base: '.5fr repeat(12, 1fr) .5fr',
        md: '1.5fr repeat(12, 1fr) 1.5fr',
      }}
      flex="1"
      margin="2rem auto 0 auto"
      maxWidth="1280px"
    >
      <Box
        display="grid"
        gridColumn="2 / span 12"
        padding={{ base: '28px 0', md: '28px 32px' }}
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
        <MarkDownParser content={rawText} isPublic withToc={slice?.primary?.enable_table_of_content} />
      </Box>
    </Box>
  );
};
Markdown.propTypes = {
  slice: PropTypes.objectOf(PropTypes.any),
};

Markdown.defaultProps = {
  slice: {},
};

export default Markdown;
