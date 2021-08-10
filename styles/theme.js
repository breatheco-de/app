import { extendTheme } from '@chakra-ui/react';
import Button from './components/customButton';

const CustomTheme = extendTheme({
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
      100: '#FEFCBF',
      200: '#FAF089',
      300: '#F6E05E',
      400: '#ECC94B',
      500: '#e69e00',
      600: '#D69E2E',
    },
    lightYellow: '#FFF4DC',

    blue: {
      default: '#0097CD',
      100: '#BEE3F8',
      200: '#90CDF4',
      300: '#63B3ED',
      400: '#4299E1',
      500: '#3182CE',
      600: '#3182CE',
      700: '#2B6CB0',
      800: '#2C5282',
    },
    lightBlue: '#EEF9FE',

    lightGray: '#F5F5F5',
    gray: {
      default: '#A4A4A4',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
    },
    darkGray: '#3A3A3A',

    success: '#25BF6C',
    danger: '#CD0000',
  },
  components: {
    Button,
  },
});

export default CustomTheme;
