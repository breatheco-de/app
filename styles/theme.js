import { extendTheme } from '@chakra-ui/react';
import Button from './components/buttonStyles';

const CustomTheme = extendTheme({
  // Color scheme of Components
  colors: {
    primary: '#845EC2',
    secondary: '#FF6F91',
    highlight: '#00C9A7',
    warning: '#FFC75F',
    danger: '#C34A36',
  },
  components: {
    Button,
  },
});

export default CustomTheme;
