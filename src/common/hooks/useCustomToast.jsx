/* eslint-disable no-param-reassign */
import { Box, Button, Flex, useToast } from '@chakra-ui/react';
import Icon from '../components/Icon';

const bgColors = {
  silent: {
    info: { background: 'blue.500', color: 'gray.50', borderColor: 'transparent' },
    warning: { background: 'yellow.500', color: 'gray.50', borderColor: 'transparent' },
    error: { background: 'red.500', color: 'gray.50', borderColor: 'transparent' },
    success: { background: 'green.500', color: 'gray.50', borderColor: 'transparent' },
  },
  noSilent: {
    info: { background: '#F9F9F9', color: '#3A3A3A', borderColor: '#DADADA' },
    warning: { background: '#FFF4DC', color: '#975100', borderColor: '#FFB718' },
    error: { background: '#FFE3E3', color: '#EB5757', borderColor: '#EB5757' },
    success: { background: '#DFFFE8', color: '#06AB52', borderColor: '#06AB52' },
  },
};

const useCustomToast = ({
  toastId,
}) => {
  const toast = useToast();
  const closeToast = () => {
    toast.close(toastId);
  };

  const createToast = ({
    title = 'Already have an account?',
    status = 'success',
    position = 'top',
    duration = null,
    description,
    isClosable = true,
    silent = false,
  }) => {
    const toastColors = bgColors[silent ? 'silent' : 'noSilent'][status];

    console.log('dee', toastColors);

    toastId = toast({
      position,
      status,
      render: () => (
        <Box
          color={toastColors.color}
          py={3}
          pl={5}
          pr={8}
          bg={toastColors.background}
          borderColor={toastColors.borderColor}
          borderWidth="1px"
          borderRadius="1px"
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
                background="transparent"
                _hover={{ background: 'var(--chakra-colors-blckAlpha-100)' }}
                _active={{ background: 'var(--chakra-colors-blackAlpha-100)' }}
                width="24px"
                minWidth="24px"
                height="24px"
                fontSize="10px"
                padding={2}
                onClick={closeToast}
                top={2}
                right={2}
              >
                <Icon icon="close" width="10px" height="10px" color="currentColor" />
              </Button>
            )}
          </Flex>
          {description}
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
