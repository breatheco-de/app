/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import '../../styles/globals.css';
import PropTypes from 'prop-types';
import { ChakraProvider } from '@chakra-ui/react';
import { appWithTranslation } from 'next-i18next';
import wrapper from '../store';
import CustomTheme from '../../styles/theme';
import '@fontsource/lato/100.css';
import '@fontsource/lato/300.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/lato/900.css';

function LearnApp({ Component, pageProps }) {
  return (
    <ChakraProvider resetCSS={false} theme={CustomTheme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

LearnApp.propTypes = {
  pageProps: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  Component: PropTypes.elementType.isRequired,
};
export default appWithTranslation(wrapper.withRedux(LearnApp));
