/* eslint-disable no-param-reassign */
import { Box, Button, Flex, useToast } from '@chakra-ui/react';
import Icon from '../components/Icon';

const bgColors = {
  info: 'blue.500',
  warning: 'yellow.500',
  error: 'red.500',
  success: 'green.500',
};

const useCustomToast = ({
  toastIdRef,
  title = 'Already have an account?',
  status = 'info',
  duration = 16000,
  content,
  isClosable = true,
}) => {
  const toast = useToast();
  const closeToast = () => {
    if (toastIdRef.current) {
      toast.close(toastIdRef.current);
    }
  };

  const createToast = () => {
    toastIdRef.current = toast({
      status,
      render: () => (
        <Box
          color="white"
          py={3}
          pl={5}
          pr={8}
          bg={bgColors[status]}
          borderRadius="0.375rem"
          position="relative"
        >
          <Flex gridGap="10px" mb="6px">
            <Icon icon={status} width="20px" height="20px" color="currentColor" />
            <Box fontSize="16px" fontWeight="bold" lineHeight={6}>
              {title}
            </Box>
            {isClosable && (
              <Button
                position="absolute"
                background={bgColors[status]}
                _hover={{ background: 'var(--chakra-colors-blackAlpha-100)' }}
                _active={{ background: 'var(--chakra-colors-blackAlpha-100)' }}
                width="24px"
                minWidth="24px"
                height="24px"
                fontSize="10px"
                padding="0"
                onClick={closeToast}
                top={2}
                right={2}
              >
                <Icon icon="close" width="10px" height="10px" color="currentColor" />
              </Button>
            )}
          </Flex>
          {content}
        </Box>
      ),
      duration,
    });
  };

  return {
    createToast,
    closeToast,
  };
};

export default useCustomToast;
