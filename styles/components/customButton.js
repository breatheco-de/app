/* eslint-disable no-dupe-keys */
// For more info https://chakra-ui.com/docs/features/style-props
const ButtonStyles = {
  // style object for base or default style
  baseStyle: {},
  // styles for diferent sizes ("sm", "mg", "lg")
  sizes: {},
  // styles for different visual variants ("outline", "solid", more...)
  variants: {
    default: () => ({
      bg: 'blue.default',
      color: 'white',
      border: '0',
      borderRadius: '3px',
      fontSize: '13px',
      letterSpacing: '0.05em',
      _hover: {
        bg: '#00A0DA',
        opacity: 1,
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
    danger: () => ({
      bg: 'danger',
      color: 'white',
      border: '0',
      borderRadius: '3px',
      fontSize: '13px',
      letterSpacing: '0.05em',
      _hover: {
        bg: '#d81111',
        opacity: 1,
        _disabled: {
          bgColor: '#EBEBEB',
        },
      },
      _active: {
        bg: 'danger',
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
    black: (props) => ({
      bg: props.colorMode === 'dark' ? 'featuredDark' : 'black',
      color: 'white',
      border: '0',
      borderRadius: '3px',
      fontSize: '13px',
      letterSpacing: '0.05em',
      _hover: {
        bg: props.colorMode === 'dark' ? 'featuredDark' : 'black',
        opacity: 1,
        _disabled: {
          bgColor: '#EBEBEB',
        },
      },
      // _active: {
      //   bg: 'blue',
      // },
      _disabled: {
        bg: '#EBEBEB',
        color: 'gray.dark',
        opacity: 1,
        _hover: {
          opacity: 0.7,
        },
      },
    }),

    outline: (props) => ({
      bg: 'none',
      color: props.colorMode === 'dark' ? 'white' : 'black',
      border: '1px solid',
      borderColor: props.borderColor || props.colorMode === 'dark' ? 'white' : 'black',
      borderRadius: '3px',
      fontSize: '13px',
      letterSpacing: '0.05em',
      _hover: {
        bg: props.colorMode === 'light' ? 'gray.light' : 'gray.700',
        opacity: 1,
        _disabled: {
          bg: '#EBEBEB',
        },
      },
      _disabled: {
        bg: '#EBEBEB',
        border: '1px solid',
        borderColor: props.borderColor || props.colorMode === 'dark' ? 'white' : 'black',
        color: 'gray.dark',
        opacity: 1,
        _hover: {
          opacity: 0.7,
        },
      },
    }),

    link: () => ({
      bg: 'none',
      color: 'blue.default',
      border: '0',
      borderRadius: '3px',
      fontSize: '13px',
      letterSpacing: '0.05em',
      _hover: {
        bg: 'none',
        textDecoration: 'underline',
        _disabled: {
          bgColor: 'none',
        },
      },
      _active: {
        color: 'blue.default',
      },
    }),
  },
  // default values for `size`, and `variant`
  defaultProps: {},
};
export default ButtonStyles;
