import PropTypes from 'prop-types';

const Anchor = ({ children, ...props }) => (
  <li><a {...props} href={`#${children[0].split(' ').join('-').toLowerCase()}`}>{children}</a></li>
);

Anchor.propTypes = {
  children: PropTypes.node,
};
Anchor.defaultProps = {
  children: '',
};

export default Anchor;
