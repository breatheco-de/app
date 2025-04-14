const assignments = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '20px'}
    height={height || '19px'}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 9.47619V19H1V3H13.6316" stroke={color || '#A4A4A4'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.2311 9.88878L9 11L10.1116 8.76968L17.6404 1.24333C18.3815 0.502517 19.4931 1.62162 18.7599 2.35455L11.2311 9.88878Z" stroke={color || '#A4A4A4'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 2L18 3" stroke={color || '#A4A4A4'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>

);

export default assignments;
