const book = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '20px'}
    height={height || '19px'}
    viewBox="0 0 20 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 6.01854L19 2.16998V14.1005L10 17.9491L1 14.1005V2.16998L10 6.01854Z"
      stroke={color || '#0097CF'}
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.1998 1L9.9998 4.11733L2.7998 1"
      stroke={color || '#0097CF'}
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 6.01849V17.949"
      stroke={color || '#0097CF'}
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default book;
