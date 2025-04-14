const unchecked = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '27px'}
    height={height || '27px'}
    viewBox="0 0 27 27"
    fill="white"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="13.5" cy="13.5" r="13" stroke={color || '#C4C4C4'} />
  </svg>
);

export default unchecked;
