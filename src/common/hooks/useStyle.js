import { useColorModeValue } from '@chakra-ui/react';

const useStyle = () => {
  const backgroundColor = useColorModeValue('white', 'darkTheme');
  const backgroundColor2 = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const borderColorStrong = useColorModeValue('gray.400', 'gray.500');
  const disabledBackgroundColor = useColorModeValue('gray.250', 'gray.600');
  const disabledColor = useColorModeValue('gray.600', 'gray.350');
  const featuredColor = useColorModeValue('featuredLight', 'featuredDark');
  const fontColor = useColorModeValue('black', 'white');
  const fontColor2 = useColorModeValue('gray.dark', 'gray.250');
  const lightColor = useColorModeValue('gray.600', 'gray.200');
  const tooltipBackground = useColorModeValue('gray.dark', 'gray.dark');

  const hexColor = {
    black: useColorModeValue('#000000', '#ffffff'),
    white2: useColorModeValue('#ffffff', '#283340'),
    danger: useColorModeValue('#CD0000', '#e26161'),
    blueDefault: '#0097CD',
    yellowDefault: '#FFB718',
    green: '#38A56A',
  };
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
    backgroundColor2,
    borderColor,
    disabledBackgroundColor,
    disabledColor,
    featuredColor,
    fontColor,
    fontColor2,
    hexColor,
    input,
    lightColor,
    modal,
    tooltipBackground,
    borderColorStrong,
  };
};

export default useStyle;
