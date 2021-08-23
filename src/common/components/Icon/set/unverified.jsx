import { useColorMode } from '@chakra-ui/react';

const unverify = ({ width, height, style }) => {
  const { colorMode } = useColorMode();
  return (
    <svg
      style={style}
      width={width || '27px'}
      height={height || '27px'}
      viewBox="0 0 27 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="13.5" cy="13.5" r="13" stroke="#C4C4C4" fill={colorMode === 'light' ? 'white' : 'darkTheme'} />
    </svg>
  );
};

export default unverify;
