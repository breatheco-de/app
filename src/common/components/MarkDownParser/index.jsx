import PropTypes from 'prop-types';
import Markdown from 'markdown-to-jsx';

const MarkDownParser = ({ content }) => (
  <Markdown>
    {content}
  </Markdown>
);

MarkDownParser.propTypes = {
  content: PropTypes.string,
};
MarkDownParser.defaultProps = {
  content: '',
};

export default MarkDownParser;
