import React from 'react';
import PropTypes from 'prop-types';
import { Box, VStack, Text } from '@chakra-ui/react';
import PrismicTextComponent from '../../PrismicTextComponent';
import Link from '../../NextChakraLink';
import Heading from '../../Heading';
import { parseProp } from '../../../utils';

function BannerVariation({
  title,
  subtitle,
  description,
  buttonLabel,
  buttonUrl,
  fontColor,
  titleFontSize: titleFontSizeProp,
  descriptionFontSize,
  descriptionTextAlign,
  buttonBackgroundColor,
  buttonFontColor,
  buttonFontSize,
  fontFamily,
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
    textAlign: descriptionTextAlign || 'center',
    fontFamily: fontFamily || 'Lato',
  };

  const finalTitleSize = parseProp(titleFontSizeProp, '3xl');

  const renderSectionTitle = (content, size, as = 'h2') => {
    if (!content) return null;

    if (Array.isArray(content)) {
      return (
        <PrismicTextComponent
          field={content}
          as={as}
          fontSize={size}
          fontWeight="bold"
          color={fontColor || null}
          fontFamily={fontFamily || 'Lato'}
          textAlign={descriptionTextAlign || 'center'}
          marginBottom="4"
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
        textAlign={descriptionTextAlign || 'center'}
        marginBottom="4"
      >
        {content}
      </Heading>
    );
  };

  return (
    <VStack spacing={4} align="stretch" width="100%">
      {renderSectionTitle(title, finalTitleSize, 'h2')}
      {renderSectionTitle(subtitle, 'md', 'h4')}
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
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  buttonLabel: PropTypes.string,
  buttonUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  fontColor: PropTypes.string,
  titleFontSize: PropTypes.string,
  descriptionFontSize: PropTypes.string,
  descriptionTextAlign: PropTypes.string,
  buttonBackgroundColor: PropTypes.string,
  buttonFontColor: PropTypes.string,
  buttonFontSize: PropTypes.string,
  fontFamily: PropTypes.string,
};

BannerVariation.defaultProps = {
  title: null,
  subtitle: null,
  description: null,
  buttonLabel: null,
  buttonUrl: null,
  fontColor: null,
  titleFontSize: '3xl',
  descriptionFontSize: 'md',
  descriptionTextAlign: 'center',
  buttonBackgroundColor: null,
  buttonFontColor: null,
  buttonFontSize: null,
  fontFamily: 'Lato',
};

export default BannerVariation;
