import { useColorModeValue } from '@chakra-ui/react';

const checked = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '20px'}
    height={height || '19px'}
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="7.5" cy="7.5" r="7.5" fill={color || '#0097CF'} />
    <circle cx="7.5" cy="7.5" r="3.5" fill={useColorModeValue('#EEF9FE', '#17202A')} />
  </svg>

);

export default checked;
