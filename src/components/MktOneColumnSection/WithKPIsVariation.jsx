import React from 'react';
import PropTypes from 'prop-types';
import { Box, VStack, Divider, Flex, Text } from '@chakra-ui/react';
import PrismicTextComponent from '../PrismicTextComponent'; // Assuming usage for description
import Link from '../NextChakraLink'; // Assuming usage for button
import Heading from '../Heading'; // Needed for MktKPI
import useStyle from '../../hooks/useStyle'; // Needed for MktKPI

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
  description,
  kpiList,
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
      return `/${link.uid || ''}`;
    }
    return '#';
  };

  const commonTextProps = {
    color: fontColor || 'inherit',
    fontSize: descriptionFontSize || 'md',
    textAlign: descriptionTextAlign || 'center',
  };

  return (
    <VStack spacing={6} align="stretch" width="100%">
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
            _hover={{
              // Example hover effect
            }}
          >
            {buttonLabel}
          </Link>
        </Box>
      )}
    </VStack>
  );
}

WithKPIsVariation.propTypes = {
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  kpiList: PropTypes.arrayOf(PropTypes.shape({
    kpi_title: PropTypes.string,
    kpi_description: PropTypes.string,
    kpi_color: PropTypes.string,
  })),
  buttonLabel: PropTypes.string,
  buttonUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  fontColor: PropTypes.string,
  descriptionFontSize: PropTypes.string,
  descriptionTextAlign: PropTypes.string,
  buttonBackgroundColor: PropTypes.string,
  buttonFontColor: PropTypes.string,
  buttonFontSize: PropTypes.string,
};

WithKPIsVariation.defaultProps = {
  description: null,
  kpiList: [],
  buttonLabel: null,
  buttonUrl: null,
  fontColor: null,
  descriptionFontSize: 'md',
  descriptionTextAlign: 'center',
  buttonBackgroundColor: null,
  buttonFontColor: null,
  buttonFontSize: null,
};

export default WithKPIsVariation;
