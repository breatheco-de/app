import React, { Fragment, useEffect } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { withLDProvider } from 'launchdarkly-react-client-sdk';
import { ReactQueryDevtools } from 'react-query/devtools';
import TagManager from 'react-gtm-module';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Provider } from 'react-redux';
import { ChakraProvider } from '@chakra-ui/react';
import { PrismicProvider } from '@prismicio/react';
import { PrismicPreview } from '@prismicio/next';
import { repositoryName } from '../../prismicio';
import wrapper from '../store';
import CustomTheme from '../../styles/theme';
import Navbar from '../common/components/Navbar';
import AuthProvider from '../common/context/AuthContext';
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
import modifyEnv from '../../modifyEnv';
import AlertMessage from '../common/components/AlertMessage';

function InternalLinkComponent(props) {
  return <Link {...props} />;
}

function App({ Component, ...rest }) {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const { store, props } = wrapper.useWrappedStore(rest);
  const whiteLabelAcademy = process.env.WHITE_LABEL_ACADEMY;
  const existsWhiteLabel = typeof whiteLabelAcademy === 'string' && whiteLabelAcademy.length > 0;

  const pageProps = {
    ...props?.pageProps,
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
      <Provider store={store}>
        <Helmet
          {...pageProps.seo}
        />
        <ChakraProvider resetCSS theme={CustomTheme}>
          <AuthProvider>
            <ConnectionProvider>

              <Fragment key="load-on-client-side">
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
                    <Component {...pageProps} />
                  </PrismicPreview>
                </PrismicProvider>

                <Footer pageProps={pageProps} />
              </Fragment>
            </ConnectionProvider>
          </AuthProvider>
        </ChakraProvider>
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}

App.propTypes = {
  pageProps: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  Component: PropTypes.elementType.isRequired,
};

export default withLDProvider({
  clientSideID: process.env.LD_CLIENT_ID,
  options: {
    bootstrap: 'localStorage',
  },
})(App);
