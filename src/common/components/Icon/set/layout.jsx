const layout = ({
  width, height, color, style,
}) => (
  <svg
    width={width || '14'}
    height={height || '14'}
    style={style}
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="0.5"
      y="0.5"
      width="5.26087"
      height="7.72839"
      rx="0.5"
      stroke={color || '#0097CF'}
    />
    <rect
      x="13.5"
      y="13.5"
      width="5.26087"
      height="7.7284"
      rx="0.5"
      transform="rotate(180 13.5 13.5)"
      stroke={color || '#0097CF'}
    />
    <rect
      x="0.5"
      y="10.8672"
      width="5.26087"
      height="2.62963"
      rx="0.5"
      stroke={color || '#0097CF'}
    />
    <rect
      x="13.5"
      y="3.13281"
      width="5.26087"
      height="2.62963"
      rx="0.5"
      transform="rotate(180 13.5 3.13281)"
      stroke={color || '#0097CF'}
    />
  </svg>

);

export default layout;
