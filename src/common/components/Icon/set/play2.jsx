const play2 = ({ color, width, height, style = {} }) => (
  <svg
    style={style}
    width={width || '100px'}
    height={height || '100px'}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="100" cy="100" r="90" fill="none" stroke={color || '#E74C3C'} strokeWidth="10" />

    <path d="M80,70 L80,130 Q80,140 90,135 L130,105 Q135,100 130,95 L90,65 Q80,60 80,70 Z" fill={color || '#E74C3C'} />
  </svg>
);

export default play2;
