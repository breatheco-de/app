const arrowUp = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '20px'}
    height={height || '19px'}
    viewBox="0 0 17 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 9L8.5 1.5L1 9" stroke={color || '#0097CF'} strokeWidth="2" />
  </svg>

);

export default arrowUp;
