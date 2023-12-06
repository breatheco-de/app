const externalLink = ({ width, height, color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width || '19px'}
    height={height || '18px'}
    viewBox="0 0 19 18"
    fill="none"
  >
    <path
      d="M14.8333 9.88889V15.2222C14.8333 15.6937 14.646 16.1459 14.3126 16.4793C13.9792 16.8127 13.5271 17 13.0556 17H3.27778C2.80628 17 2.3541 16.8127 2.0207 16.4793C1.6873 16.1459 1.5 15.6937 1.5 15.2222V5.44444C1.5 4.97295 1.6873 4.52076 2.0207 4.18737C2.3541 3.85397 2.80628 3.66667 3.27778 3.66667H8.61111M12.1667 1H17.5M17.5 1V6.33333M17.5 1L7.72222 10.7778"
      stroke={color || 'black'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default externalLink;
