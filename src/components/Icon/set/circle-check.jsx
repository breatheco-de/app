import CustomTheme from '../../../../styles/theme';

const circleChecked = ({
  width, height, style, color,
}) => (
  <svg
    width={width || '104'}
    height={height || '104'}
    style={style}
    viewBox="0 0 104 104"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="52" cy="52" r="48" stroke={color || CustomTheme.colors.success} strokeWidth="8" />
    <path d="M29.8724 53.1065L44.2554 67.4895L74.1277 37.6172" stroke={color || CustomTheme.colors.success} strokeWidth="8" />
  </svg>
);

export default circleChecked;
