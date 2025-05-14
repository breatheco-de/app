import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex } from '@chakra-ui/react';
import PrismicTextComponent from '../PrismicTextComponent';
import CustomCarousel from '../CustomCarousel';
import useStyle from '../../hooks/useStyle';
import Link from '../NextChakraLink';

function MktLearningPlatformSection({ slice }) {
  const { fontColor } = useStyle();
  const title = slice?.primary?.title;
  const description = slice?.primary?.description;
  const buttonLabel = slice?.primary?.button_label;
  const buttonUrl = slice?.primary?.button_url.url;
  const items = (slice?.items || []).filter((item) => item?.image?.url);

  console.log(buttonUrl);

  return (
    <Box width="100%" mb={{ base: '65px', md: '90px' }}>
      <Flex direction="column" maxW="1280px" mx="auto">
        {items.length > 0 && (
        <Box width="100%" mb={8}>
          <CustomCarousel
            items={items}
            variation="default"
            padding="20px"
            bg="#e8f1ff"
            borderRadius="2xl"
            renderItem={(item, idx) => (
              <Box
                key={item?.image?.url || `learning-slide-${idx}`}
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="100%"
              >
                <Box
                  as="img"
                  src={item?.image?.url}
                  alt={item?.image?.alt || `Slide ${idx + 1}`}
                  objectFit="cover"
                  borderRadius="12px"
                  border={`4px solid ${fontColor}`}
                  height={{ base: '204px', md: '402px', lg: '488px' }}
                  width={{ base: '334px', md: '671px', lg: '812px' }}
                  boxShadow="md"
                />
              </Box>
            )}
          />
        </Box>
        )}
        <Flex gap="24px" direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
          <Flex direction="column" gap="8px">
            {title && (
            <Box>
              <PrismicTextComponent textAlign={{ base: 'center', md: 'left' }} field={title} fontWeight="400" />
            </Box>
            )}
            {description && (
            <Box>
              <PrismicTextComponent textAlign={{ base: 'center', md: 'left' }} field={description} fontWeight="400" />
            </Box>
            )}
          </Flex>
          {buttonLabel && buttonUrl && (
            <Link
              href={buttonUrl}
              backgroundColor="blue.default"
              color="white"
              borderRadius="4px"
              padding="7px 16px"
              fontSize="17px"
              fontWeight="700"
              alignSelf={{ base: 'center', md: 'flex-end' }}
              target="_blank"
              rel="noopener noreferrer"
              _hover="none"
            >
              {buttonLabel}
            </Link>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

MktLearningPlatformSection.propTypes = {
  slice: PropTypes.shape({
    primary: PropTypes.shape({
      title: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)), // Prismic RichText field
      description: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)), // Prismic RichText field
      button_label: PropTypes.string,
      button_url: PropTypes.shape({ url: PropTypes.string }),
    }),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        image: PropTypes.shape({
          url: PropTypes.string.isRequired,
          alt: PropTypes.string,
        }).isRequired,
      }),
    ),
  }).isRequired,
};

export default MktLearningPlatformSection;
