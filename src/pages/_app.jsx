/* eslint-disable react/jsx-props-no-spreading */
import '../../styles/globals.css';
import PropTypes from 'prop-types';
import { ChakraProvider } from '@chakra-ui/react';
import wrapper from '../store';

function LearnApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

LearnApp.propTypes = {
  pageProps: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  Component: PropTypes.elementType.isRequired,
};
export default wrapper.withRedux(LearnApp);
