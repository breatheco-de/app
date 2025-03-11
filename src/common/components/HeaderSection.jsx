import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from './Heading';
import useStyle from '../hooks/useStyle';

function HeaderSection({ id, headingTop, smallHeading, headingBottom, subtitle, searchBar, padding, background, ...rest }) {
  const backgroundColor = background || useColorModeValue('blue.50', 'gray.900');
  const { hexColor } = useStyle();
  return (
    <Box id={id} padding={padding || { base: '10px 0', md: '60px 80px' }} background={backgroundColor} {...rest}>
      <Box width="auto" maxWidth="961px" margin="0 auto">
        {smallHeading && (
          <Heading color={hexColor.blueDefault} fontSize="14px" mb={2} textAlign="center">
            {smallHeading}
          </Heading>
        )}
        <Heading fontSize="38px" fontWeight="bold" mb={2} textAlign="center">
          {headingTop}
          <br />
          {headingBottom}
        </Heading>
        <Text fontSize="21px" color={useColorModeValue('gray.600')} mb={4} textAlign="center">
          {subtitle}
        </Text>
        {searchBar}
      </Box>
    </Box>
  );
}

HeaderSection.propTypes = {
  smallHeading: PropTypes.string,
  headingTop: PropTypes.string.isRequired,
  headingBottom: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  searchBar: PropTypes.node,
  id: PropTypes.string,
  padding: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  background: PropTypes.string,
};

HeaderSection.defaultProps = {
  smallHeading: null,
  id: '',
  searchBar: null,
  padding: null,
  background: null,
};

export default HeaderSection;
