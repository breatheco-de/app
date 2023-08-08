import PropTypes from 'prop-types';
import React from 'react';
import parse from 'html-react-parser';
import katex from 'katex';
import { Box } from '@chakra-ui/react';
import 'katex/dist/katex.min.css';

function transform(node) {
  if (typeof node === 'string') {
    const mathRegex = /\${1,2}\s*([^$]+)\s*\${1,2}/g;

    const textWithMath = node.replace(mathRegex, (match, formula) => {
      if (match.startsWith('$$') && match.endsWith('$$')) {
        return `<div class="formula-fragment">${katex.renderToString(formula, { throwOnError: false })}</div>`;
      }
      return katex.renderToString(formula, { throwOnError: false });
    });

    if (textWithMath.length === 0) return null;
    return <span dangerouslySetInnerHTML={{ __html: textWithMath }} />;
  }

  return node;
}

function MathRenderer({ html }) {
  const options = {
    transform,
  };

  const parsedHtml = parse(html, options);
  return (
    <Box className="ipynb-html">
      {parsedHtml}
    </Box>
  );
}

MathRenderer.propTypes = {
  html: PropTypes.string.isRequired,
};

export default MathRenderer;
