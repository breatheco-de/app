const student = ({ width, height, style, color }) => (
  <svg
    width={width || '25'}
    height={height || '20'}
    style={style}
    viewBox="0 0 25 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.4944 14.7705H2.50658M22.4944 14.7705V1.93206C22.4944 1.41691 22.077 1 21.5623 1H3.43864C2.92397 1 2.50658 1.41739 2.50658 1.93206V14.7705M22.4944 14.7705L23.9013 17.2116C23.966 17.3237 24 17.4509 24 17.5803C24 17.7098 23.9659 17.8369 23.9011 17.949C23.8364 18.0611 23.7433 18.1541 23.6312 18.2189C23.5191 18.2836 23.3925 18.3176 23.263 18.3176H1.73745C1.60802 18.3176 1.48087 18.2836 1.36878 18.2189C1.25669 18.1541 1.1636 18.0611 1.09886 17.949C1.03413 17.8369 1.00003 17.7098 1 17.5803C0.999966 17.4509 1.03399 17.3237 1.09867 17.2116L2.50658 14.7705M12.8201 16.5441H12.1808"
      stroke={color || '#0097CF'}
      strokeWidth="1.4"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.7886 11.8047L7.17822 8.19434L10.7886 4.58398M14.213 11.8047L17.8234 8.19434L14.213 4.58398"
      stroke={color || '#0097CF'}
      strokeWidth="1.4"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default student;
