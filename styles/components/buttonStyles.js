/* eslint-disable no-dupe-keys */
// For more info https://chakra-ui.com/docs/features/style-props
const ButtonStyles = {
  // style object for base or default style
  baseStyle: {},
  // styles for diferent sizes ("sm", "mg", "lg")
  sizes: {},
  // styles for different visual variants ("outline", "solid", more...)
  variants: {
    switch: (props) => ({
      bg: 'primary',
      color: 'white',
      _hover: {
        bg: props.colorMode === 'dark' ? 'teal.500' : 'blue.700',
      },
    }),
    switchOutline: (props) => ({
      border: '2px solid',
      color: props.colorMode === 'dark' ? 'green.300' : 'green.500',
      borderColor: 'teal.500',
      _hover: {
        borderColor: props.colorMode === 'dark' ? 'teal.400' : 'green.300',
      },
    }),
  },
  // default values for `size`, and `variant`
  defaultProps: {},
};
export default ButtonStyles;
