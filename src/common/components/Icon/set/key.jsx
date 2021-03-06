const key = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '20px'}
    height={height || '19px'}
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M4.69392 15.4133C5.30625 15.4133 5.80264 14.9169 5.80264 14.3046C5.80264 13.6923 5.30625 13.1959 4.69392 13.1959C4.08159 13.1959 3.58521 13.6923 3.58521 14.3046C3.58521 14.9169 4.08159 15.4133 4.69392 15.4133Z" stroke={color || '#0097CF'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.781 1L8.55221 8.22883C6.60087 7.21621 4.14691 7.53404 2.5134 9.16755C0.495534 11.1854 0.495534 14.4598 2.5134 16.4851C4.53126 18.5103 7.81307 18.5029 9.83093 16.4851C11.4644 14.8516 11.7749 12.3976 10.7696 10.4463L13.194 8.02187H14.3028V6.91316L14.6723 6.54358H15.781V5.43487L16.1506 5.0653H17.2593V3.95658L17.9985 3.21743V1H15.781Z" stroke={color || '#0097CF'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default key;
