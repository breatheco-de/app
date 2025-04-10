const arrowRight = ({
  style, width, height, color,
}) => (
  <svg
    style={style}
    width={width || '18px'}
    height={height || '10px'}
    viewBox="0 0 18 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 1L1 5L5 9"
      stroke={color || '#0097CF'}
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.48 5L1 5"
      stroke={color || '#0097CF'}
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default arrowRight;
