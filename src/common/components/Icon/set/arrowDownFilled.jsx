const arrowDownFilled = (props) => {
  const { width, height, style, color } = props;
  return (
    <svg
      width={width || '11px'}
      height={height || '9px'}
      style={style}
      viewBox="0 0 11 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.36603 8.5C5.98113 9.16667 5.01888 9.16667 4.63397 8.5L0.736861 1.75C0.35196 1.08333 0.833086 0.25 1.60289 0.25L9.39711 0.249999C10.1669 0.249999 10.648 1.08333 10.2631 1.75L6.36603 8.5Z"
        fill={color || 'white'}
      />
    </svg>
  );
};

export default arrowDownFilled;
