const strength = ({
  width, height, style, color,
}) => (
  <svg
    width={width || '21px'}
    height={height || '18px'}
    style={style}
    viewBox="0 0 21 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.57548 4.55363L6.35229 2.33261L7.6849 3.22102L5.90809 5.88624L5.46389 10.1062C6.81426 8.56922 10.59 8.56922 11.4606 10.3816C11.9404 4.76684 19.7939 5.0689 19.7939 10.7902C19.7939 19.5322 1.03074 17.0269 1.03074 12.114C0.773099 10.7814 2.20343 5.54864 2.77201 3.46089C3.12738 2.11939 4.57548 1 4.57548 1H9.01751L9.46172 3.22102L8.67992 5.46869L5.90809 5.88624"
      // stroke="white"
      stroke={color || '#000'}
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default strength;
