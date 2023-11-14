// For more info https://chakra-ui.com/docs/features/style-props
const bgHoverButtonColor = (props) => {
  if (props?.outline) return 'transparent';
  return props?.colorScheme || '#00A0DA';
};

const bgButtonColor = (props) => {
  if (props?.outline) return 'transparent';
  return props?.colorScheme || 'blue.default';
};

const borderColor = (props) => {
  if (props?.outline) {
    if (props?.colorScheme) return props.colorScheme;
    return '#000000';
  }
  return 'transparent';
};
const buttonColor = (props) => {
  if (props?.outline) {
    if (props?.colorScheme) {
      return props.colorScheme;
    }
  }
  return 'white';
};

const activeBackgroundColor = (props) => {
  if (props?.outline) {
    if (props?.colorMode === 'light') {
      return 'gray.light';
    }
    return 'gray.700';
  }
  return 'blue.default';
};

const LinkStyles = {
  // style object for base or default style
  baseStyle: {},
  // styles for diferent sizes ("sm", "mg", "lg")
  sizes: {},
  // styles for different visual variants ("outline", "solid", more...)
  variants: {
    default: () => ({
      color: 'blue.default',
      fontSize: '15px',
      letterSpacing: '0.05em',
    }),
    buttonDefault: (props) => ({
      bg: bgButtonColor(props),
      color: buttonColor(props),
      fontWeight: '700',
      padding: '12px 24px',
      cursor: 'pointer',
      border: props.outline ? '1px solid' : '0',
      borderColor: borderColor(props),
      borderRadius: '3px',
      fontSize: '13px',
      letterSpacing: '0.05em',
      _hover: {
        bg: bgHoverButtonColor(props),
        opacity: 1,
        textDecoration: 'none',
        _disabled: {
          bgColor: '#EBEBEB',
        },
      },
      _active: {
        bg: activeBackgroundColor(props),
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
