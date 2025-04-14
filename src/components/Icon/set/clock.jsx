const clock = ({ color, width, height, style }) => (
  <svg
    style={style}
    width={width || '32px'}
    height={height || '32px'}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.988 4C9.364 4 4 9.376 4 16C4 22.624 9.364 28 15.988 28C22.624 28 28 22.624 28 16C28 9.376 22.624 4 15.988 4ZM16 25.6C10.696 25.6 6.4 21.304 6.4 16C6.4 10.696 10.696 6.4 16 6.4C21.304 6.4 25.6 10.696 25.6 16C25.6 21.304 21.304 25.6 16 25.6Z"
      fill={color || '#A9A9A9'}
    />
    <path
      d="M16.5969 10H14.7969V17.2L21.0969 20.98L21.9969 19.504L16.5969 16.3V10Z"
      fill={color || '#A9A9A9'}
    />
  </svg>
);

export default clock;
