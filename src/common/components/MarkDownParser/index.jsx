import PropTypes from 'prop-types';
import { compiler } from 'markdown-to-jsx';
import { Box, Link } from '@chakra-ui/react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx';
import js from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
import Toc from './toc';
import Heading from '../Heading';
// import Anchor from './Anchor';
// import ChakraHeading from '../Heading';
import Text from '../Text';
import ContentHeading from './ContentHeading';

// okaidia-tomorrow
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('js', js);
SyntaxHighlighter.registerLanguage('html', jsx);
SyntaxHighlighter.registerLanguage('css', css);

const Code = ({ className, children }) => {
  let language;
  if (className.includes('lang-')) {
    language = className.replace('lang-', '');
  } else {
    language = 'bash';
  }

  return (
    <SyntaxHighlighter style={tomorrow} className={language} language={language} wrapLines>
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

const MDText = ({ children }) => (
  <Text size="l" letterSpacing="0.05em" marginBottom="16px" fontWeight="400" lineHeight="24px">
    {children}
  </Text>
);

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

const MarkDownParser = ({ content, withToc, frontMatter }) => (
  <>
    {withToc && (
    <ContentHeading content={frontMatter}>
      <Toc content={content} />
    </ContentHeading>
    )}
    {compiler(content, {
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

MarkDownParser.propTypes = {
  content: PropTypes.string,
  withToc: PropTypes.bool,
  frontMatter: PropTypes.string,
};
MarkDownParser.defaultProps = {
  content: '',
  withToc: false,
  frontMatter: '',
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
