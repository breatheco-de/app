import { useColorModeValue } from '@chakra-ui/react';

const useStyle = () => {
  const backgroundColor = useColorModeValue('white', 'darkTheme');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const disabledBackgroundColor = useColorModeValue('gray.250', 'gray.600');
  const disabledColor = useColorModeValue('gray.600', 'gray.350');
  const featuredColor = useColorModeValue('featuredLight', 'featuredDark');
  const fontColor = useColorModeValue('black', 'white');
  const lightColor = useColorModeValue('gray.600', 'gray.200');
  const input = {
    borderColor: useColorModeValue('gray.default', '#CACACA'),
  };
  const modal = {
    featuredBackground: useColorModeValue('featuredLight', 'darkTheme'),
    background: useColorModeValue('white', 'featuredDark'),
    hoverBackground: useColorModeValue('featuredLight', 'gray.700'),
  };

  return {
    backgroundColor,
    borderColor,
    disabledBackgroundColor,
    disabledColor,
    featuredColor,
    fontColor,
    lightColor,
    modal,
    input,
  };
};

export default useStyle;
