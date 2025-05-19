import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text } from '@chakra-ui/react';

function StatsCardVariation({ columns, fontFamily, navbarBackground }) {
  const formatStatistic = (stat) => {
    const num = Number(stat);
    if (Number.isNaN(num) || num < 1000) return stat;
    return `${Math.floor(num / 1000)}K`;
  };

  return (
    <Box
      display="flex"
      flexWrap={{ base: 'wrap', lg: 'nowrap' }}
      gap={{ base: 3, md: 6 }}
      justifyContent="space-between"
      width="100%"
      alignItems="stretch"
    >
      {columns.map((column) => {
        const idKey = `stat-column-${column.statistic || Math.random()}`;
        return (
          <Box
            key={idKey}
            flex={1}
            bg={navbarBackground}
            py="16px"
            borderRadius="md"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            alignItems="center"
            textAlign="center"
            minHeight="180px"
            gap="8px"
          >
            {column.column_title && (
              <Text fontSize="14px !important" fontFamily={fontFamily} lineHeight="1.5">
                {column.column_title}
              </Text>
            )}
            {column.statistic && (
              <>
                <Text
                  display={{ base: 'block', md: 'none' }}
                  fontSize={{ base: '38px !important', md: '48px !important' }}
                  fontWeight="bold"
                  bgGradient="linear(135deg, #0FB7FF, #022CC2 100%)"
                  backgroundClip="text"
                  fontFamily={fontFamily}
                  lineHeight="1"
                  mb={3}
                >
                  {formatStatistic(column.statistic)}
                </Text>
                <Text
                  display={{ base: 'none', md: 'block' }}
                  fontSize={{ base: '38px !important', md: '48px !important' }}
                  fontWeight="bold"
                  bgGradient="linear(135deg, #0FB7FF, #022CC2 100%)"
                  backgroundClip="text"
                  fontFamily={fontFamily}
                  lineHeight="1"
                  mb={3}
                >
                  {column.statistic}
                </Text>
              </>
            )}
            {column.column_description && (
              <Text fontSize={{ base: '12px !important', md: '14px !important' }} fontFamily={fontFamily} lineHeight="1.5" maxWidth="216px">
                {column.column_description}
              </Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

StatsCardVariation.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    column_title: PropTypes.string,
    statistic: PropTypes.string,
    column_description: PropTypes.string,
  })).isRequired,
  fontFamily: PropTypes.string,
  navbarBackground: PropTypes.string,
};

StatsCardVariation.defaultProps = {
  fontFamily: 'Lato',
  navbarBackground: 'transparent',
};

export default StatsCardVariation;
