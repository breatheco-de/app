import { useColorMode } from '@chakra-ui/react';

const hamburguer = ({
  width, height, style, color,
}) => {
  const { colorMode } = useColorMode();
  return (
    <svg
      width={width || '28px'}
      height={height || '24px'}
      style={style}
      viewBox="0 0 28 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        stroke={colorMode === 'light' ? color || '#000000' : '#FFFFFF'}
        x1="1.5"
        y1="1.5"
        x2="26.5"
        y2="1.5"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        stroke={colorMode === 'light' ? color || '#000000' : '#FFFFFF'}
        x1="1.5"
        y1="12"
        x2="16.5645"
        y2="12"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        stroke={colorMode === 'light' ? color || '#000000' : '#FFFFFF'}
        x1="1.5"
        y1="22.5"
        x2="26.5"
        y2="22.5"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default hamburguer;
