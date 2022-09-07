const copy = ({
  width, height, style, color,
}) => (
  <svg
    width={width || '40px'}
    height={height || '40px'}
    style={style}
    viewBox="0 0 86 657"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M56.7499 2C25.1268 40.0635 1.47328 65.9294 3.07693 120.948C4.68057 175.967 39.5441 223.604 56.7499 247.683C74.6238 279.402 105.597 354.087 56.7499 469.143C13.8523 570.184 38.8759 600.202 56.7499 656"
      stroke="url(#paint0_linear_3920_10096)"
      strokeWidth="6"
    />
    <defs>
      <linearGradient
        id="paint0_linear_3920_10096"
        x1="43"
        y1="2"
        x2="43"
        y2="656"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor={color || '#0097CF'} stopOpacity="0" />
        <stop offset="0.522687" stopColor={color || '#0097CF'} />
        <stop offset="1" stopColor={color || '#0097CF'} stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

export default copy;
