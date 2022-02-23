import PropTypes from 'prop-types';
import { compiler } from 'markdown-to-jsx';
import { Box, Link } from '@chakra-ui/react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx';
import js from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
import emoji from 'emoji-dictionary';
import { useEffect, useState } from 'react';
import tomorrow from './syntaxHighlighter/tomorrow';
import Toc from './toc';
import Heading from '../Heading';
// import Anchor from './Anchor';
// import ChakraHeading from '../Heading';
import Text from '../Text';
import ContentHeading from './ContentHeading';

// okaidia-tomorrow
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('js', js);
SyntaxHighlighter.registerLanguage('html', jsx);
SyntaxHighlighter.registerLanguage('css', css);

const Code = ({ className, children }) => {
  let language;
  if (className.includes('lang-')) {
    language = className.replace('lang-', '');
  } else {
    language = 'highlight';
  }
  console.log(language);
  return (
    <SyntaxHighlighter style={tomorrow} className={language} language={language} showLineNumbers={language !== 'highlight'}>
      {children}
    </SyntaxHighlighter>
  );
};

const MDHeading = ({ children, id }) => (
  <Heading
    id={id}
    size="sm"
    padding="20px 0 15px 0"
    marginBottom="16px"
  >
    {children}
  </Heading>
);

const MDText = ({ children }) => {
  const [haveHighlight, setHaveHighlight] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line array-callback-return
    children.map((child) => {
      if (child && child.type && child.type.name === 'Code') {
        setHaveHighlight(true);
      }
    });
  }, [children]);

  return (
    <Text size="l" className={haveHighlight ? 'text-highlight' : ''} letterSpacing="0.05em" marginBottom="16px" fontWeight="400" lineHeight="24px">
      {children}
    </Text>
  );
};

const MDLink = ({ children, href }) => (
  <Link
    href={href}
    fontSize="15px"
    color="blue.400"
    fontWeight="700"
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </Link>
);

const MDHr = () => (<Box d="none" />);

const MarkDownParser = ({ content, withToc, frontMatter }) => {
  // support for emoji shortcodes
  // exapmle: :heart_eyes: -> 😍
  const emojiSupport = (text) => text.replace(/:\w+:/gi, (name) => emoji.getUnicode(name));
  const contentFormated = emojiSupport(content);

  return (
    <>
      {withToc && (
        <ContentHeading content={frontMatter}>
          <Toc content={content} />
        </ContentHeading>
      )}
      {compiler(contentFormated, {
        wrapper: null,
        overrides: {
          code: {
            component: Code,
          },
          p: {
            component: MDText,
          },
          a: {
            component: MDLink,
          },
          hr: { component: MDHr },
          h2: {
            component: MDHeading,
          },
          h3: {
            component: MDHeading,
          },
          h1: {
            component: MDHeading,
          },
          li: {
            props: {
              className: 'md-bullet',
            },
          },
          img: {
            props: {
              className: 'MDImg',
            },
          },
        },
        slugify: (str) => str.split(' ').join('-').toLowerCase(),
      })}
    </>
  );
};

MarkDownParser.propTypes = {
  content: PropTypes.string,
  withToc: PropTypes.bool,
  frontMatter: PropTypes.objectOf(PropTypes.any),
};
MarkDownParser.defaultProps = {
  content: '',
  withToc: false,
  frontMatter: {},
};

Code.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
Code.defaultProps = {
  className: '',
};

MDHeading.propTypes = {
  children: PropTypes.node.isRequired,
  id: PropTypes.string,
};

MDHeading.defaultProps = {
  id: '',
};

MDText.propTypes = {
  children: PropTypes.node,
};
MDLink.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
};

MDText.defaultProps = {
  children: '',
};

export default MarkDownParser;
