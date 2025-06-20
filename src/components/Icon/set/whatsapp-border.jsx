const whatsappBorder = ({ width, height, style, color = '#25BF6C' }) => (
  <svg
    width={width || '48'}
    height={height || '48'}
    style={style}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    pointerEvents="none"
  >
    {/* Círculo exterior con piquito */}
    <path
      d="M24 6c-9.94 0-18 8.06-18 18 0 2.7.62 5.27 1.8 7.6L6 42l10.4-2.75A18 18 0 1 0 24 6z"
      fill="none"
      stroke={color}
      strokeWidth="4"
    />
    {/* Teléfono redimensionado y centrado */}
    <g transform="translate(10, 9) scale(2.2)">
      <path
        d="M4.56 3.73C4.68 3.73 4.79 3.73 4.9 3.74C5 3.74 5.15 3.7 5.29 4.04C5.43 4.38 5.78 5.24 5.82 5.32C5.87 5.41 5.9 5.51 5.84 5.63C5.78 5.74 5.75 5.82 5.66 5.92C5.58 6.02 5.48 6.14 5.4 6.22C5.32 6.31 5.23 6.4 5.33 6.57C5.43 6.75 5.78 7.32 6.3 7.78C6.96 8.37 7.52 8.55 7.7 8.64C7.87 8.72 7.97 8.71 8.07 8.59C8.18 8.48 8.51 8.09 8.63 7.91C8.74 7.74 8.86 7.77 9.02 7.83C9.18 7.88 10.03 8.3 10.21 8.39C10.38 8.48 10.5 8.52 10.54 8.59C10.58 8.66 10.58 9.01 10.44 9.42C10.29 9.82 9.6 10.19 9.26 10.24C8.96 10.29 8.58 10.3 8.17 10.17C7.91 10.09 7.59 9.99 7.17 9.81C5.43 9.06 4.29 7.31 4.2 7.19C4.11 7.07 3.49 6.25 3.49 5.4C3.49 4.54 3.94 4.12 4.1 3.95C4.26 3.78 4.45 3.73 4.56 3.73Z"
        stroke={color}
        strokeWidth="0.6"
        fill={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

export default whatsappBorder;
