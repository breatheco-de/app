import React from 'react';
import PropTypes from 'prop-types';
import { Box, VStack, Divider, Flex, Text } from '@chakra-ui/react';
import PrismicTextComponent from '../../PrismicTextComponent';
import Link from '../../NextChakraLink';
import Heading from '../../Heading';
import useStyle from '../../../hooks/useStyle';
import { parseProp } from '../../../utils';

function MktKPI({ kpiTitle, kpiDescription, color }) {
  const { fontColor, hexColor, backgroundColor } = useStyle();
  return (
    <Box
      width="200px"
      background={backgroundColor}
      borderRadius="12px"
      p={{ base: '10px', md: '1rem' }}
      textAlign="center"
    >
      <Heading size="md" color={color || hexColor.blueDefault}>
        {kpiTitle}
      </Heading>
      <Divider
        opacity="1"
        margin="10px auto"
        width="32px"
        borderWidth="3px"
        borderColor={color || hexColor.blueDefault}
      />
      <Text
        fontSize="sm"
        lineHeight="normal"
        color={fontColor}
      >
        {kpiDescription}
      </Text>
    </Box>
  );
}

MktKPI.propTypes = {
  kpiTitle: PropTypes.string,
  kpiDescription: PropTypes.string,
  color: PropTypes.string,
};

MktKPI.defaultProps = {
  kpiTitle: 'N/A',
  kpiDescription: 'N/A',
  color: null,
};

function WithKPIsVariation({
  title,
  subtitle,
  description,
  kpiList,
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
          marginBottom="4"
          textAlign={descriptionTextAlign || 'center'}
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
        marginBottom="4"
        textAlign={descriptionTextAlign || 'center'}
      >
        {content}
      </Heading>
    );
  };

  return (
    <VStack spacing={6} align="stretch" width="100%">
      {renderSectionTitle(title, finalTitleSize, 'h2')}
      {renderSectionTitle(subtitle, 'md', 'h4')}
      {kpiList && kpiList.length > 0 && (
        <Flex
          gridGap="20px"
          flexWrap="wrap"
          justifyContent="center"
          mb="6"
        >
          {kpiList.map((kpi, index) => (
            <MktKPI
              key={kpi.kpi_title || `kpi-${index}`}
              kpiTitle={kpi.kpi_title}
              kpiDescription={kpi.kpi_description}
              color={kpi.kpi_color}
            />
          ))}
        </Flex>
      )}

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
        <Box textAlign={descriptionTextAlign || 'center'} mt="4">
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

WithKPIsVariation.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  kpiList: PropTypes.arrayOf(PropTypes.shape({
    kpi_title: PropTypes.string,
    kpi_description: PropTypes.string,
    kpi_color: PropTypes.string,
  })),
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

WithKPIsVariation.defaultProps = {
  title: null,
  subtitle: null,
  description: null,
  kpiList: [],
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

export default WithKPIsVariation;
