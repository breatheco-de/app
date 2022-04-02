const logout = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '19px'}
    height={height || '19px'}
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 16V18H1V1H12V3.5" stroke={color || '#00ABE9'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 10H18" stroke={color || '#00ABE9'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 6L18 10L14 14" stroke={color || '#00ABE9'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default logout;
