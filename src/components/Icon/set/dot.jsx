const dot = ({
  width, height, style, color,
}) => (
  <svg
    width={width || '8px'}
    height={height || '8px'}
    style={style}
    viewBox="0 0 8 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="4" cy="4" r="4" fill={color || '#DADADA'} />
  </svg>
);

export default dot;
