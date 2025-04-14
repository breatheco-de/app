const cursorTooltip = ({
  width, height, style, color, text,
}) => (
  <svg
    width={width || '30px'}
    height={height || '28px'}
    style={style}
    viewBox="0 0 30 27"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.62271 23.5028L4.75549 21.4208L6.30556 25.0168L6.49903 25.4656L6.95215 25.2824L8.5645 24.6305L9.03786 24.4391L8.83659 23.9699L7.29691 20.3803L10.2419 20.3769L11.4798 20.3755L10.5881 19.5168L2.62028 11.843L1.77344 11.0274V12.2031V23.145V24.3318L2.62271 23.5028Z"
      fill="black"
      stroke={color || '#25BF6C'}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 0C0.895431 0 0 0.895431 0 2V9C0 10.1046 0.89543 11 2 11H7.25293V13.3199L9.57279 11H28C29.1046 11 30 10.1046 30 9V2C30 0.895431 29.1046 0 28 0H2Z"
      fill={color || '#25BF6C'}
    />
    {/* Text */}
    <text x="4" y="8.98" fill="white" fontWeight={700} fontSize="9.2px">{text || 'You'}</text>
  </svg>
);

export default cursorTooltip;
