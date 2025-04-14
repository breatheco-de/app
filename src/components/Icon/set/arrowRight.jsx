const arrowRight = ({
  style, width, height, color,
}) => (
  <svg
    style={style}
    width={width || '20px'}
    height={height || '20px'}
    viewBox="0 0 8 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0.999999 1L7 7L1 13"
      stroke={color || '#0097CF'}
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default arrowRight;
