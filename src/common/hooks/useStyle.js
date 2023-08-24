import { useColorModeValue } from '@chakra-ui/react';

const useStyle = () => {
  const navbarBackground = useColorModeValue('white', 'gray.800');
  const backgroundColor = useColorModeValue('white', 'darkTheme');
  const backgroundColor2 = useColorModeValue('white', 'gray.700');
  const backgroundColor3 = useColorModeValue('gray.light2', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const borderColor2 = useColorModeValue('gray.200', 'gray.500');
  const borderColorStrong = useColorModeValue('gray.400', 'gray.500');
  const disabledBackgroundColor = useColorModeValue('gray.250', 'gray.600');
  const disabledColor = useColorModeValue('gray.500', 'gray.350');
  const disabledColor2 = useColorModeValue('gray.default', '#CACACA');
  const featuredColor = useColorModeValue('featuredLight', 'featuredDark');
  const fontColor = useColorModeValue('black', 'white');
  const fontColor2 = useColorModeValue('gray.dark', 'gray.250');
  const fontColor3 = useColorModeValue('gray.700', 'gray.300');
  const reverseFontColor = useColorModeValue('white', 'gray.900');
  const lightColor = useColorModeValue('gray.600', 'gray.200');
  const tooltipBackground = useColorModeValue('gray.dark', 'gray.dark');
  const featuredLight = useColorModeValue('gray.light3', 'featuredDark');

  const hexColor = {
    black: useColorModeValue('#000000', '#ffffff'),
    fontColor3: useColorModeValue('#606060', '#EBEBEB'),
    backgroundColor: useColorModeValue('#ffffff', '#17202A'),
    featuredColor: useColorModeValue('#EEF9FE', '#283340'),
    lightColor: useColorModeValue('#F5F5F5', '#4A5568'),
    lightColor2: useColorModeValue('#F5F5F5', '#283340'),
    white2: useColorModeValue('#ffffff', '#283340'),
    danger: useColorModeValue('#CD0000', '#e26161'),
    blueDefault: '#0097CD',
    yellowDefault: '#FFB718',
    green: '#38A56A',
    greenLight: '#25BF6C',
    fontColor2: useColorModeValue('#3A3A3A', '#EBEBEB'),
  };
  const input = {
    borderColor: useColorModeValue('gray.default', '#CACACA'),
  };
  const modal = {
    featuredBackground: useColorModeValue('featuredLight', 'darkTheme'),
    background: useColorModeValue('white', 'featuredDark'),
    background2: useColorModeValue('white', 'gray.900'),
    background3: useColorModeValue('white', 'gray.800'),
    hoverBackground: useColorModeValue('featuredLight', 'gray.700'),
  };

  return {
    backgroundColor,
    backgroundColor2,
    backgroundColor3,
    borderColor,
    borderColor2,
    borderColorStrong,
    disabledBackgroundColor,
    disabledColor,
    disabledColor2,
    featuredColor,
    fontColor,
    fontColor2,
    fontColor3,
    hexColor,
    input,
    lightColor,
    modal,
    reverseFontColor,
    tooltipBackground,
    featuredLight,
    navbarBackground,
  };
};

export default useStyle;
