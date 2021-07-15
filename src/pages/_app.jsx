import '../../styles/globals.css';
import PropTypes from 'prop-types';

function LearnApp({ Component, pageProps }) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Component {...pageProps} />;
}

LearnApp.propTypes = {
  pageProps: PropTypes.shape({}).isRequired,
  Component: PropTypes.elementType.isRequired,
};

// Component: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
export default LearnApp;
