const chronometer = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '22px'}
    height={height || '25px'}
    viewBox="0 0 22 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke={color || '#0097CD'}
  >
    <path d="M10 1H12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 1V4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 4L20.5 5.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.7503 4.75L17.8203 6.68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 14H6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 9L7.5 10.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 19L7.5 17.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 14H16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 21V19" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 7V9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 19L14.5 17.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 9L14.5 10.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 24C16.5228 24 21 19.5228 21 14C21 8.47715 16.5228 4 11 4C5.47715 4 1 8.47715 1 14C1 19.5228 5.47715 24 11 24Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>

);

export default chronometer;
