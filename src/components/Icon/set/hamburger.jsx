import { useColorMode } from '@chakra-ui/react';

const hamburguer = ({
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
      aria-hidden="true"
    >
      <path
        fill={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'}
        d="M 3 5 A 1.0001 1.0001 0 1 0 3 7 L 21 7 A 1.0001 1.0001 0 1 0 21 5 L 3 5 z M 3 11 A 1.0001 1.0001 0 1 0 3 13 L 21 13 A 1.0001 1.0001 0 1 0 21 11 L 3 11 z M 3 17 A 1.0001 1.0001 0 1 0 3 19 L 21 19 A 1.0001 1.0001 0 1 0 21 17 L 3 17 z"
      />
    </svg>
  );
};

export default hamburguer;
