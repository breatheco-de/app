/* eslint-disable react/jsx-props-no-spreading */
// import NextLink from 'next/link';
// import { Link as ChakraLink } from '@chakra-ui/react';
import { Link } from '@chakra-ui/next-js';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { setStorageItem } from '../utils';

function NextChakraLink({
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
}) {
  const router = useRouter();

  return (
    <Link
      onClick={() => {
        if (redirectAfterLogin && typeof href === 'string' && href.includes('/login')) {
          setStorageItem('redirect', router?.asPath);
        }
        onClick();
      }}
      href={href}
      as={as}
      replace={replace}
      locale={locale || router?.locale}
      scroll={scroll}
      shallow={shallow}
      {...chakraProps}
    >
      {children}
    </Link>
  );
}

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
  locale: '', // The active locale is automatically prepended. allows for providing a different locale.
  href: '', // The path to navigate to.
  as: 'a', // Optional decorator for the path that will be shown in the browser URL bar.
  replace: false, // Replace the current state instead of adding a new url into the stack. Defaults to `history` `false`
  scroll: true, // scroll to top when changing routes. Defaults to `true`
  shallow: false, // Update the path of the current page without rerunning getStaticProps, getServerSideProps or getInitialProps. Defaults to false
  redirectAfterLogin: false, // Redirect to the last clicked page after login
  onClick: () => {}, // Callback function to be executed when the link is clicked
};

export default NextChakraLink;
