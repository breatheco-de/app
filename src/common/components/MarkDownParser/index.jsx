import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import renderMarkdown from './markdownToHtml';

const MarkDownParser = ({ content }) => {
  const [htmlContent, setHtmlContent] = useState(null);
  useEffect(() => {
    (async () => {
      const html = await renderMarkdown(content);
      if (html) setHtmlContent(html);
    })();
  }, []);
  return (
    <main dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
};

MarkDownParser.propTypes = {
  content: PropTypes.string,
};
MarkDownParser.defaultProps = {
  content: '',
};

export default MarkDownParser;
