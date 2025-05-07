import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Flex,
  Heading as ChakraHeading,
  Image,
  // SimpleGrid, // Removed if not using the SimpleGrid example for now
  useBreakpointValue,
} from '@chakra-ui/react';
import CustomCarousel from './CustomCarousel';
import PrismicTextComponent from './PrismicTextComponent';

// Component renderers for PrismicRichText, changed to function declarations
function RichTextHeading2({ children }) {
  return (
    <ChakraHeading as="h2" size="xl">
      {children}
    </ChakraHeading>
  );
}
RichTextHeading2.propTypes = { children: PropTypes.node };
RichTextHeading2.defaultProps = { children: null };

function RichTextParagraphAsHeading2({ children }) {
  return (
    <ChakraHeading as="h2" size="xl">
      {children}
    </ChakraHeading>
  );
}
RichTextParagraphAsHeading2.propTypes = { children: PropTypes.node };
RichTextParagraphAsHeading2.defaultProps = { children: null };

// Reusable PrismicRichText components map
const prismicComponents = {
  heading2: RichTextHeading2,
  paragraph: RichTextParagraphAsHeading2,
  // Add other custom renderers here if needed
};

function RenderAwardSlide({ item }) {
  useEffect(() => {
    if (item?.image?.url) {
      const img = new window.Image();
      img.src = item.image.url;
    }
  }, []); // Pre-load on mount

  if (!item?.image?.url) return null;
  return (
    <Flex justifyContent="center" alignItems="center" height="100%" width="100%">
      <Image
        src={item.image.url}
        alt={item.image.alt || 'Award Image'}
        maxH="150px"
        objectFit="contain"
      />
    </Flex>
  );
}

RenderAwardSlide.propTypes = {
  item: PropTypes.shape({
    image: PropTypes.shape({
      url: PropTypes.string,
      alt: PropTypes.string,
    }),
  }),
};

RenderAwardSlide.defaultProps = {
  item: { image: { url: null, alt: null } },
};

function MktAwardsSection({ slice }) {
  const richTitle = slice?.primary?.title;
  const items = slice?.items || [];
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Box maxWidth="1280px" mx="auto" margin={{ base: '0px auto 56px', md: '0px auto 90px' }}>
      <Box textAlign="center" mb={{ base: 6, md: 10 }}>
        {(richTitle && richTitle.length > 0 && richTitle.some((block) => block.text && block.text.trim() !== '')) && (
          <PrismicTextComponent
            field={richTitle}
            fontWeight="400"
            components={prismicComponents}
          />
        )}
      </Box>

      {isMobile ? (
        <CustomCarousel
          items={items}
          renderItem={(item, index) => <RenderAwardSlide key={item?.image?.url || `award-${index}`} item={item} />}
        />
      ) : (
        <Flex
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={{ base: 4, md: 8 }}
        >
          {items.map((item, index) => {
            if (!item?.image?.url) return null;
            return (
              <Box
                key={item?.image?.url || `award-desktop-${index}`}
                p={2}
                maxW="200px"
              >
                <Image
                  src={item.image.url}
                  alt={item.image.alt || 'Award Image'}
                  objectFit="contain"
                  maxH="100px"
                />
              </Box>
            );
          })}
        </Flex>
        // If you want to use SimpleGrid, uncomment its import and this block:
        /*
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: items.length > 5 ? 5 : items.length }} spacing={{ base: 4, md: 8 }} placeItems="center">
          {items.map((item, index) => {
            if (!item?.image?.url) return null;
            return (
              <Image
                key={item?.image?.url || `award-desktop-${index}`}
                src={item.image.url}
                alt={item.image.alt || 'Award Image'}
                objectFit="contain"
                maxH="80px"
                w="auto"
              />
            );
          })}
        </SimpleGrid>
        */
      )}
    </Box>
  );
}

MktAwardsSection.propTypes = {
  slice: PropTypes.shape({
    primary: PropTypes.shape({
      title: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
    }),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        image: PropTypes.shape({
          url: PropTypes.string,
          alt: PropTypes.string,
        }),
      }),
    ),
  }),
};

MktAwardsSection.defaultProps = {
  slice: null,
};

export default MktAwardsSection;
