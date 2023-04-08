import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const GridContainer = ({ children, gridTemplateColumns, childrenStyle, gridGap, gridColumn, ...rest }) => {
  const fraction = rest?.fraction || '0fr';

  return (
    <Box
      display={{ base: 'block', md: 'grid' }}
      maxWidth="1440px"
      margin={rest.margin || '0 auto'}
      padding={rest.padding || { base: '0 15px', md: '0' }}
      gridTemplateColumns={gridTemplateColumns || `${fraction} repeat(12, 1fr) ${fraction}`}
      gridGap={gridGap}
      {...rest}
    >
      {children}
    </Box>
  );
};

GridContainer.propTypes = {
  children: PropTypes.node,
  gridTemplateColumns: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  childrenStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  gridColumn: PropTypes.string,
  gridGap: PropTypes.string,
};

GridContainer.defaultProps = {
  children: null,
  gridTemplateColumns: null,
  childrenStyle: null,
  gridColumn: '',
  gridGap: '24px',
};

export default GridContainer;
