import React from 'react';
import PropTypes from 'prop-types';
import { Box, VStack, Text, Image } from '@chakra-ui/react';
import PrismicTextComponent from '../PrismicTextComponent';
import Link from '../NextChakraLink';
import Heading from '../Heading';
import { parseProp } from '../../utils';

function ImageOnTopVariation({
  image,
  title,
  subtitle,
  description,
  buttonLabel,
  buttonUrl,
  fontFamily,
  fontColor,
  titleFontSize: titleFontSizeProp,
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
      return `/${link.uid || ''}`;
    }
    return '#';
  };

  const commonTextProps = {
    color: fontColor || 'inherit',
    fontSize: descriptionFontSize || 'md',
    textAlign: descriptionTextAlign || 'left',
    fontFamily: fontFamily || 'Lato',
  };

  const finalTitleSize = parseProp(titleFontSizeProp, '2xl');

  const renderSectionTitle = (content, size, as = 'h2') => {
    if (!content) return null;

    if (Array.isArray(content)) {
      return (
        <PrismicTextComponent
          field={content}
          fontWeight="500"
        />
      );
    }
    return (
      <Heading
        as={as}
        fontSize={size}
        fontWeight="bold"
        color={fontColor || null}
        fontFamily={fontFamily || 'Lato'}
        marginBottom="2"
        textAlign={descriptionTextAlign || 'left'}
      >
        {content}
      </Heading>
    );
  };

  return (
    <VStack spacing={4} align="stretch" width="100%">
      {image && image.url && (
        <Box mb={4} borderRadius="md" overflow="hidden">
          <Image
            src={image.url}
            alt={image.alt || title || 'Section image'}
            objectFit="cover"
            width="100%"
            height={{ base: '271px', md: '365px' }}
          />
        </Box>
      )}

      {renderSectionTitle(title, finalTitleSize, 'h2')}
      {renderSectionTitle(subtitle, parseProp(null, 'xl'), 'h3')}

      {description && (
        <Box>
          {Array.isArray(description) ? (
            <PrismicTextComponent
              field={description}
              fontWeight="400"
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
          textAlign={descriptionTextAlign || 'left'}
          mt="4"
        >
          <Link
            href={resolveLink(buttonUrl)}
            variant="buttonDefault"
            isExternal={typeof buttonUrl === 'object' && buttonUrl?.link_type === 'Web' && buttonUrl?.target === '_blank'}
            display="inline-block"
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

ImageOnTopVariation.propTypes = {
  image: PropTypes.shape({
    url: PropTypes.string,
    alt: PropTypes.string,
  }),
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  buttonLabel: PropTypes.string,
  buttonUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  fontFamily: PropTypes.string,
  fontColor: PropTypes.string,
  titleFontSize: PropTypes.string,
  descriptionFontSize: PropTypes.string,
  descriptionTextAlign: PropTypes.string,
  buttonBackgroundColor: PropTypes.string,
  buttonFontColor: PropTypes.string,
  buttonFontSize: PropTypes.string,
};

ImageOnTopVariation.defaultProps = {
  image: null,
  title: null,
  subtitle: null,
  description: null,
  buttonLabel: null,
  buttonUrl: null,
  fontFamily: 'Lato',
  fontColor: null,
  titleFontSize: '2xl',
  descriptionFontSize: 'md',
  descriptionTextAlign: 'left',
  buttonBackgroundColor: null,
  buttonFontColor: null,
  buttonFontSize: null,
};

export default ImageOnTopVariation;
