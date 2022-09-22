/* eslint-disable react/style-prop-object */
const liveEvent = ({
  width, height, style,
}) => (
  <svg
    width={width || '60'}
    height={height || '61'}
    style={style}
    viewBox="0 0 60 61"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <mask id="mask0_3733_9487" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="60" height="61">
      <circle cx="30" cy="30.5" r="30" fill="#C4C4C4" />
    </mask>
    <g mask="url(#mask0_3733_9487)">
      <rect x="-8.25732" y="-3.90625" width="75.9633" height="71.5596" fill="url(#pattern0)" />
    </g>
    <defs>
      <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use xlinkHref="#image0_3733_9487" transform="translate(-0.000776387) scale(0.001294 0.00137363)" />
      </pattern>
    </defs>
  </svg>

);

export default liveEvent;
