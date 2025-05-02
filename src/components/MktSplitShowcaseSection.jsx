import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, Image, Grid } from '@chakra-ui/react';
import PrismicTextComponent from './PrismicTextComponent';

// Renamed component to start with Mkt
function MktSplitShowcaseSection({ slice }) {
  // Extract data
  const title = slice?.primary?.title;
  const description = slice?.primary?.description;
  const images = slice?.items || [];
  const textBackgroundColor = slice?.primary?.text_background_color || 'linear(to-b, blue.400, blue.600)';
  const textColor = slice?.primary?.text_color || 'white';

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      gap={{ base: 4, md: 4 }}
      maxWidth="1280px"
      alignItems="stretch"
      margin="0 auto"
      maxHeight={{ md: '500px' }}
    >
      <Box
        order={{ base: 1, md: 2 }}
        flex={{ md: '0.4' }}
        bgGradient={textBackgroundColor}
        color={textColor}
        p={{ base: 4, md: 6 }}
        borderRadius="md"
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        {title && (
        <PrismicTextComponent
          field={title}
          heading1Props={{
            fontSize: { base: '2xl', md: '3xl', lg: '4xl' },
            mb: 4,
          }}
        />
        )}
        {description && (
        <PrismicTextComponent
          field={description}
          paragraphProps={{
            fontSize: { base: 'md', lg: 'lg' },
          }}
        />
        )}
      </Box>

      {/* --- Image Section (Using Grid) --- */}
      <Grid
        order={{ base: 2, md: 1 }}
        flex={{ md: '0.6' }}
        gridAutoFlow="column"
        gridAutoColumns="minmax(0, 1fr)"
        gap={{ base: 1, md: 4 }}
        width="100%"
        alignItems="stretch"
        minW="0"
      >
        {images.map((item) => (
          item.image?.url && (
            <Image
              key={item.image.url}
              src={item.image.url}
              alt={item.image.alt || ''}
              w="100%"
              h="100%"
              maxHeight="500px"
              objectFit="cover"
              borderRadius="md"
            />
          )
        ))}
      </Grid>
    </Flex>
  );
}

// Prismic Rich Text fields can be arrays of objects
const prismicRichTextField = PropTypes.oneOfType([PropTypes.object, PropTypes.array]);

// Updated PropTypes reference
MktSplitShowcaseSection.propTypes = {
  slice: PropTypes.shape({
    primary: PropTypes.shape({
      title: prismicRichTextField,
      description: prismicRichTextField,
      text_background_color: PropTypes.string,
      text_color: PropTypes.string,
    }),
    items: PropTypes.arrayOf(PropTypes.shape({
      image: PropTypes.shape({
        url: PropTypes.string,
        alt: PropTypes.string,
      }),
    })),
  }),
};

// Updated defaultProps reference
MktSplitShowcaseSection.defaultProps = {
  slice: {
    primary: {
      title: null,
      description: null,
      text_background_color: 'linear(to-b, blue.400, blue.600)',
      text_color: 'white',
    },
    items: [],
  },
};

// Updated export
export default MktSplitShowcaseSection;
