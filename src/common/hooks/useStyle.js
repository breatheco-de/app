import { useColorModeValue } from '@chakra-ui/react';
import theme from '../../../styles/theme';

const useStyle = () => {
  const navbarBackground = useColorModeValue('white', 'gray.800');
  const backgroundColor = useColorModeValue('white', 'darkTheme');
  const backgroundColor2 = useColorModeValue('white', 'gray.700');
  const backgroundColor3 = useColorModeValue('gray.light2', 'gray.800');
  const backgroundColor4 = useColorModeValue('#F4FAFF', 'gray.800');
  const backgroundColor5 = useColorModeValue('#E1F5FF', 'gray.800');
  const backgroundColor6 = useColorModeValue('#DCE9FF', 'gray.800');
  const backgroundColor7 = useColorModeValue('#F3FAFE', 'gray.800');
  const backgroundColor8 = useColorModeValue('#E1F5FF', 'darkTheme');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const borderColor2 = useColorModeValue('gray.200', 'featuredDark');
  const borderColorStrong = useColorModeValue('gray.400', 'gray.500');
  const disabledBackgroundColor = useColorModeValue('gray.250', 'gray.600');
  const disabledColor = useColorModeValue('gray.500', 'gray.350');
  const disabledColor2 = useColorModeValue('gray.default', '#CACACA');
  const featuredColor = useColorModeValue('featuredLight', 'featuredDark');
  const featuredColor2 = useColorModeValue('#D2E2FE', 'featuredDark2');
  const featuredColor3 = useColorModeValue('#D2E2FE', 'featuredDark');
  const fontColor = useColorModeValue('black', 'white');
  const fontColor2 = useColorModeValue('gray.dark', 'gray.250');
  const fontColor3 = useColorModeValue('gray.700', 'gray.300');
  const reverseFontColor = useColorModeValue('white', 'gray.900');
  const lightColor = useColorModeValue('gray.600', 'gray.200');
  const tooltipBackground = useColorModeValue('gray.dark', 'gray.dark');
  const featuredLight = useColorModeValue('gray.light3', 'featuredDark');
  const colorMode = useColorModeValue('light', 'dark');
  const reverseColorMode = useColorModeValue('dark', 'light');
  const complementaryBlue = useColorModeValue('blue.900', 'blue.600');

  const featuredCard = {
    background: useColorModeValue('white', '#181a1b'),
    blueDark: useColorModeValue('#01455E', '#27b1e4'),
    blue: {
      background: useColorModeValue('blue.default', '#157497'),
      featured: useColorModeValue('blue.light', '#092835'),
    },
    yellow: {
      background: useColorModeValue('yellow.default', 'rgb(135 97 20)'),
      featured: useColorModeValue('yellow.light', '#332508'),
    },
  };

  const hexColor = {
    blue2: useColorModeValue('#01455E', '#ffffff'),
    black: useColorModeValue('#000000', '#ffffff'),
    disabledColor: useColorModeValue('#A4A4A4', '#CACACA'),
    fontColor3: useColorModeValue('#606060', '#EBEBEB'),
    borderColor: useColorModeValue('#DADADA', '#4A5568'),
    backgroundColor: useColorModeValue('#ffffff', '#17202A'),
    featuredColor: useColorModeValue('#EEF9FE', '#283340'),
    featuredColor2: useColorModeValue('#F5F8FF', '#283340'),
    featuredColor3: useColorModeValue('#F3FAFE', '#19202a'),
    lightColor: useColorModeValue('#F5F5F5', '#4A5568'),
    lightColor2: useColorModeValue('#F5F5F5', '#283340'),
    lightColor3: useColorModeValue('#F5F5F5', '#17202A'),
    lightColor4: useColorModeValue('#F0F2F5', '#4A5568'),
    white: '#FFFFFF',
    white2: useColorModeValue('#ffffff', '#283340'),
    danger: useColorModeValue('#CD0000', '#e26161'),
    blueDefault: '#0097CD',
    blue: useColorModeValue('#DCE9FF', '#2b3340'),
    blueLight: useColorModeValue('#E1F5FF', '#2b3340'),
    yellowDefault: '#FFB718',
    green: '#38A56A',
    greenLight: '#25BF6C',
    greenLight2: '#A4FFBD',
    greenLight3: '#D7FFE2',
    greenLight4: '#F2FFF6',
    fontColor2: useColorModeValue('#3A3A3A', '#EBEBEB'),
    successLight: useColorModeValue('#e9ffef', '#A4FFBD'),
    gray: {
      ...theme.colors.gray,
    },
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
    backgroundColor4,
    backgroundColor5,
    backgroundColor6,
    backgroundColor7,
    backgroundColor8,
    borderColor,
    borderColor2,
    borderColorStrong,
    disabledBackgroundColor,
    disabledColor,
    disabledColor2,
    featuredColor,
    featuredColor2,
    featuredColor3,
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
    featuredCard,
    colorMode,
    reverseColorMode,
    complementaryBlue,
  };
};

export default useStyle;
