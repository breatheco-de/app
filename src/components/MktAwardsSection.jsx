import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Flex,
  Heading as ChakraHeading,
  Image,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import CustomCarousel from './CustomCarousel';
import PrismicTextComponent from './PrismicTextComponent';

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

const prismicComponents = {
  heading2: RichTextHeading2,
  paragraph: RichTextParagraphAsHeading2,
};

function RenderAwardSlide({ item, backgroundColor }) {
  if (!item?.image?.url) return null;
  return (
    <Flex justifyContent="center" alignItems="center" height="100%" width="100%">
      <Image
        src={item.image.url}
        backgroundColor={backgroundColor}
        borderRadius="10px"
        padding="10px"
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
  backgroundColor: PropTypes.string,
};

RenderAwardSlide.defaultProps = {
  item: { image: { url: null, alt: null } },
  backgroundColor: 'transparent',
};

function MktAwardsSection({ slice }) {
  const richTitle = slice?.primary?.title;
  const items = slice?.items || [];
  const isMobile = useBreakpointValue({ base: true, md: false });

  const awardBgColor = useColorModeValue('transparent', 'gray.700');

  if (!items || items.length === 0) {
    return null;
  }

  useEffect(() => {
    if (items?.image?.url) {
      const img = new window.Image();
      img.src = items.image.url;
    }
  }, [items]);

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
          renderItem={(item, index) => (
            <RenderAwardSlide
              key={item?.image?.url || `award-${index}`}
              item={item}
              backgroundColor={awardBgColor}
            />
          )}
        />
      ) : (
        <Flex
          justifyContent="space-between"
          alignItems="center"
          flexWrap="nowrap"
          gap={{ base: 4, md: 8 }}
        >
          {items.map((item, index) => {
            if (!item?.image?.url) return null;
            return (
              <Box
                key={item?.image?.url || `award-desktop-${index}`}
                p={2}
                maxW="200px"
                backgroundColor={awardBgColor}
                borderRadius="10px"
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
