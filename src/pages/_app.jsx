import React, { useEffect } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import TagManager from 'react-gtm-module';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Script from 'next/script';
import { ChakraProvider } from '@chakra-ui/react';
import { PrismicProvider } from '@prismicio/react';
import { PrismicPreview } from '@prismicio/next';
import { repositoryName } from '../../prismicio';
import wrapper from '../store';
import theme from '../../styles/theme';
import Navbar from '../common/components/Navbar';
import AuthProvider from '../common/context/AuthContext';
import SessionProvider from '../common/context/SessionContext';
import ConnectionProvider from '../common/context/ConnectionContext';
import Footer from '../common/components/Footer';
import Helmet from '../common/components/Helmet';
import InterceptionLoader from '../common/components/InterceptionLoader';

import '../../styles/globals.css';
import '../../styles/react-tags-input.css';
import '../../styles/markdown.css';
import '../../styles/phoneInput/index.css';
import '../../styles/datePicker.css';
import '../../styles/ipynb.css';

import '@fontsource/lato/100.css';
import '@fontsource/lato/300.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/lato/900.css';
import '@fontsource-variable/space-grotesk';
import modifyEnv from '../../modifyEnv';
import AlertMessage from '../common/components/AlertMessage';

function InternalLinkComponent(props) {
  return <Link {...props} />;
}

function App({ Component, pageProps }) {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const domainName = process.env.DOMAIN_NAME;
  const existsWhiteLabel = typeof domainName === 'string' && domainName !== 'https://4geeks.com';

  const pagePropsData = {
    ...pageProps,
    existsWhiteLabel,
  } || {};

  const isEnvModified = process.env.VERCEL_ENV !== 'production'
    && BREATHECODE_HOST !== process.env.BREATHECODE_HOST;

  const queryClient = new QueryClient();

  useEffect(() => {
    TagManager.initialize({ gtmId: process.env.TAG_MANAGER_KEY });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Helmet
        {...pageProps.seo}
      />
      <Script
        src="https://unpkg.com/rigobot-chat-bubble@0.0.34/dist/main.js"
        onLoad={() => {
          window.rigo.init(process.env.RIGOBOT_HASH, {
            context: '',
          });
        }}
      />
      <ChakraProvider
        resetCSS
        theme={theme}
      >
        <AuthProvider pageProps={pageProps}>
          <SessionProvider>
            <ConnectionProvider>
              <Navbar pageProps={pageProps} translations={pageProps?.translations} />
              {isEnvModified && (
              <AlertMessage
                full
                type="warning"
                message={`You not on the test environment, you are on "${BREATHECODE_HOST}"`}
                borderRadius="0px"
                justifyContent="center"
              />
              )}
              <InterceptionLoader />

              <PrismicProvider internalLinkComponent={InternalLinkComponent}>
                <PrismicPreview repositoryName={repositoryName}>
                  <Component {...pagePropsData} />
                </PrismicPreview>
              </PrismicProvider>

              <Footer pageProps={pagePropsData} />
            </ConnectionProvider>
          </SessionProvider>
        </AuthProvider>
      </ChakraProvider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}

App.propTypes = {
  pageProps: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  Component: PropTypes.elementType.isRequired,
};

export default wrapper.withRedux(App);
