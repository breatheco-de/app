/* eslint-disable react/jsx-props-no-spreading */
import '../../styles/globals.css';
import PropTypes from 'prop-types';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { useStore } from '../store';

function LearnApp({ Component, pageProps }) {
  const store = useStore(pageProps.initialReduxState);

  return (
    <Provider store={store}>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

LearnApp.propTypes = {
  pageProps: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  Component: PropTypes.elementType.isRequired,
};
export default LearnApp;

// Component: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
