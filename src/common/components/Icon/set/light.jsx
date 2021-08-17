import { useColorMode } from '@chakra-ui/react';

const light = ({
  width, height, style, color,
}) => {
  const { colorMode } = useColorMode();
  return (
    <svg
      style={style}
      width={width || '20px'}
      height={height || '20px'}
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.6363 13C20.6363 8.77819 17.2217 5.36365 12.9999 5.36365C8.77807 5.36365 5.36353 8.77819 5.36353 13C5.36353 17.2218 8.77807 20.6364 12.9999 20.6364C17.2217 20.6364 20.6363 17.2218 20.6363 13Z"
        stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 22.8182V25"
        stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.8181 13H24.9999"
        stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 3.18182V1"
        stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.18182 13H1"
        stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.06154 19.9383L4.51245 21.4874"
        stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.9385 19.9383L21.4876 21.4874"
        stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.9385 6.06179L21.4876 4.5127"
        stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.06154 6.06179L4.51245 4.5127"
        stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

  );
};

export default light;
