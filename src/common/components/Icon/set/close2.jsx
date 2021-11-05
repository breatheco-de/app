import { useColorMode } from '@chakra-ui/react';

const close = ({
  width, height, style, color,
}) => {
  const { colorMode } = useColorMode();
  return (
    <svg
      width={width || '19px'}
      height={height || '4px'}
      style={style}
      viewBox="0 0 19 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        stroke={colorMode === 'light' ? color || '#000000' : '#FFFFFF'}
        x1="1.5"
        y1="2"
        x2="16.5645"
        y2="2"
        // stroke="black"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default close;
