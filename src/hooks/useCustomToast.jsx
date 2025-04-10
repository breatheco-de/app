/* eslint-disable no-param-reassign */
import { Box, Button, Flex, useToast } from '@chakra-ui/react';
import Icon from '../common/components/Icon';

const bgColors = {
  info: { background: '#F9F9F9', color: '#3A3A3A', borderColor: '#DADADA' },
  warning: { background: '#ffefcc', color: '#975100', borderColor: '#FFB718' },
  error: { background: '#fee8e8', color: '#EB5757', borderColor: '#EB5757' },
  success: { background: '#e0ffe8', color: '#00a33d', borderColor: '#00bb2d' },
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
    maxWidth = '1200px',
    width = '90%',
    duration = 5000,
    description,
    actions = null,
    isClosable = true,
  }) => {
    const toastColors = bgColors[status];

    toastId = toast({
      position,
      status,
      render: () => (
        <Box
          color={toastColors.color}
          py={8}
          pl={5}
          pr={6}
          bg={toastColors.background}
          borderColor={toastColors.borderColor}
          borderWidth="2px"
          borderRadius="10px"
          position="relative"
          width={width}
          maxWidth={maxWidth}
          margin="auto"
          top="6vh"
          mt="12px"
        >
          <Flex gridGap="10px" mt="2px">
            <Icon icon={status} width="15px" height="15px" color="currentColor" mt="-4px" />
            <Box fontSize="14px" fontWeight="bold" lineHeight={6} mt="-8px" letterSpacing="1px">
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
                <Icon icon="close" width="10px" height="10px" color="black" />
              </Button>
            )}
          </Flex>
          <Box textAlign="left" mx="auto" ms="7" fontSize="14px">
            {description}
          </Box>
          {actions?.length > 0 && (
            <Flex gap="16px" mb="-35px">
              {actions.map((action) => (
                <Button
                  as="a"
                  key={action.label}
                  href={action.link}
                  background="transparent"
                  color="black"
                  _hover={{ background: 'transparent' }}
                  left={7}
                  fontSize="14px"
                  textDecoration="underline"
                  target="_blank"
                >
                  {action.label}
                </Button>
              ))}
            </Flex>
          )}
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
