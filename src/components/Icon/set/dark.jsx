const dark = ({
  width, height, style, color, strokeWidth,
}) => (
  <svg
    style={style}
    width={width || '20px'}
    height={height || '20px'}
    viewBox="0 0 27 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.7375 6.715L26 5.5L22.7375 4.2625L21.5 1L20.2625 4.2625L17 5.5L20.2625 6.715L21.5 10L22.7375 6.715Z"
      stroke={color || '#fff'}
      strokeWidth={strokeWidth || '1.5'}
      strokeMiterlimit="10"
      strokeLinejoin="round"
    />
    <path
      d="M20.8437 16.5839C13.9645 16.5839 9.05773 9.73632 11.0661 3C5.4979 3.07416 1 7.74632 1 13.4938C1 19.2908 5.58208 24 11.2225 24C15.8286 24 19.7132 20.8729 21 16.5715C20.9399 16.5715 20.8918 16.5839 20.8437 16.5839Z"
      stroke={color || '#fff'}
      strokeWidth={strokeWidth || '1.5'}
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default dark;
