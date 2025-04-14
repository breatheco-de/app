const checked2 = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '13px'}
    height={height || '10px'}
    viewBox="0 0 13 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 1L3.75 9L1 6.14286"
      stroke={color || 'white'}
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default checked2;
