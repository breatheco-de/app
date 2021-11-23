import PropTypes from 'prop-types';

const H1 = ({ children, ...props }) => (
  <div><h1 {...props}>{children}</h1></div>
);

const H2 = ({ children, ...props }) => (
  <div><h2 {...props}>{children}</h2></div>
);

const H3 = ({ children, ...props }) => (
  <div><h3 {...props}>{children}</h3></div>
);

const H4 = ({ children, ...props }) => (
  <div><h4 {...props}>{children}</h4></div>
);

const H5 = ({ children, ...props }) => (
  <div><h5 {...props}>{children}</h5></div>
);

const H6 = ({ children, ...props }) => (
  <div><h6 {...props}>{children}</h6></div>
);

H1.propTypes = {
  children: PropTypes.node,
};
H1.defaultProps = {
  children: '',
};

H2.propTypes = {
  children: PropTypes.node,
};
H2.defaultProps = {
  children: '',
};

H3.propTypes = {
  children: PropTypes.node,
};
H3.defaultProps = {
  children: '',
};

H6.propTypes = {
  children: PropTypes.node,
};
H6.defaultProps = {
  children: '',
};

H4.propTypes = {
  children: PropTypes.node,
};
H4.defaultProps = {
  children: '',
};

H5.propTypes = {
  children: PropTypes.node,
};
H5.defaultProps = {
  children: '',
};

export default {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
};
