import PropTypes from 'prop-types';
import { Box, useColorModeValue } from '@chakra-ui/react';
import Heading from '../Heading';
import Text from '../Text';
import Icon from '../Icon';

const ContentHeading = ({ content, children }) => {
  const { title, subtitle } = content;
  return (
    <Box
      borderBottom={1}
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.900')}
      paddingBottom="2rem"
      marginBottom="2rem"
    >
      <Box marginBottom="1.2rem">
        <Heading size="m" display="inline-flex" marginTop="1.5rem">
          <Icon icon="book" height="30px" width="28px" style={{ margin: 'auto', marginRight: '0.4rem' }} />
          {' '}
          {title}
        </Heading>
        <Text size="l" marginTop="0.5rem">
          {subtitle}
        </Text>
      </Box>
      {children}
    </Box>
  );
};

ContentHeading.propTypes = {
  content: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
ContentHeading.defaultProps = {
  content: '',
};

export default ContentHeading;
