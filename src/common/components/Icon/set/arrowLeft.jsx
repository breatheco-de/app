import { useColorMode } from '@chakra-ui/react';

const arrowLeft = (props) => {
  const {
    width,
    height,
    style,
    color,
  } = props;
  const { colorMode } = useColorMode();
  return (
    <svg
      style={style}
      width={width || '20px'}
      height={height || '20px'}
      viewBox="0 0 17 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 1L1 5L5 9" stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.48 5H1" stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default arrowLeft;
