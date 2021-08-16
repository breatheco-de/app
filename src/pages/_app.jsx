/* eslint-disable react/jsx-props-no-spreading */
import '../../styles/globals.css';
import PropTypes from 'prop-types';
import { ChakraProvider } from '@chakra-ui/react';
import { appWithTranslation } from 'next-i18next';
// import { ThemeProvider } from '@chakra-ui/core';
import wrapper from '../store';
import CustomTheme from '../../styles/theme';

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
