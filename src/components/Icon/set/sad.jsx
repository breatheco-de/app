const sad = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '24'}
    height={height || '24'}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path stroke={color || '#CD0000'} d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path stroke={color || '#CD0000'} d="M10 8C10 8.53043 9.78929 9.03914 9.41421 9.41421C9.03914 9.78929 8.53043 10 8 10C7.46957 10 6.96086 9.78929 6.58579 9.41421C6.21071 9.03914 6 8.53043 6 8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path stroke={color || '#CD0000'} d="M7 18C7 16.9391 7.52678 15.9217 8.46447 15.1716C9.40215 14.4214 10.6739 14 12 14C13.3261 14 14.5979 14.4214 15.5355 15.1716C16.4732 15.9217 17 16.9391 17 18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path stroke={color || '#CD0000'} d="M14 8C14 8.53043 14.2107 9.03914 14.5858 9.41421C14.9609 9.78929 15.4696 10 16 10C16.5304 10 17.0391 9.78929 17.4142 9.41421C17.7893 9.03914 18 8.53043 18 8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>

);

export default sad;
