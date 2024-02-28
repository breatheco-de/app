const comment = ({ width, height, color }) => (
  <svg
    width={width || '24px'}
    height={height || '24px'}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.5 22C18.299 22 23 17.299 23 11.5C23 5.70101 18.299 1 12.5 1C6.70101 1 2 5.70101 2 11.5C2 13.4585 2.53623 15.2918 3.46987 16.8611L2 21.9999L7.26547 20.6042C8.80638 21.4921 10.5939 22 12.5 22Z"
      stroke={color || '#FCFCFC'}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export default comment;
