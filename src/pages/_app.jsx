import React, { useState, useEffect } from 'react';
import '../../styles/globals.css';
import '../../styles/markdown.css';
import TagManager from 'react-gtm-module';
import PropTypes from 'prop-types';
import { ChakraProvider } from '@chakra-ui/react';
import { CookiesProvider } from 'react-cookie';
import wrapper from '../store';
import CustomTheme from '../../styles/theme';
import NavbarSession from '../common/components/Navbar';
import AuthProvider from '../common/context/AuthContext';
import Footer from '../common/components/Footer';
import Helmet from '../common/components/Helmet';
import Loading from '../common/components/Loading';
import useAuth from '../common/hooks/useAuth';
import '@fontsource/lato/100.css';
import '@fontsource/lato/300.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/lato/900.css';
import { usePersistent } from '../common/hooks/usePersistent';

function App({ Component, pageProps }) {
  const [cohortSession] = usePersistent('cohortSession', {});
  const [stonlyScript, setStonlyScript] = useState('');
  const { isAuthenticated } = useAuth();
  const [haveSession, setHaveSession] = useState(false);
  const HAVE_SESSION = typeof window !== 'undefined' ? localStorage.getItem('accessToken') !== null : false;

  useEffect(() => {
    TagManager.initialize({ gtmId: process.env.TAG_MANAGER_KEY });
  }, []);

  useEffect(() => {
    if (cohortSession.slug !== undefined) {
      setStonlyScript(`
      console.log('stonlyTrack running')
      stonlyTrack('identify', '${cohortSession?.bc_id}', {
        'academy-role': '${cohortSession?.cohort_role?.toLowerCase()}',
        'cohort-slug': '${cohortSession?.slug}',
        'academy-slug': '${cohortSession?.academy?.slug}',
      });
      `);
    }
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
    <>
      <Helmet {...pageProps} stonlyScript={stonlyScript && stonlyScript} />
      <CookiesProvider>
        <AuthProvider>
          <ChakraProvider resetCSS theme={CustomTheme}>
            <Navbar />
            <Loading />
            <Component {...pageProps} />
            <Footer />
          </ChakraProvider>
        </AuthProvider>
      </CookiesProvider>
    </>
  );
}

App.propTypes = {
  pageProps: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  Component: PropTypes.elementType.isRequired,
};
export default wrapper.withRedux(App);
