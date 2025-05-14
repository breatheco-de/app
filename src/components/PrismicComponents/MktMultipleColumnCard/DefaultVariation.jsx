import React from 'react';
import PropTypes from 'prop-types';
import { Box, Image, Text, Heading } from '@chakra-ui/react';

const prismicImageField = PropTypes.shape({
  url: PropTypes.string,
  alt: PropTypes.string,
});

function DefaultVariation({ columns, fontFamily, navbarBackground }) {
  return (
    <Box
      display="flex" // Use Flex container for layout
      flexWrap={{ base: 'wrap', lg: 'nowrap' }}
      gap={{ base: 3, md: 6 }}
      justifyContent="space-between"
      width="100%"
      alignItems="stretch"
    >
      {columns.map((column, index) => {
        const idKey = `default-column-${index}`;
        return (
          <Box
            key={idKey}
            flex={{ base: '0 0 100%', md: 1 }}
            bg={navbarBackground}
            borderRadius="md"
            display="flex"
            flexDirection={{ base: 'row-reverse', md: column.flex_direction || 'column' }}
            justifyContent={{ base: 'center', md: 'flex-start' }}
            boxShadow="sm"
            overflow="hidden"
            height={{ base: '178px', md: '417px' }}
          >
            {column.image?.url && (
              <Image
                src={column.image.url}
                alt={column.image.alt || ''}
                padding="10px"
                borderRadius="20px"
                width={{ base: '100px', sm: '120px', md: '100%' }}
                height={{ base: '100%', md: '100%' }}
                maxHeight={{ md: '281px' }}
                objectFit="cover"
              />
            )}
            <Box
              p={{ base: 3, md: 5 }}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="flex-start"
              textAlign="left"
              flexGrow={1}
              gap={{ base: '8px', md: '8px' }}
              minHeight="82px"
              alignSelf={{ base: 'baseline', md: 'auto' }}
              wordBreak="break-word"
            >
              {column.column_title && (
                <Heading as="h3" size="sm" fontFamily={fontFamily} mb={2}>
                  {`${index + 1}. ${column.column_title}`}
                </Heading>
              )}
              {column.column_description && (
                <Text fontSize="sm" fontFamily={fontFamily} lineHeight="1.6">
                  {column.column_description}
                </Text>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

DefaultVariation.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    image: prismicImageField,
    column_title: PropTypes.string,
    column_description: PropTypes.string,
    flex_direction: PropTypes.string,
  })).isRequired,
  fontFamily: PropTypes.string,
  navbarBackground: PropTypes.string,
};

DefaultVariation.defaultProps = {
  fontFamily: 'Lato',
  navbarBackground: 'transparent',
};

export default DefaultVariation;
