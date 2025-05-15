import React from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  Text,
  Heading,
  Grid,
  GridItem,
  Link as ChakraLink,
  Box,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import useTranslation from 'next-translate/useTranslation';

const prismicImageField = PropTypes.shape({
  url: PropTypes.string,
  alt: PropTypes.string,
});

function SmallImageAndLinkVariation({ columns, fontFamily, navbarBackground }) {
  const { t } = useTranslation();

  return (
    <Grid
      templateColumns={{
        base: 'repeat(1, 1fr)',
        md: 'repeat(2, 1fr)',
        lg: `repeat(${columns?.length > 0 && columns?.length <= 4 ? columns.length : 4}, 1fr)`,
      }}
      gap={{ base: 4, md: 6 }}
      width="100%"
    >
      {columns.map((column) => {
        const idKey = `detailed-column-${column.column_title || Math.random()}`;
        return (
          <GridItem
            key={idKey}
            bg={navbarBackground}
            p={6}
            borderRadius="md"
            display="flex"
            flexDirection={{ base: 'row', md: 'column' }}
            alignItems={{ base: 'center', md: 'start' }}
            gap={{ base: 4, md: 3 }}
          >
            {column.image?.url && (
              <Image
                src={column.image.url}
                alt={column.image.alt || ''}
                boxSize={{ base: '58px', md: '70px', lg: '76px' }}
                mb={{ base: 0, md: 2 }}
                flexShrink={0}
              />
            )}
            <Box display="flex" flexDirection="column" flexGrow={1} alignItems="start" width="100%" gap={1}>
              {column.column_title && (
                <Heading
                  as="h3"
                  textAlign="start"
                  size="sm"
                  color={column.feature_color || 'blue.default'}
                  fontFamily={fontFamily}
                >
                  {column.column_title}
                </Heading>
              )}
              {column.column_description && (
                <Text fontSize="sm" fontFamily={fontFamily} textAlign="left">
                  {column.column_description}
                </Text>
              )}
              {column.link?.url && (
                <NextLink href={column.link.url} passHref legacyBehavior>
                  <ChakraLink
                    mt="auto"
                    pt={2}
                    fontSize="sm"
                    color="blue.default"
                    display="inline-block"
                    fontWeight="bold"
                    ms="10px"
                  >
                    {t('common:see-more')}
                  </ChakraLink>
                </NextLink>
              )}
            </Box>
          </GridItem>
        );
      })}
    </Grid>
  );
}

SmallImageAndLinkVariation.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    image: prismicImageField,
    column_title: PropTypes.string,
    column_description: PropTypes.string,
    link: PropTypes.shape({
      url: PropTypes.string,
    }),
    feature_color: PropTypes.string,
  })).isRequired,
  fontFamily: PropTypes.string,
  navbarBackground: PropTypes.string,
};

SmallImageAndLinkVariation.defaultProps = {
  fontFamily: 'Lato',
  navbarBackground: 'transparent',
};

export default SmallImageAndLinkVariation;
