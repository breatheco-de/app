import { Box, Grid } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';
import useStyle from '../hooks/useStyle';

function MktMultipleColumnCard({ id, title, columns, ...rest }) {
  const limitedColumns = columns.slice(0, 5);
  const { navbarBackground } = useStyle();

  console.log('BLLDJLAJSLDKAJLSAJDKL', limitedColumns);
  return (
    <Box textAlign="center" p={4} {...rest}>
      {/* Título principal */}
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        {title}
      </Text>

      {/* Grid responsivo */}
      <Grid
        templateColumns={{ base: '1fr', md: `repeat(${Math.min(limitedColumns.length, 3)}, 1fr)` }}
        gap={6}
      >
        {limitedColumns.map((column, index) => {
          const idKey = `column-${index}`;
          return (
            <Box
              key={idKey}
              p={4}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              boxShadow="sm"
              bg={navbarBackground}
            >
              <Text fontWeight="bold" mb={2}>
                {column.column_title}
              </Text>
              <Text>{column.column_description}</Text>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
}
MktMultipleColumnCard.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  columns: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  columnBackground: PropTypes.string,
};

MktMultipleColumnCard.defaultProps = {
  id: '',
  title: null,
  columns: [],
  columnBackground: null,

};

export default MktMultipleColumnCard;
