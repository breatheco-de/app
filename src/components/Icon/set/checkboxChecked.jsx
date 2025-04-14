const checkboxChecked = ({
  width, height, style,
}) => (
  <svg
    width={width || '16px'}
    height={height || '17px'}
    style={style}
    viewBox="0 0 16 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.05953 10.9484L6.41304 11.2941L6.76264 10.9445L12.3536 5.35355L11.6464 4.64645L6.40514 9.88775L4.84956 8.36674L4.15044 9.08175L6.05953 10.9484ZM2 1H14C14.8284 1 15.5 1.67157 15.5 2.5V14.5C15.5 15.3284 14.8284 16 14 16H2C1.17157 16 0.5 15.3284 0.5 14.5V2.5C0.5 1.67157 1.17157 1 2 1Z"
      fill="#EEF9FE"
      stroke="#0097CF"
    />
  </svg>
);

export default checkboxChecked;
