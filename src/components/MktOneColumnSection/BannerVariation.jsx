import React from 'react';
import PropTypes from 'prop-types';
import { Box, VStack, Text } from '@chakra-ui/react';
import PrismicTextComponent from '../PrismicTextComponent';
import Link from '../NextChakraLink';

function BannerVariation({
  description,
  buttonLabel,
  buttonUrl,
  fontColor,
  descriptionFontSize,
  descriptionTextAlign,
  buttonBackgroundColor,
  buttonFontColor,
  buttonFontSize,
}) {
  const resolveLink = (link) => {
    if (!link) return '#';
    if (typeof link === 'string') return link;
    if (link.link_type === 'Web') {
      return link.url;
    }
    if (link.link_type === 'Document') {
      return `/${link.uid || ''}`; // Placeholder
    }
    return '#';
  };

  const commonTextProps = {
    color: fontColor || 'inherit',
    fontSize: descriptionFontSize || 'md',
    textAlign: descriptionTextAlign || 'center',
  };

  return (
    <VStack spacing={4} align="stretch" width="100%">
      {description && (
        <Box>
          {Array.isArray(description) ? (
            <PrismicTextComponent
              field={description}
              {...commonTextProps}
            />
          ) : (
            <Text {...commonTextProps}>
              {description}
            </Text>
          )}
        </Box>
      )}

      {buttonLabel && buttonUrl && (
        <Box
          textAlign={descriptionTextAlign || 'center'}
          mt="4"
        >
          <Link
            href={resolveLink(buttonUrl)}
            variant="buttonDefault"
            isExternal={typeof buttonUrl === 'object' && buttonUrl?.link_type === 'Web' && buttonUrl?.target === '_blank'}
            display="inline-block"
            margin="2rem 0 0 0"
            backgroundColor={buttonBackgroundColor || undefined}
            color={buttonFontColor || undefined}
            fontSize={buttonFontSize || undefined}
          >
            {buttonLabel}
          </Link>
        </Box>
      )}
    </VStack>
  );
}

BannerVariation.propTypes = {
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  buttonLabel: PropTypes.string,
  buttonUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  fontColor: PropTypes.string,
  descriptionFontSize: PropTypes.string,
  descriptionTextAlign: PropTypes.string,
  buttonBackgroundColor: PropTypes.string,
  buttonFontColor: PropTypes.string,
  buttonFontSize: PropTypes.string,
};

BannerVariation.defaultProps = {
  description: null,
  buttonLabel: null,
  buttonUrl: null,
  fontColor: null,
  descriptionFontSize: 'md',
  descriptionTextAlign: 'center',
  buttonBackgroundColor: null,
  buttonFontColor: null,
  buttonFontSize: null,
};

export default BannerVariation;
