import { useColorModeValue } from '@chakra-ui/react';

const logout = ({
  width, height, style, color,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    style={style}
    width={width || '24px'}
    height={height || '24px'}
    viewBox="0 0 24 24"
    fill={useColorModeValue(`${color || '#0097CF'}`, 'white')}
  >
    <path d="M16 9v-4l8 7-8 7v-4h-8v-6h8zm-16-7v20h14v-2h-12v-16h12v-2h-14z" />
  </svg>
);

export default logout;
