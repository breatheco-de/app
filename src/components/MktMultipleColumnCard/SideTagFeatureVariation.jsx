import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Text,
  Heading,
  Grid,
  GridItem,
  Image,
} from '@chakra-ui/react';

const prismicImageField = PropTypes.shape({
  url: PropTypes.string,
  alt: PropTypes.string,
});

function SideTagFeatureVariation({ columns, fontFamily, navbarBackground }) {
  return (
    <Grid
      templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
      gap={{ base: 4, md: 6 }}
      width="100%"
    >
      {columns.map((column) => {
        const idKey = `sidetag-column-${column.column_title || Math.random()}`;
        return (
          <GridItem
            key={idKey}
            position="relative"
            display="flex"
          >
            <Box
              position="absolute"
              top="50%"
              left="0"
              transform="translateY(-50%)"
              height="97px"
              width={{ base: '16px', md: '22px' }}
              bg={column.feature_color || 'blue.default'}
              borderRadius="md"
              zIndex={1}
            />
            <Box
              bg={navbarBackground}
              p="16px"
              borderRadius="md"
              ml={{ base: '8px', md: '11px' }}
              position="relative"
              zIndex={2}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              gap={2}
              flex={1}
              width="100%"
            >
              {column.image?.url && (
                <Image
                  src={column.image.url}
                  alt={column.image.alt || ''}
                  width={{ base: '46px', md: '55px', lg: '76px' }}
                  mb={2}
                />
              )}
              <Box display="flex" flexDirection="column" gap="8px">
                {column.column_title && (
                  <Heading as="h3" size="sm" fontFamily={fontFamily} textAlign="left">
                    {column.column_title}
                  </Heading>
                )}
                {column.column_description && (
                  <Text fontSize="sm" fontFamily={fontFamily} textAlign="left">
                    {column.column_description}
                  </Text>
                )}
              </Box>
            </Box>
          </GridItem>
        );
      })}
    </Grid>
  );
}

SideTagFeatureVariation.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    image: prismicImageField,
    column_title: PropTypes.string,
    column_description: PropTypes.string,
    feature_color: PropTypes.string,
  })).isRequired,
  fontFamily: PropTypes.string,
  navbarBackground: PropTypes.string,
};

SideTagFeatureVariation.defaultProps = {
  fontFamily: 'Lato',
  navbarBackground: 'transparent',
};

export default SideTagFeatureVariation;
