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
        color: 'darkGray',
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
        color: 'darkGray',
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
      borderColor: props.colorMode === 'dark' ? 'white' : 'black',
      borderRadius: '3px',
      fontSize: '13px',
      letterSpacing: '0.05em',
      _hover: {
        bg: 'none',
        // border: '1px solid black',
        opacity: 1,
        _disabled: {
          bg: '#EBEBEB',
          border: 0,
        },
      },
      // _active: {
      //   bg: 'blue',
      // },
      _disabled: {
        bg: '#EBEBEB',
        border: 0,
        color: 'darkGray',
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
export default ButtonStyles;
