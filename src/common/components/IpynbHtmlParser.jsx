import PropTypes from 'prop-types';
import React from 'react';
import parse from 'html-react-parser';
import katex from 'katex';
import { Box } from '@chakra-ui/react';
import 'katex/dist/katex.min.css';

function replace(node) {
  if (node.type === 'text' && node.data) {
    const mathRegex = /\${1,2}([^$]+)\${1,2}/g;

    if (node?.data.startsWith("'$")
      || node?.data.endsWith("$'")
      || node?.data.startsWith("'$$")
      || node?.data.endsWith("$$'")) {
      return node.data;
    }

    const textWithMath = node.data.replace(mathRegex, (match, formula) => {
      if (match.startsWith('$$') && match.endsWith('$$')) {
        return `<div class="formula-fragment">${katex.renderToString(formula, { throwOnError: false })}</div>`;
      }
      return katex.renderToString(formula, { throwOnError: false });
    });

    if (textWithMath.includes('<span class="katex">') && !textWithMath.includes('<pre>')) {
      return <span dangerouslySetInnerHTML={{ __html: textWithMath }} />;
    }

    return textWithMath;
  }
  return node;
}

function MathRenderer({ html }) {
  const options = {
    replace,
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
