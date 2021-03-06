import { useColorMode } from '@chakra-ui/react';

const bell = (props) => {
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
      viewBox="0 0 26 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.9091 17.7273V11.9773C21.9091 8.16136 19.4941 4.91 16.1173 3.65545C15.8873 2.15 14.5909 1 13.0227 1C11.4545 1 10.1582 2.15 9.92818 3.65545C6.55136 4.91 4.13636 8.16136 4.13636 11.9773V17.7273C4.13636 19.4627 2.73545 20.8636 1 20.8636H25.0455C23.31 20.8636 21.9091 19.4627 21.9091 17.7273Z"
        stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.159 20.8637C16.159 22.5991 14.758 24 13.0226 24C11.2871 24 9.88623 22.5991 9.88623 20.8637"
        stroke={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default bell;
