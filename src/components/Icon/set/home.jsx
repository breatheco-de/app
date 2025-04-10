const home = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '20px'}
    height={height || '19px'}
    viewBox="0 0 17 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.479 8.69568V15.6522H6.729V10.7826H10.2707V15.6522H14.5207V9.0435"
      stroke={color || '#0097CF'}
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M0.354004 8.34784L8.49984 0.347839L16.6457 8.34784"
      stroke={color || '#0097CF'}
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.333 1.04349H13.8122V3.47827"
      stroke={color || '#0097CF'}
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default home;
