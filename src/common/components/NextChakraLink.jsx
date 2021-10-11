/* eslint-disable react/jsx-props-no-spreading */
import NextLink from 'next/link';
import { Link as ChakraLink } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const NextChakraLink = ({
  href,
  as,
  replace,
  scroll,
  shallow,
  children,
  locale,
  ...chakraProps
}) => (
  <NextLink
    passHref
    href={href}
    as={as}
    replace={replace}
    locale={locale}
    scroll={scroll}
    shallow={shallow}
  >
    <ChakraLink {...chakraProps}>{children}</ChakraLink>
  </NextLink>
);

NextChakraLink.propTypes = {
  href: PropTypes.string,
  locale: PropTypes.string,
  as: PropTypes.string,
  replace: PropTypes.bool,
  scroll: PropTypes.bool,
  shallow: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
NextChakraLink.defaultProps = {
  locale: 'en',
  href: '',
  as: '',
  replace: false,
  scroll: false,
  shallow: false,
};

export default NextChakraLink;
