const message = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '20px'}
    height={height || '19px'}
    viewBox="0 0 22 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0)">
      <path
        d="M7.79183 11.9318H6.87516L3.2085 15.75V11.9318H0.458496V0.477295H17.8752V6.68184"
        stroke={color || '#0097CF'}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.542 16.7045H15.5837L19.7087 20.5227V16.7045H21.542V9.06818H10.542V16.7045Z"
        stroke={color || '#0097CF'}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="22" height="21" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default message;
