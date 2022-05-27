/* eslint-disable no-dupe-keys */
// For more info https://chakra-ui.com/docs/features/style-props
const LinkStyles = {
  // style object for base or default style
  baseStyle: {},
  // styles for diferent sizes ("sm", "mg", "lg")
  sizes: {},
  // styles for different visual variants ("outline", "solid", more...)
  variants: {
    buttonDefault: () => ({
      bg: 'blue.default',
      color: 'white',
      padding: '12px 24px',
      cursor: 'pointer',
      border: '0',
      borderRadius: '3px',
      fontSize: '13px',
      letterSpacing: '0.05em',
      _hover: {
        bg: '#00A0DA',
        opacity: 1,
        textDecoration: 'none',
        _disabled: {
          bgColor: '#EBEBEB',
        },
      },
      _active: {
        bg: 'blue.default',
      },
      _disabled: {
        bg: '#EBEBEB',
        color: 'gray.dark',
        opacity: 1,
        _hover: {
          opacity: 0.7,
        },
      },
    }),
  },
  // default values for `size`, and `variant`
  defaultProps: {},
};
export default LinkStyles;
