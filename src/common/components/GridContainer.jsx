import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const GridContainer = ({ children, gridTemplateColumns, ...rest }) => {
  console.log('container');

  return (
    <Box
      display="grid"
      gridTemplateColumns={gridTemplateColumns || { base: '.5fr repeat(12, 1fr) .5fr', md: '1.5fr repeat(12, 1fr) 1.5fr' }}
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
