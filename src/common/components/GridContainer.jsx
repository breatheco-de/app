import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';

function GridContainer({ children, gridTemplateColumns, childrenStyle, gridGap, gridColumn, withContainer, ...rest }) {
  return (
    <Box
      display={{ base: 'block', md: 'grid' }}
      maxWidth="1440px"
      margin={rest.margin || '0 auto'}
      padding={rest.padding || { base: '0 15px', md: '0' }}
      gridTemplateColumns={gridTemplateColumns || 'repeat(10, 1fr)'}
      gridGap={gridGap}
      {...rest}
    >
      {withContainer ? (
        <Box gridColumn={gridColumn || '2 / span 8'} {...childrenStyle}>
          {children}
        </Box>
      ) : children}
    </Box>
  );
}

GridContainer.propTypes = {
  children: PropTypes.node,
  gridTemplateColumns: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  childrenStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  gridColumn: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  gridGap: PropTypes.string,
  withContainer: PropTypes.bool,
};

GridContainer.defaultProps = {
  children: null,
  gridTemplateColumns: null,
  childrenStyle: null,
  gridColumn: '',
  gridGap: '24px',
  withContainer: false,
};

export default GridContainer;
