const size = {
  // mobileS: '320px', is the default size
  mobileM: '375px',
  mobileL: '425px',
  tablet: '768px',
  laptop: '1024px',
  laptopL: '1440px',
  desktop: '2560px',
};
const Devices = {
  xs: `(min-width: ${size.mobileM})`,
  sm: `(min-width: ${size.mobileL})`,
  tablet: `(min-width: ${size.tablet})`,
  md: `(min-width: ${size.laptop})`,
  lg: `(min-width: ${size.laptopL})`,
  xl: `(min-width: ${size.desktop})`,
};

export default Devices;
