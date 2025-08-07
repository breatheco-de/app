/* eslint-disable react/prop-types */
import { PrismicRichText } from '@prismicio/react';
import PropTypes from 'prop-types';
import { Link, ListItem, UnorderedList, useColorModeValue } from '@chakra-ui/react';
import { useMemo, useCallback } from 'react';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import Heading from './Heading';
import Icon from './Icon';

function Heading1({ children, ...rest }) {
  return (
    <Heading
      as="h1"
      fontSize={{ base: '24px !important', md: '38px !important', lg: '45px !important' }}
      {...rest}
    >
      {children}
    </Heading>
  );
}

function Heading2({ children, ...rest }) {
  return (
    <Heading
      as="h2"
      fontSize={{ base: '18px !important', md: '24px !important', lg: '38px !important' }}
      {...rest}
    >
      {children}
    </Heading>
  );
}

function Heading3({ children, ...rest }) {
  return (
    <Heading
      as="h3"
      fontSize={{ base: '16px !important', md: '20px !important', lg: '24px !important' }}
      {...rest}
    >
      {children}
    </Heading>
  );
}

function List({ children, ...rest }) {
  return (
    <UnorderedList margin="0 auto" {...rest}>
      {children}
    </UnorderedList>
  );
}

function ListItemComponent({ children, color, ...rest }) {
  return (
    <ListItem
      fontSize={{ base: '14px !important', md: '16px !important', lg: '18px !important' }}
      lineHeight="18px"
      margin="16px 0"
      display="flex"
      gridGap="10px"
      alignItems="center"
      color={color}
      {...rest}
    >
      <Icon icon="checked2" color="#25BF6C" width="15px" height="11px" />
      {children}
    </ListItem>
  );
}

function Paragraph({ children, color, descriptionTextAlign, descriptionLineHeight, ...rest }) {
  return (
    <Text
      fontSize={{ base: '14px !important', md: '16px !important', lg: '18px !important' }}
      lineHeight={descriptionLineHeight}
      color={color}
      textAlign={descriptionTextAlign}
      letterSpacing="0px"
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

function Preformatted({ children, ...rest }) {
  return (
    <Text as="pre" {...rest}>{children}</Text>
  );
}

function LabelRenderer({ node, children, grayTextColor }) {
  const { hexColor } = useStyle();

  if (node.data.label === 'highlight-blue') {
    return <span style={{ color: '#A5D9F8' }}>{children}</span>;
  }
  if (node.data.label === 'highlight-dark') {
    return <span style={{ color: hexColor.highlightDark, fontWeight: 'bold' }}>{children}</span>;
  }
  if (node.data.label === 'highlight-blue-default') {
    return <span style={{ color: '#0084FF' }}>{children}</span>;
  }
  if (node.data.label === 'gray_text') {
    return <span style={{ color: grayTextColor }}>{children}</span>;
  }

  return children;
}

function PrismicTextComponent({ field, ...rest }) {
  const { fontColor2 } = useStyle();
  const grayTextColor = useColorModeValue('#3F3F3F', '#D1D1D1');

  const heading1Serializer = useCallback(({ children }) => Heading1({ children, ...rest }), [JSON.stringify(rest)]);
  const heading2Serializer = useCallback(({ children }) => Heading2({ children, ...rest }), [JSON.stringify(rest)]);
  const heading3Serializer = useCallback(({ children }) => Heading3({ children, ...rest }), [JSON.stringify(rest)]);
  const listSerializer = useCallback(({ children }) => List({ children, ...rest }), [JSON.stringify(rest)]);
  const listItemSerializer = useCallback(({ children }) => ListItemComponent({ children, color: fontColor2, ...rest }), [fontColor2, JSON.stringify(rest)]);
  const paragraphSerializer = useCallback(({ children }) => Paragraph({ children, color: fontColor2, ...rest }), [fontColor2, JSON.stringify(rest)]);
  const hyperlinkSerializer = useCallback(({ node, children }) => LinkComponent({ children, href: node.data.url, ...rest }), [JSON.stringify(rest)]);
  const preformattedSerializer = useCallback(({ children }) => Preformatted({ children, ...rest }), [JSON.stringify(rest)]);
  const labelSerializer = useCallback(({ node, children }) => LabelRenderer({ node, children, grayTextColor }), [grayTextColor]);

  const components = useMemo(() => ({
    heading1: heading1Serializer,
    heading2: heading2Serializer,
    heading3: heading3Serializer,
    list: listSerializer,
    listItem: listItemSerializer,
    paragraph: paragraphSerializer,
    hyperlink: hyperlinkSerializer,
    preformatted: preformattedSerializer,
    label: labelSerializer,
  }), [
    heading1Serializer,
    heading2Serializer,
    heading3Serializer,
    listSerializer,
    listItemSerializer,
    paragraphSerializer,
    hyperlinkSerializer,
    preformattedSerializer,
    labelSerializer,
  ]);

  return (
    <PrismicRichText
      field={field}
      components={components}
    />
  );
}

PrismicTextComponent.propTypes = {
  field: PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.arrayOf(PropTypes.any)]),
};

LabelRenderer.propTypes = {
  node: PropTypes.shape({ data: PropTypes.shape({ label: PropTypes.string }) }).isRequired,
  children: PropTypes.node.isRequired,
  grayTextColor: PropTypes.string.isRequired,
};

PrismicTextComponent.defaultProps = {
  field: {},
};

export default PrismicTextComponent;
