const certificate = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '24px'}
    height={height || '24px'}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 16.5H0.5V0.5H23.5V9" stroke={color || '#0097CF'} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21.5 17V23.5L18.5 21L15.5 23.5V17" stroke={color || '#0097CF'} strokeLinejoin="round" />
    <path d="M18.5 15.5C19.3284 15.5 20 14.8284 20 14C20 13.1716 19.3284 12.5 18.5 12.5C17.6716 12.5 17 13.1716 17 14C17 14.8284 17.6716 15.5 18.5 15.5Z" stroke={color || '#0097CF'} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22.22 14C22.72 13.38 22.82 12.49 22.4 11.75C21.98 11.01 21.15 10.66 20.36 10.78C20.07 10.03 19.35 9.5 18.5 9.5C17.65 9.5 16.93 10.03 16.64 10.78C15.85 10.66 15.03 11.02 14.6 11.75C14.18 12.49 14.27 13.38 14.78 14C14.28 14.62 14.18 15.51 14.6 16.25C15.02 16.99 15.85 17.34 16.64 17.22C16.93 17.97 17.65 18.5 18.5 18.5C19.35 18.5 20.07 17.97 20.36 17.22C21.15 17.34 21.97 16.98 22.4 16.25C22.82 15.51 22.73 14.62 22.22 14Z" stroke={color || '#0097CF'} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21.5 8V5.5C19.84 5.5 18.5 4.16 18.5 2.5H5.5C5.5 4.16 4.16 5.5 2.5 5.5V11.5C4.16 11.5 5.5 12.84 5.5 14.5H12" stroke={color || '#0097CF'} strokeLinecap="round" strokeLinejoin="round" />
  </svg>

);

export default certificate;
