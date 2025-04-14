const longArrowRight = ({
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
    <path d="M12.48 9L16.48 5L12.48 1" stroke={color || 'gray'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M0.999981 5L16.48 5" stroke={color || 'gray'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>

);

export default longArrowRight;
