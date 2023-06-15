const calendar = ({
  width, height, style, color,
}) => (
  <svg
    width={width || '20px'}
    height={height || '20px'}
    viewBox="0 0 20 20"
    style={style}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.13043 2.56543H1V19.0002H19V2.56543H15.8696"
      stroke={color || '#3A3A3A'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.47826 1H4.13043V4.13043H6.47826V1Z"
      stroke={color || '#3A3A3A'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.8696 1H13.5217V4.13043H15.8696V1Z"
      stroke={color || '#3A3A3A'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.47827 2.56543H13.5218"
      stroke={color || '#3A3A3A'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 6.47803H19"
      stroke={color || '#3A3A3A'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.69568 8.04346V17.4348"
      stroke={color || '#3A3A3A'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.6087 8.04346V17.4348"
      stroke={color || '#3A3A3A'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.5217 8.04346V17.4348"
      stroke={color || '#3A3A3A'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.56525 9.60889H17.4348"
      stroke={color || '#3A3A3A'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.56525 12.7393H17.4348"
      stroke={color || '#3A3A3A'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.56525 15.8696H17.4348"
      stroke={color || '#3A3A3A'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default calendar;
