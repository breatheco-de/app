import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const GridContainer = ({ children, gridTemplateColumns, ...rest }) => {
  console.log('container');

  return (
    <Box
      display="grid"
      maxWidth="1280px"
      margin={rest.margin || '0 auto'}
      padding={{ base: '0 15px', md: '0' }}
      gridTemplateColumns={gridTemplateColumns || '0fr repeat(12, 1fr) 0fr'}
      {...rest}
    >
      <Box display="grid" gridColumn="2 / span 12">
        {children}
      </Box>
    </Box>
  );
};

GridContainer.propTypes = {
  children: PropTypes.node,
  gridTemplateColumns: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
};

GridContainer.defaultProps = {
  children: null,
  gridTemplateColumns: null,
};

export default GridContainer;
