import { useEffect } from 'react';
import mermaid from 'mermaid';
import PropTypes from 'prop-types';

function MermaidRenderer({ code }) {
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
    mermaid.contentLoaded();
  }, []);

  return <div className="mermaid">{code}</div>;
}

MermaidRenderer.propTypes = {
  code: PropTypes.string.isRequired,
};
export default MermaidRenderer;
