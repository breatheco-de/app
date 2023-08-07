const collab = ({
  width, height, style, color,
}) => (
  <svg
    width={width || '17px'}
    height={height || '15px'}
    style={style}
    viewBox="0 0 17 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="8.5"
      cy="8.40625"
      r="5.69375"
      stroke={color || '#606060'}
      strokeWidth="1.3"
    />
    <circle
      cx="8.5"
      cy="2.96875"
      r="2.06875"
      fill="white"
      stroke={color || '#606060'}
      strokeWidth="1.3"
    />
    <circle
      cx="3.0625"
      cy="12.0312"
      r="2.06875"
      fill="white"
      stroke={color || '#606060'}
      strokeWidth="1.3"
    />
    <circle
      cx="13.9375"
      cy="12.0312"
      r="2.06875"
      fill="white"
      stroke={color || '#606060'}
      strokeWidth="1.3"
    />
  </svg>
);

export default collab;
