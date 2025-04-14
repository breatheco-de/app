/* eslint-disable no-restricted-exports */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/prop-types */
import React, { cloneElement, forwardRef } from 'react';
import ReactSelect, { components as selectComponents } from 'react-select';
import AsyncReactSelect from 'react-select/async';
import CreatableReactSelect from 'react-select/creatable';
import {
  Flex,
  Tag,
  TagCloseButton,
  TagLabel,
  Divider,
  CloseButton,
  Center,
  Box,
  Portal,
  StylesProvider,
  useMultiStyleConfig,
  useStyles,
  useTheme,
  useColorModeValue,
  useFormControl,
} from '@chakra-ui/react';
import Icon from './Icon';

// Custom styles for components which do not have a chakra equivalent
const chakraStyles = {
  // When disabled, react-select sets the pointer-state to none
  // which prevents the `not-allowed` cursor style from chakra
  // from getting applied to the Control
  container: (provided) => ({
    ...provided,
    pointerEvents: 'auto',
    minWidth: '220px',
  }),
  input: (provided, { selectProps: { color, fontSize, fontWeight } }) => ({
    ...provided,
    fontSize: fontSize || '15px',
    fontWeight: fontWeight || 'normal',
    color: color || 'inherit',
    lineHeight: 1,
  }),
  menu: (provided) => ({
    ...provided,
    boxShadow: 'none',
  }),
  singleValue: (provided, { selectProps: { color, fontSize, fontWeight } }) => ({
    ...provided,
    fontSize: fontSize || '15px',
    fontWeight: fontWeight || 'normal',
    color: color || 'inherit',
  }),
  valueContainer: (provided, { selectProps: { size, unstyled } }) => {
    const px = {
      sm: '0.75rem',
      md: '1rem',
      lg: '1rem',
    };

    return {
      ...provided,
      padding: unstyled ? '0' : `0.125rem ${px[size]}`,
    };
  },
  loadingMessage: (provided, { selectProps: { size } }) => {
    const fontSizes = {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
    };

    const paddings = {
      sm: '6px 9px',
      md: '8px 12px',
      lg: '10px 15px',
    };

    return {
      ...provided,
      fontSize: fontSizes[size],
      padding: paddings[size],
    };
  },
  // Add the chakra style for when a TagCloseButton has focus
  multiValueRemove: (
    provided,
    { isFocused, selectProps: { multiValueRemoveFocusStyle } },
  ) => (isFocused ? multiValueRemoveFocusStyle : {}),
  control: () => ({}),
  menuList: () => ({}),
  option: () => ({}),
  multiValue: (provided, { selectProps: { color, fontSize } }) => ({
    ...provided,
    fontSize: fontSize || '15px',
    color: color || 'inherit',
  }),
  multiValueLabel: () => ({}),
  group: () => ({}),
};

const chakraComponents = {
  // Control components
  Control: ({
    children,
    innerRef,
    innerProps,
    isDisabled,
    isFocused,
    selectProps: { size, isInvalid, unstyled },
  }) => {
    const inputStyles = useMultiStyleConfig('Input', { size });

    const heights = {
      sm: 8,
      md: 10,
      lg: 12,
    };

    return (
      <StylesProvider value={inputStyles}>
        <Flex
          border="0px"
          ref={innerRef}
          sx={{
            ...inputStyles.field,
            border: unstyled ? 'none' : '1px solid',
            p: 0,
            overflow: 'hidden',
            h: 'auto',
            minH: heights[size],
            cursor: 'pointer',
          }}
          {...innerProps}
          data-focus={isFocused ? true : undefined}
          data-invalid={isInvalid ? true : undefined}
          data-disabled={isDisabled ? true : undefined}
        >
          {children}
        </Flex>
      </StylesProvider>
    );
  },
  MultiValueContainer: ({
    children,
    innerRef,
    innerProps,
    data,
    selectProps,
  }) => (
    <Tag
      ref={innerRef}
      {...innerProps}
      m="0.125rem"
      // react-select Fixed Options example: https://react-select.com/home#fixed-options
      variant={data.isFixed ? 'solid' : 'subtle'}
      colorScheme={data?.colorScheme || selectProps?.colorScheme}
      size={selectProps.size}
    >
      {children}
    </Tag>
  ),
  MultiValueLabel: ({ children, innerRef, innerProps }) => (
    <TagLabel ref={innerRef} {...innerProps}>
      {children}
    </TagLabel>
  ),
  MultiValueRemove: ({
    children, innerRef, innerProps, data: { isFixed },
  }) => {
    if (isFixed) {
      return null;
    }

    return (
      <TagCloseButton ref={innerRef} {...innerProps} tabIndex={-1}>
        {children}
      </TagCloseButton>
    );
  },
  IndicatorSeparator: ({ innerProps, selectProps: { withSeparator } }) => {
    const displayProp = () => {
      if (withSeparator) return 'flex';
      return 'none';
    };
    const display = displayProp();

    return (
      <Divider display={display} {...innerProps} orientation="vertical" opacity="1" />
    );
  },
  ClearIndicator: ({ innerProps, selectProps: { size } }) => (
    <CloseButton {...innerProps} size={size} mx={2} tabIndex={-1} />
  ),
  DropdownIndicator: ({ innerProps, selectProps: { color, isClearable } }) => (
    <Center
      {...innerProps}
      background="transparent"
      p={isClearable ? '0 1rem 0 0' : '0 1rem 0 1rem'}
      sx={{
        // ...addon,
        h: '100%',
        background: 'transparent',
        borderRadius: 0,
        borderWidth: 0,
        cursor: 'pointer',
      }}
    >
      <Icon icon="arrowDown" color={color || '#606060'} height="22px" width="22px" />
    </Center>
  ),
  // Menu components
  MenuPortal: ({ children }) => <Portal>{children}</Portal>,
  Menu: ({ children, ...props }) => {
    const menuStyles = useMultiStyleConfig('Menu');
    return (
      <selectComponents.Menu {...props}>
        <StylesProvider value={menuStyles}>{children}</StylesProvider>
      </selectComponents.Menu>
    );
  },
  MenuList: ({
    innerRef, children, maxHeight, selectProps: { size },
  }) => {
    const { list } = useStyles();
    const chakraTheme = useTheme();

    const borderRadii = {
      sm: chakraTheme.radii.sm,
      md: chakraTheme.radii.md,
      lg: chakraTheme.radii.md,
    };

    return (
      <Box
        sx={{
          ...list,
          maxH: `${maxHeight}px`,
          overflowY: 'auto',
          borderTopRadius: borderRadii.sm,
          borderBottomRadius: borderRadii[size] || borderRadii.md,
          padding: '0px',
          margin: '0px',
        }}
        ref={innerRef}
      >
        {children}
      </Box>
    );
  },
  GroupHeading: ({ innerProps, children }) => {
    const { groupTitle } = useStyles();
    return (
      <Box sx={groupTitle} {...innerProps}>
        {children}
      </Box>
    );
  },
  Option: ({
    innerRef,
    innerProps,
    children,
    isFocused,
    isDisabled,
    selectProps: { size, itemBackgroundColorHovered }, // prop from ChakraReactSelect
  }) => {
    const { item } = useStyles();
    return (
      <Box
        role="button"
        sx={{
          ...item,
          w: '100%',
          padding: '10px',
          textAlign: 'start',
          bg: isFocused ? item._focus.bg : 'transparent',
          fontSize: size,
          ...(isDisabled && item._disabled),
        }}
        ref={innerRef}
        cursor="pointer"
        _selection={{
          background: itemBackgroundColorHovered || 'gray.800',
        }}
        _hover={{
          opacity: 1,
          background: itemBackgroundColorHovered || 'gray.800',
          fontWeight: 'bold',
        }}
        {...innerProps}
        {...(isDisabled && { disabled: true })}
      >
        {children}
      </Box>
    );
  },
};

const ChakraReactSelect = ({
  children,
  styles = {},
  components = {},
  theme = () => ({}),
  size = 'md',
  colorScheme = 'gray',
  isDisabled,
  isInvalid,
  ...props
}) => {
  const chakraTheme = useTheme();

  // Combine the props passed into the component with the props
  // that can be set on a surrounding form control to get
  // the values of isDisabled and isInvalid
  const inputProps = useFormControl({ isDisabled, isInvalid });

  // The chakra theme styles for TagCloseButton when focused
  const closeButtonFocus = chakraTheme.components.Tag.baseStyle.closeButton._focusVisible;
  const multiValueRemoveFocusStyle = {
    background: closeButtonFocus?.bg,
    boxShadow: chakraTheme.shadows[closeButtonFocus?.boxShadow],
  };

  // The chakra UI global placeholder color
  // https://github.com/chakra-ui/chakra-ui/blob/main/packages/theme/src/styles.ts#L13
  const placeholderColor = useColorModeValue(
    chakraTheme.colors.gray[400],
    chakraTheme.colors.whiteAlpha[400],
  );

  const sizeOptions = ['sm', 'md', 'lg'];

  const select = cloneElement(children, {
    components: {
      ...chakraComponents,
      ...components,
    },
    styles: {
      ...chakraStyles,
      ...styles,
    },
    theme: (baseTheme) => {
      const propTheme = theme(baseTheme);

      return {
        ...baseTheme,
        ...propTheme,
        colors: {
          ...baseTheme.colors,
          neutral50: placeholderColor, // placeholder text color
          neutral40: placeholderColor, // noOptionsMessage color
          ...propTheme.colors,
        },
        spacing: {
          ...baseTheme.spacing,
          ...propTheme.spacing,
        },
      };
    },
    colorScheme,
    size: sizeOptions?.[size] || size || 'md',
    multiValueRemoveFocusStyle,
    // isDisabled and isInvalid can be set on the component
    // or on a surrounding form control
    isDisabled: inputProps.disabled,
    isInvalid: !!inputProps['aria-invalid'],
    ...props,
  });

  return select;
};

const Select = forwardRef((props, ref) => (
  <ChakraReactSelect {...props}>
    <ReactSelect ref={ref} />
  </ChakraReactSelect>
));

const AsyncSelect = forwardRef((props, ref) => (
  <ChakraReactSelect {...props}>
    <AsyncReactSelect ref={ref} />
  </ChakraReactSelect>
));

const CreatableSelect = forwardRef((props, ref) => (
  <ChakraReactSelect {...props}>
    <CreatableReactSelect ref={ref} />
  </ChakraReactSelect>
));

export { Select as default, AsyncSelect, CreatableSelect };
