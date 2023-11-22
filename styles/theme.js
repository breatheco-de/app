import { extendTheme } from '@chakra-ui/react';
import Button from './components/customButton';
import Link from './components/customLink';

const theme = extendTheme({
  fonts: {
    heading: 'Lato',
    body: 'Lato',
  },

  // Breakpoints
  breakpoints: {
    sm: '30em', // 480px
    md: '48em', // 768px
    lg: '62.25em', // 996px
    xl: '80em', // 1280px
    '2xl': '96em', // 1536px
  },

  // Color scheme of Components
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'darkTheme' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'black',
      },
    }),
  },
  colors: {
    white: '#FFFFFF',
    featuredLight: '#EEF9FE',

    darkTheme: '#17202A',
    featuredDark: '#283340',

    black: '#000000',
    yellow: {
      default: '#FFB718',
      light: '#FFF4DC',
      100: '#FEFCBF',
      200: '#FAF089',
      300: '#F6E05E',
      400: '#ECC94B',
      500: '#e69e00',
      600: '#D69E2E',
    },
    blueDefaultScheme: {
      100: '#EBF8FF',
      200: '#BEE3F8',
      300: '#90CDF4',
      400: '#63B3ED',
      500: '#0097CD',
      600: '#0097CD',
      700: '#0097CD',
    },

    blue: {
      default: '#0097CD',
      default2: '#0097CF',
      light: '#EEF9FE',
      50: '#E3F2FF',
      100: '#BEE3F8',
      200: '#90CDF4',
      300: '#63B3ED',
      400: '#00ABE9',
      500: '#3182CE',
      600: '#0083B3',
      700: '#2B6CB0',
      800: '#2C5282',
      900: '#01455E',
    },

    green: {
      light: '#A4FFBD',
      400: '#25BF6C',
      500: '#38A56A',
    },
    red: {
      light: '#FFBEBE',
      light2: '#FFE7DC',
    },

    gray: {
      default: '#A4A4A4',
      light: '#F5F5F5',
      light2: '#FAFAFA',
      light3: '#F9F9F9',
      dark: '#3A3A3A',
      100: '#EDF2F7',
      200: '#E2E8F0',
      250: '#EBEBEB',
      300: '#CBD5E0',
      350: '#C4C4C4',
      400: '#A0AEC0',
      500: '#718096',
      600: '#606060',
      700: '#4A5568',
      800: '#2D3748',
      900: '#1A202C',
    },

    success: '#25BF6C',
    danger: '#CD0000',
  },
  components: {
    Button,
    Link,
  },
  config: {
    useSystemColorMode: true,
    initialColorMode: 'system',
  },
});

export default theme;
