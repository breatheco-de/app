const shield = ({ color, width, height, style }) => (
  <svg
    style={style}
    width={width || '26px'}
    height={height || '24px'}
    viewBox="0 0 26 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Fondo del escudo */}
    <path
      d="M13 2L4 6V11C4 16.5 8 21.2 13 22C18 21.2 22 16.5 22 11V6L13 2Z"
      fill={color || '#00b765'}
    />
    {/* Check más grande y grueso */}
    <path
      d="M12 14L10 12L9 13L12 16L17 10L16 9L11 14Z"
      fill={color === '#ffffff' ? '#00b765' : '#ffffff'}
    />
  </svg>
);

export default shield;
