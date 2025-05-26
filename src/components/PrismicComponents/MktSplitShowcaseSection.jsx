import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, Image, Grid } from '@chakra-ui/react';
import PrismicTextComponent from '../PrismicTextComponent';

function MktSplitShowcaseSection({ title, description, images }) {
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
        bgGradient="linear(135deg,  #0FB7FF, #022CC2 100%)"
        p={{ base: 4, md: 6 }}
        borderRadius="md"
        display="flex"
        flexDirection="column"
        justifyContent="start"
      >
        {title && (
          <PrismicTextComponent field={title} fontWeight="400" color="white" fontSize={{ base: '24px !important', md: '38px !important' }} />
        )}
        <br />
        {description && (
          <PrismicTextComponent field={description} fontWeight="400" color="white" fontSize={{ base: '24px !important', md: '38px !important' }} />
        )}
      </Box>

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

const prismicRichTextField = PropTypes.oneOfType([PropTypes.object, PropTypes.array]);

const prismicImageShape = PropTypes.shape({
  image: PropTypes.shape({
    url: PropTypes.string,
    alt: PropTypes.string,
  }),
});

MktSplitShowcaseSection.propTypes = {
  title: prismicRichTextField,
  description: prismicRichTextField,
  images: PropTypes.arrayOf(PropTypes.shape({
    images: PropTypes.oneOfType([
      PropTypes.arrayOf(prismicImageShape), // Prismic Format
      PropTypes.arrayOf(PropTypes.string),
    ]),
  })),
};

MktSplitShowcaseSection.defaultProps = {
  title: null,
  description: null,
  images: [],
};

export default MktSplitShowcaseSection;
