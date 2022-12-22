import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const GridContainer = ({ children, gridTemplateColumns, childrenStyle, ...rest }) => {
  const fraction = rest?.fraction || '0fr';

  return (
    <Box
      display={{ base: 'block', md: 'grid' }}
      maxWidth="1280px"
      margin={rest.margin || '0 auto'}
      padding={rest.padding || { base: '0 15px', md: '0' }}
      gridTemplateColumns={gridTemplateColumns || `${fraction} repeat(12, 1fr) ${fraction}`}
      {...rest}
    >
      <Box display={{ base: 'block', md: 'grid' }} gridColumn={{ base: 1, md: '2 / span 12' }} style={childrenStyle}>
        {children}
      </Box>
    </Box>
  );
};

GridContainer.propTypes = {
  children: PropTypes.node,
  gridTemplateColumns: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  childrenStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
};

GridContainer.defaultProps = {
  children: null,
  gridTemplateColumns: null,
  childrenStyle: null,
};

export default GridContainer;
