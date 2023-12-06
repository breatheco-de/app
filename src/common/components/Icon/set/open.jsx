const open = ({
  width, height, style, color,
}) => (
  <svg
    width={width || '14'}
    height={height || '14'}
    style={style}
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.4444 12.4444H1.55556V1.55556H7V0H1.55556C0.696111 0 0 0.696111 0 1.55556V12.4444C0 13.3039 0.696111 14 1.55556 14H12.4444C13.3039 14 14 13.3039 14 12.4444V7H12.4444V12.4444ZM8.55556 0V1.55556H11.3439L3.69833 9.20111L4.79889 10.3017L12.4444 2.65611V5.44444H14V0H8.55556Z"
      fill={color || '#0097CF'}
    />
  </svg>
);

export default open;
