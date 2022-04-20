const screen = ({
  width, height, style, color,
}) => (
  <svg
    width={width || '24px'}
    height={height || '24px'}
    style={style}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={color || '#000000'}
      d="M24 9h-2v-4h-4v-2h6v6zm-6 12v-2h4v-4h2v6h-6zm-18-6h2v4h4v2h-6v-6zm6-12v2h-4v4h-2v-6h6z"
    />
  </svg>
);

export default screen;
