/* eslint-disable no-nested-ternary */
/* eslint-disable no-dupe-keys */
// For more info https://chakra-ui.com/docs/features/style-props
const ButtonStyles = {
  // style object for base or default style
  baseStyle: {},
  // styles for diferent sizes ("sm", "mg", "lg")
  sizes: {},
  // styles for different visual variants ("outline", "solid", more...)
  variants: {
    default: (props) => ({
      bg: props?.background ? props?.background : 'blue.default',
      color: 'white',
      border: '0',
      height: props.height || '40px',
      borderRadius: '4px',
      fontSize: '13px',
      letterSpacing: '0.05em',
      opacity: 1,
      _hover: {
        bg: props?.background ? props?.background : 'blue.default',
        opacity: 1,
        _disabled: {
          bgColor: '#EBEBEB',
        },
      },
      _active: {
        bg: props?.background ? props?.background : 'blue.default',
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
      borderRadius: '4px',
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
      height: props.height || '40px',
      borderRadius: '4px',
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
      color: props.color || props.colorMode === 'dark' ? 'white' : 'black',
      border: '1.5px solid',
      borderColor: props.borderColor || props.colorMode === 'dark' ? 'white' : 'black',
      height: props.height || '40px',
      borderRadius: '4px',
      fontSize: '13px',
      letterSpacing: '0.05em',
      _hover: {
        bg: 'transparent',
        // bg: props.background || props.withoutBg ? (props.colorMode === 'light' ? 'gray.light' : 'gray.700') : 'transparent',
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
      _active: {
        bg: 'transparent',
      },
    }),

    link: (props) => ({
      bg: 'none',
      color: 'blue.default',
      height: props.height || '40px',
      border: '0',
      borderRadius: '4px',
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
  // const AnimatedButton2 = ({
  //   children, onClick, toUppercase, rest,
  // }) => (
  //   <MotionBox
  //     as="button"
  //     whileHover={{ scale: 1.05 }}
  //     whileTap={{ scale: 1 }}
  //     background="blue.default"
  //     onClick={onClick}
  //     {...rest}
  //     fontSize="13px"
  //     m="20px 0"
  //     width="fit-content"
  //     letterSpacing="0.05em"
  //     textTransform={toUppercase ? 'uppercase' : ''}
  //     color="white"
  //     p="10px 16px"
  //     border="0"
  //     borderRadius="4px"
  //   >
  //     {children}
  //   </MotionBox>
  // );

};
export default ButtonStyles;
