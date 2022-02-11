/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect } from 'react';
import '../../styles/globals.css';
import PropTypes from 'prop-types';
import { ChakraProvider } from '@chakra-ui/react';
import { appWithTranslation } from 'next-i18next';
import wrapper from '../store';
import CustomTheme from '../../styles/theme';
import NavbarExternal from '../common/components/Navbar/index';
import NavbarSession from '../common/components/Navbar/Session-2';
import AuthProvider from '../common/context/AuthContext';
import Footer from '../common/components/Footer';
import Helmet from '../common/components/Helmet';
import Loading from '../common/components/Loading';
import '@fontsource/lato/100.css';
import '@fontsource/lato/300.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/lato/900.css';

function App({ Component, pageProps }) {
  const [haveSession, setHaveSession] = useState(false);
  const HAVE_SESSION = typeof window !== 'undefined' ? localStorage.getItem('accessToken') !== null : false;

  useEffect(() => {
    // verify if accessToken is in localStorage
    if (HAVE_SESSION) {
      setHaveSession(true);
    }
  }, []);

  const Navbar = () => {
    if (haveSession) {
      return <NavbarSession />;
    }
    return <NavbarExternal />;
  };

  return (
    <>
      <Helmet {...pageProps} />
      <AuthProvider>
        <ChakraProvider resetCSS theme={CustomTheme}>
          {/* <NavbarExternal /> */}
          <Navbar />
          <Loading />
          <Component {...pageProps} />
          <Footer />
        </ChakraProvider>
      </AuthProvider>
    </>
  );
}

App.propTypes = {
  pageProps: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  Component: PropTypes.elementType.isRequired,
};
export default appWithTranslation(wrapper.withRedux(App));
