const verified2 = ({ width, height, color }) => (
  <svg
    width={width || '10'}
    height={height || '8'}
    viewBox="0 0 10 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.25065 0.570461C9.58312 0.924826 9.58312 1.49936 9.25064 1.85373L4.38578 7.03891C4.05331 7.39327 3.51428 7.39328 3.1818 7.03893L0.749369 4.44645C0.416888 4.09209 0.416876 3.51756 0.749342 3.16318C1.08181 2.80881 1.62085 2.8088 1.95333 3.16316L3.78377 5.11403L8.04665 0.570461C8.37913 0.216096 8.91817 0.216096 9.25065 0.570461Z"
      fill={color || 'white'}
    />
  </svg>
);

export default verified2;
