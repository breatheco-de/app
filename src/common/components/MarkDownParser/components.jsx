import React from 'react';
import PropTypes from 'prop-types';

export const Image = ({ src, alt }) => (<span className="d-block text-center"><img src={src} alt={alt} /></span>);
Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
};
Image.defaultProps = {
  alt: '',
};

export const Anchor = ({ children, href }) => (<a target="_blank" rel="noopener noreferrer" href={href}>{children[0]}</a>);
Anchor.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export const Link = ({ slug, children }) => (<a href={`#${slug}`}>{children}</a>);
Link.propTypes = {
  children: PropTypes.node.isRequired,
  slug: PropTypes.string.isRequired,
};
