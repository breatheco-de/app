import { useColorMode } from '@chakra-ui/react';

const homeFilled = ({
  width, height, style, color, fill,
}) => {
  const { colorMode } = useColorMode();
  return (
    <svg
      style={style}
      width={width || '20px'}
      height={height || '19px'}
      viewBox="0 0 18 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3 8V16H7.23529V10.4H10.7647V16H15V8.4" fill={colorMode === 'light' ? fill || '#0097CF' : '#FFFFFF'} />
      <path d="M3 8V16H7.23529V10.4H10.7647V16H15V8.4" stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 9L9.14583 1L17.2917 9" fill={colorMode === 'light' ? fill || '#0097CF' : '#FFFFFF'} />
      <path d="M1 9L9.14583 1L17.2917 9" stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 3H13.9792V5.43478" fill={colorMode === 'light' ? fill || '#0097CF' : '#FFFFFF'} />
      <path d="M11.5 3H13.9792V5.43478" stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="3.10379" y1="7.49616" x2="3.11908" y2="9.4961" stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'} strokeLinecap="round" />
      <line x1="1" y1="9" x2="3" y2="9" stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'} strokeLinecap="round" />
      <line x1="15.2" y1="9" x2="17.2" y2="9" stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'} strokeLinecap="round" />
      <line x1="15.1538" y1="7.49616" x2="15.1691" y2="9.4961" stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'} strokeLinecap="round" />
    </svg>
  );
};
export default homeFilled;
