const arrowDown = ({
  width, height, style, color, className,
}) => (
  <svg
    style={style}
    width={width || '20px'}
    height={height || '19px'}
    viewBox="0 0 24 24"
    focusable="false"
    className={className || 'arrow-down-icon-rounded'}
  >
    <path
      fill={color || '#0097CF'}
      d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
    />
  </svg>
);

export default arrowDown;
