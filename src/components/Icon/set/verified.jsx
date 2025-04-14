const verify = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '27px'}
    height={height || '27px'}
    viewBox="0 0 27 27"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="13.5" cy="13.5" r="13.5" fill={color || '#25BF6C'} />
    <path
      d="M19 10L10.75 18L8 15.1429"
      stroke="white"
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default verify;
