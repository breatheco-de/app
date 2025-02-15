import { Box, Button, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';

const bgColors = {
  info: 'blue.500',
  warning: 'yellow.500',
  error: 'red.500',
  success: 'green.500',
};

function CustomBanner({ title, content, status, isClosable, onClose, ...rest }) {
  return (
    <Box
      color="white"
      py={3}
      pl={5}
      pr={8}
      bg={bgColors[status]}
      borderRadius="0.375rem"
      position="relative"
      width="100%"
      {...rest}
    >
      <Flex gridGap="10px" mb="6px" alignItems="center">
        <Icon icon={status} width="20px" height="20px" color="currentColor" />
        <Box fontSize="16px" fontWeight="bold" lineHeight={6} flex="1">
          {title}
        </Box>
        {isClosable && (
        <Button
          position="absolute"
          background="transparent"
          _hover={{ background: 'var(--chakra-colors-blackAlpha-100)' }}
          _active={{ background: 'var(--chakra-colors-blackAlpha-100)' }}
          width="24px"
          minWidth="24px"
          height="24px"
          fontSize="10px"
          padding="0"
          onClick={onClose}
          top={2}
          right={2}
        >
          <Icon icon="close" width="10px" height="10px" color="currentColor" />
        </Button>
        )}
      </Flex>
      {content}
    </Box>
  );
}

CustomBanner.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  status: PropTypes.string,
  isClosable: PropTypes.bool,
  onClose: PropTypes.func,
};

CustomBanner.defaultProps = {
  status: 'info',
  isClosable: true,
  onClose: () => { },
};

export default CustomBanner;
