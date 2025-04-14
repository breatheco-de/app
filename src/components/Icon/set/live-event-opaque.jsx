const liveEventOpaque = ({
  width, height, style,
}) => (
  <svg
    style={style}
    width={width || '60'}
    height={height || '60'}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="30" cy="29.5" r="30" fill="#FACFCB" fillOpacity="0.3" />
    <circle cx="30" cy="29.5" r="25" fill="#FBE9E8" />
    <circle cx="30" cy="29.5" r="24.5" stroke="#F16C60" strokeOpacity="0.3" />
    <circle cx="30" cy="29.5" r="22" fill="#EB3323" fillOpacity="0.8" />
    <path fillRule="evenodd" clipRule="evenodd" d="M19 20.5C18.4477 20.5 18 20.9477 18 21.5V38.5C18 39.0523 18.4477 39.5 19 39.5H36C36.5523 39.5 37 39.0523 37 38.5V33.4641L40.75 35.6292C41.4167 36.0141 42.25 35.5329 42.25 34.7631V25.2369C42.25 24.4671 41.4167 23.9859 40.75 24.3708L37 26.5359V21.5C37 20.9477 36.5523 20.5 36 20.5H19Z" fill="white" />
    <path d="M32.5 29.134C33.1667 29.5189 33.1667 30.4811 32.5 30.866L25.75 34.7631C25.0833 35.148 24.25 34.6669 24.25 33.8971L24.25 26.1029C24.25 25.3331 25.0833 24.852 25.75 25.2369L32.5 29.134Z" fill="#EB3323" fillOpacity="0.8" />
  </svg>

);

export default liveEventOpaque;
