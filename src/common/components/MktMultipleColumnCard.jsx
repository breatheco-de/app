import { Box, Grid } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';
import useStyle from '../hooks/useStyle';

function MktMultipleColumnCard({ id, title, columns, fontFamily, marginBottom, marginTop, maxWidth, ...rest }) {
  const limitedColumns = columns.slice(0, 5);
  const { navbarBackground } = useStyle();

  return (
    <Box maxWidth={maxWidth} textAlign="center" p={4} margin={`${marginTop} auto ${marginBottom || '40px'} auto`} {...rest}>
      {/* Título principal */}
      <Text fontSize="34px" fontWeight="bold" mb={6}>
        {title}
      </Text>

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
              border="1px solid none"
              borderColor="gray.200"
              borderRadius="md"
              boxShadow="sm"
              bg={navbarBackground}
              textAlign="left"
            >
              <Text fontWeight="bold" mb={2} size="18px" fontFamily={fontFamily}>
                {index + 1}
                .
                {column.column_title}
              </Text>
              <Text size="18px" fontFamily={fontFamily}>
                {column.column_description}
              </Text>
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
  fontFamily: PropTypes.string,
  marginBottom: PropTypes.string,
  marginTop: PropTypes.string,
  maxWidth: PropTypes.string,
};

MktMultipleColumnCard.defaultProps = {
  id: '',
  title: null,
  columns: [],
  columnBackground: null,
  fontFamily: 'Lato',
  marginTop: '',
  marginBottom: '',
  maxWidth: '',
};

export default MktMultipleColumnCard;
