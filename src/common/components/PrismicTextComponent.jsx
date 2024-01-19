/* eslint-disable react/prop-types */
import { PrismicRichText } from '@prismicio/react';
import PropTypes from 'prop-types';
import { Link, ListItem, UnorderedList } from '@chakra-ui/react';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import Heading from './Heading';
import Icon from './Icon';

function Heading1({ children, ...rest }) {
  return (
    <Heading as="h1" size="xxl" {...rest}>
      {children}
    </Heading>
  );
}

function Heading2({ children, ...rest }) {
  return (
    <Heading size="xl" {...rest}>
      {children}
    </Heading>
  );
}
function List({ children, ...rest }) {
  return (
    <UnorderedList margin="0 1.5em" {...rest}>
      {children}
    </UnorderedList>
  );
}
function ListItemComponent({ children, color, ...rest }) {
  return (
    <ListItem
      fontSize="sm"
      lineHeight="18px"
      margin="15px 0"
      display="flex"
      gridGap="10px"
      alignItems="center"
      color={color}
      {...rest}
    >
      <Icon icon="checked2" color="#25BF6C" width="12px" height="12px" />
      {children}
    </ListItem>
  );
}
function Paragraph({ children, color, ...rest }) {
  return (
    <Text
      fontSize="14px"
      lineHeight="18px"
      color={color}
      {...rest}
    >
      {children}
    </Text>
  );
}
function LinkComponent({ children, href, ...rest }) {
  return (
    <Link
      variant="default"
      href={href}
      {...rest}
    >
      {children}
    </Link>
  );
}

function PrismicTextComponent({ field, ...rest }) {
  const { fontColor2 } = useStyle();

  return (
    <PrismicRichText
      field={field}
      components={{
        heading1: ({ children }) => Heading1({ children, ...rest }),
        heading2: ({ children }) => Heading2({ children, ...rest }),
        list: ({ children }) => List({ children, ...rest }),
        listItem: ({ children }) => ListItemComponent({ children, color: fontColor2, ...rest }),
        paragraph: ({ children }) => Paragraph({ children, color: fontColor2, ...rest }),
        hyperlink: ({ children, href }) => LinkComponent({ children, href, ...rest }),
      }}
    />
  );
}

PrismicTextComponent.propTypes = {
  field: PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.arrayOf(PropTypes.any)]),
};

PrismicTextComponent.defaultProps = {
  field: {},
};

export default PrismicTextComponent;
