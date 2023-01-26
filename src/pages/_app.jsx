import React, { useState, useEffect } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
// import { withLDProvider } from 'launchdarkly-react-client-sdk';
import { ReactQueryDevtools } from 'react-query/devtools';
import '../../styles/globals.css';
import '../../styles/react-tags-input.css';
import '../../styles/markdown.css';
import '../../styles/phoneInput/index.css';
import TagManager from 'react-gtm-module';
import PropTypes from 'prop-types';
import { ChakraProvider } from '@chakra-ui/react';
import wrapper from '../store';
import CustomTheme from '../../styles/theme';
import NavbarSession from '../common/components/Navbar';
import AuthProvider from '../common/context/AuthContext';
import ConnectionProvider from '../common/context/ConnectionContext';
import Footer from '../common/components/Footer';
import Helmet from '../common/components/Helmet';
import InterceptionLoader from '../common/components/InterceptionLoader';
import useAuth from '../common/hooks/useAuth';
import '../../styles/datePicker.css';
import '@fontsource/lato/100.css';
import '@fontsource/lato/300.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/lato/900.css';

function App({ Component, pageProps }) {
  const { isAuthenticated } = useAuth();
  const [haveSession, setHaveSession] = useState(false);
  const HAVE_SESSION = typeof window !== 'undefined' ? localStorage.getItem('accessToken') !== null : false;

  const queryClient = new QueryClient();

  useEffect(() => {
    TagManager.initialize({ gtmId: process.env.TAG_MANAGER_KEY });
  }, []);

  useEffect(() => {
    // verify if accessToken exists
    if (isAuthenticated || HAVE_SESSION) {
      setHaveSession(true);
    }
  }, [isAuthenticated, HAVE_SESSION]);

  const Navbar = () => {
    if (HAVE_SESSION) {
      return <NavbarSession translations={pageProps?.translations} haveSession={haveSession} />;
    }
    return <NavbarSession translations={pageProps?.translations} haveSession={false} />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Helmet
        {...pageProps.seo}
      />
      <AuthProvider>
        <ConnectionProvider>
          <ChakraProvider resetCSS theme={CustomTheme}>
            <Navbar />
            <InterceptionLoader />
            <Component {...pageProps} />
            <Footer />
          </ChakraProvider>
        </ConnectionProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}

App.propTypes = {
  pageProps: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  Component: PropTypes.elementType.isRequired,
};
export default wrapper.withRedux(App);
