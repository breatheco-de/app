const arrowLeft3 = ({
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
      d="M7 1L1 7L7 13"
      stroke={color || '#0097CF'}
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default arrowLeft3;
