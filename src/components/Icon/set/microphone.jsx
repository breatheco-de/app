const microphone = ({ width, height, color }) => (
  <svg
    width={width || '24px'}
    height={height || '24px'}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="8" y="1" width="8" height="14" rx="4" stroke={color || '#14142B'} strokeWidth="2" />
    <path d="M4 9.5V11C4 15.4183 7.58172 19 12 19V19C16.4183 19 20 15.4183 20 11V9.5" stroke={color || '#14142B'} strokeWidth="2" strokeLinecap="round" />
    <path d="M12 19V23" stroke={color || '#14142B'} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 23H8" stroke={color || '#14142B'} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default microphone;
