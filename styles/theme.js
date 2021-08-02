import { extendTheme } from '@chakra-ui/react';
import Button from './components/customButton';

const CustomTheme = extendTheme({
  // Color scheme of Components
  colors: {
    white: '#FFFFFF',
    featuredLight: '#EEF9FE',

    darkTheme: '#17202A',
    featuredDark: '#283340',

    black: '#000000',
    yellow: '#FFB718',
    lightYellow: '#FFF4DC',

    blue: '#0097CD',
    lightBlue: '#EEF9FE',

    lightGray: '#F5F5F5',
    gray: '#A4A4A4',
    darkGray: '#3A3A3A',

    success: '#25BF6C',
    danger: '#CD0000',
  },
  components: {
    Button,
  },
});

export default CustomTheme;
