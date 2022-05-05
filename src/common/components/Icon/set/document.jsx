const document = ({
  width, height, style, color,
}) => (
  <svg
    width={width || '24px'}
    height={height || '24px'}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    clipRule="evenodd"
  >
    <path
      fill={color || '#fff'}
      d="M22 24h-20v-24h14l6 6v18zm-7-23h-12v22h18v-16h-6v-6zm3 15v1h-12v-1h12zm0-3v1h-12v-1h12zm0-3v1h-12v-1h12zm-2-4h4.586l-4.586-4.586v4.586z"
    />
  </svg>
);

export default document;
