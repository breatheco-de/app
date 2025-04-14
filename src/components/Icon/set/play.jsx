const play = ({ color, width, height, style }) => (
  <svg
    style={style}
    width={width || '24px'}
    height={height || '24px'}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 5.65537C5 4.48811 6.27454 3.76814 7.27427 4.37066L17.8017 10.7153C18.7693 11.2985 18.7693 12.7015 17.8017 13.2847L7.27427 19.6293C6.27454 20.2319 5 19.5119 5 18.3446V5.65537Z"
      stroke={color || '#14142B'}
      strokeWidth="2"
      strokeLinecap="round"
      transform="translate(1, 0)"
      strokeLinejoin="round"
    />
  </svg>
);

export default play;
