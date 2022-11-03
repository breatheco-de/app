/* eslint-disable react/jsx-props-no-spreading */
import NextLink from 'next/link';
import { Link as ChakraLink } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { setStorageItem } from '../../utils';

const NextChakraLink = ({
  href,
  as,
  replace,
  scroll,
  shallow,
  children,
  locale,
  redirectAfterLogin,
  onClick,
  ...chakraProps
}) => {
  const router = useRouter();
  // const { pathname } = router;
  // const isActive = pathname.startsWith(href);

  // if (isActive) {
  //   // eslint-disable-next-line no-param-reassign
  //   chakraProps.className += ' active';
  // }
  return (
    <NextLink
      passHref
      href={href}
      as={as}
      replace={replace}
      locale={locale || router.locale}
      scroll={scroll}
      shallow={shallow}
    >
      <ChakraLink
        onClick={() => {
          if (redirectAfterLogin && typeof href === 'string' && href.includes('/login')) {
            setStorageItem('redirect', router?.asPath);
          }
          onClick();
        }}
        {...chakraProps}
      >
        {children}
      </ChakraLink>
    </NextLink>
  );
};

NextChakraLink.propTypes = {
  href: PropTypes.string,
  locale: PropTypes.string,
  as: PropTypes.string,
  replace: PropTypes.bool,
  scroll: PropTypes.bool,
  shallow: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  redirectAfterLogin: PropTypes.bool,
  onClick: PropTypes.func,
};
NextChakraLink.defaultProps = {
  locale: '',
  href: '',
  as: '',
  replace: false,
  scroll: false,
  shallow: false,
  redirectAfterLogin: false,
  onClick: () => {},
};

export default NextChakraLink;
