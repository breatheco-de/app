import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Flex,
  Heading as ChakraHeading,
  Image,
  useColorModeValue,
} from '@chakra-ui/react';
import CustomCarousel from '../CustomCarousel';
import PrismicTextComponent from '../PrismicTextComponent';
import Link from '../NextChakraLink';
import { parseProp } from '../../utils';
import useStyle from '../../hooks/useStyle';

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

function RenderAwardSlide({ item, backgroundColor, variant }) {
  if (!item?.image?.url) return null;
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" height="100%" width="100%">
      <Image
        src={item.image.url}
        backgroundColor={backgroundColor}
        borderRadius="10px"
        padding="10px"
        alt={item.image.alt || 'Award Image'}
        maxH={parseProp(item.image_max_height, '105px')}
        maxW={parseProp(item.image_max_width, '100%')}
        objectFit="contain"
      />
      {variant === 'withTextAndLink' && (
        <>
          {item.text && (
            <Box mt={2} textAlign="center" fontSize="sm">
              {item.text}
            </Box>
          )}
          {item.link && (
            <Box mt={1}>
              <Link
                href={item.link.url}
                color="blue.default"
                style={{ textDecoration: 'none' }}
              >
                {item.link_label || 'Ver más'}
              </Link>
            </Box>
          )}
        </>
      )}
    </Flex>
  );
}

function MktAwardsSection({ slice }) {
  const richTitle = slice?.primary?.title;
  const items = slice?.items || [];
  const awardBgColor = useColorModeValue('transparent', 'gray.700');
  const carouselVariant = slice?.primary?.mobile_carousel_variant || 'default';
  const sectionVariant = slice?.variation || 'default';
  const { fontColor3 } = useStyle();
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

      {/* Versión móvil (carousel) */}
      <Box display={{ base: 'block', md: 'none' }}>
        <CustomCarousel
          items={items}
          variation={carouselVariant}
          renderItem={(item, index) => (
            <RenderAwardSlide
              key={item?.image?.url || `award-${index}`}
              item={item}
              backgroundColor={awardBgColor}
              variant={sectionVariant}
            />
          )}
        />
      </Box>

      {/* Versión desktop */}
      <Flex
        display={{ base: 'none', md: 'flex' }}
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
              maxW="270px"
              height="100%"
              backgroundColor={awardBgColor}
              borderRadius="10px"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap="16px"
            >
              <Image
                src={item.image.url}
                alt={item.image.alt || 'Award Image'}
                objectFit="contain"
                maxH={parseProp(item.image_max_height, '100px')}
                maxW={parseProp(item.image_max_width, '100%')}
              />
              {sectionVariant === 'withTextAndLink' && (
                <>
                  {item.text && (
                    <Box
                      color={fontColor3}
                      textAlign="center"
                      fontFeatureSettings="liga off"
                      fontFamily="Lato"
                      fontSize="14px"
                      fontStyle="normal"
                      fontWeight="400"
                      lineHeight="normal"
                    >
                      {item.text}
                    </Box>
                  )}
                  {item?.link?.url && item?.link_label && (
                    <Box>
                      <Link
                        href={item?.link?.url}
                        color="blue.default"
                        fontSize="12px"
                        style={{ textDecoration: 'none' }}
                      >
                        {item.link_label}
                      </Link>
                    </Box>
                  )}
                </>
              )}
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}

RenderAwardSlide.propTypes = {
  item: PropTypes.shape({
    image: PropTypes.shape({
      url: PropTypes.string,
      alt: PropTypes.string,
    }),
    text: PropTypes.string,
    link: PropTypes.string,
    link_label: PropTypes.string,
    image_max_height: PropTypes.string,
    image_max_width: PropTypes.string,
  }),
  backgroundColor: PropTypes.string,
  variant: PropTypes.string,
};

RenderAwardSlide.defaultProps = {
  item: { image: { url: null, alt: null } },
  backgroundColor: 'transparent',
  variant: 'default',
};

MktAwardsSection.propTypes = {
  slice: PropTypes.shape({
    variation: PropTypes.string,
    primary: PropTypes.shape({
      title: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
      mobile_carousel_variant: PropTypes.string,
    }),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        image: PropTypes.shape({
          url: PropTypes.string,
          alt: PropTypes.string,
        }),
        text: PropTypes.string,
        link: PropTypes.string,
        link_label: PropTypes.string,
        image_max_height: PropTypes.string,
        image_max_width: PropTypes.string,
      }),
    ),
  }),
};

MktAwardsSection.defaultProps = {
  slice: null,
};

export default MktAwardsSection;
