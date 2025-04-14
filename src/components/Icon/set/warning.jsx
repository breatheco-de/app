import { useColorModeValue } from '@chakra-ui/react';

const warning = ({
  width, height, style, color, full, secondColor,
}) => {
  const strokeColor = useColorModeValue('#FFFFFF', '#17202A');

  return (
    <svg
      style={style}
      width={width || '25px'}
      height={height || '25px'}
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M24 24H1L12.5 1L24 24Z" fill={secondColor || '#FFB718'} stroke={color || '#FFB718'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 17.0043V8.99609" stroke={full ? color || '#000' : strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.0232 20.3372C13.0232 20.6299 12.7932 20.8599 12.5005 20.8599C12.2078 20.8599 11.9778 20.6299 11.9778 20.3372C11.9778 20.0445 12.2078 19.8145 12.5005 19.8145C12.7932 19.8145 13.0232 20.0445 13.0232 20.3372Z" fill="white" stroke={full ? color || '#000' : strokeColor} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
};

export default warning;
