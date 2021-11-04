import { useColorMode } from '@chakra-ui/react';

const setting = ({
  width, height, style, color,
}) => {
  const { colorMode } = useColorMode();
  return (
    <svg
      style={style}
      width={width || '17px'}
      height={height || '16px'}
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        stroke={colorMode === 'light' ? color || '#000000' : '#FFFFFF'}
        d="M8.41992 4.5C9.38642 4.5 10.1699 3.7165 10.1699 2.75C10.1699 1.7835 9.38642 1 8.41992 1C7.45342 1 6.66992 1.7835 6.66992 2.75C6.66992 3.7165 7.45342 4.5 8.41992 4.5Z"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.1699 2.75H15.8749"
        stroke={colorMode === 'light' ? color || '#000000' : '#FFFFFF'}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 2.75H6.67"
        stroke={colorMode === 'light' ? color || '#000000' : '#FFFFFF'}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.91992 9.75C5.88642 9.75 6.66992 8.9665 6.66992 8C6.66992 7.0335 5.88642 6.25 4.91992 6.25C3.95342 6.25 3.16992 7.0335 3.16992 8C3.16992 8.9665 3.95342 9.75 4.91992 9.75Z"
        stroke={colorMode === 'light' ? color || '#000000' : '#FFFFFF'}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.66992 8H15.8749"
        stroke={colorMode === 'light' ? color || '#000000' : '#FFFFFF'}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 8H3.17"
        stroke={colorMode === 'light' ? color || '#000000' : '#FFFFFF'}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.66992 15C7.63642 15 8.41992 14.2165 8.41992 13.25C8.41992 12.2835 7.63642 11.5 6.66992 11.5C5.70342 11.5 4.91992 12.2835 4.91992 13.25C4.91992 14.2165 5.70342 15 6.66992 15Z"
        stroke={colorMode === 'light' ? color || '#000000' : '#FFFFFF'}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.41992 13.25H15.8749"
        stroke={colorMode === 'light' ? color || '#000000' : '#FFFFFF'}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 13.25H4.92"
        stroke={colorMode === 'light' ? color || '#000000' : '#FFFFFF'}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default setting;
