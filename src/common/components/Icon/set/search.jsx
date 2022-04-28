const search = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '20px'}
    height={height || '20px'}
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.68 12.36C9.81698 12.36 12.36 9.81698 12.36 6.68C12.36 3.54302 9.81698 1 6.68 1C3.54302 1 1 3.54302 1 6.68C1 9.81698 3.54302 12.36 6.68 12.36Z"
      stroke={color || '#0097CF'}
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinejoin="round"
    />
    <path
      d="M10.7 10.7L17.34 17.34"
      stroke={color || '#0097CF'}
      strokeWidth="2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default search;
