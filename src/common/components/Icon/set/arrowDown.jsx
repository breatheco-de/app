import { useColorMode } from '@chakra-ui/react';

const arrowDown = ({
  width, height, style, color,
}) => {
  const { colorMode } = useColorMode();

  return (
    <svg
      width={width || '20px'}
      height={height || '19px'}
      style={style}
      viewBox="0 0 24 24"
      focusable="false"
      className="arrow-down-icon-rounded"
    >
      <path
        fill={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'}
        d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
      />
    </svg>
  );
};

export default arrowDown;
