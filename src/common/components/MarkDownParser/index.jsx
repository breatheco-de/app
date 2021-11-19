import PropTypes from 'prop-types';
import { compiler } from 'markdown-to-jsx';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Link } from '@chakra-ui/react';
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx';
import js from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import Heading from './Heading';
import Anchor from './Anchor';
// import ChakraHeading from '../Heading';
import Text from '../Text';

// okaidia-tomorrow
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('js', js);

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
    borderBottom="1px solid hsla(210,18%,87%,1)"
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

const MarkDownParser = ({ content }) => (
  <>
    {compiler(content, {
      wrapper: null,
      overrides: {
        code: {
          component: Code,
        },
        // h1: {
        //   component: MDHeading,
        // },
        // h2: {
        //   component: MDHeading,
        // },
        p: {
          component: MDText,
        },
        a: {
          component: MDLink,
        },
        img: {
          props: {
            className: 'MDImg',
          },
        },

        h1: {
          component: Anchor,
          props: {
            className: 'foo',
          },
        },
        h2: {
          component: Anchor,
          props: {
            className: 'foo',
          },
        },
        h3: {
          component: Anchor,
          props: {
            className: 'foo',
          },
        },
        h4: {
          component: Anchor,
          props: {
            className: 'foo',
          },
        },
        h5: {
          component: Anchor,
          props: {
            className: 'foo',
          },
        },
        h6: {
          component: Anchor,
          props: {
            className: 'foo',
          },
        },
      },
      slugify: (str) => str.split(' ').join('-').toLowerCase(),
    }).filter((item) => typeof item.type === 'function')}
    {compiler(content, {
      wrapper: null,
      overrides: {
        code: {
          component: Code,
        },
        // h1: {
        //   component: MDHeading,
        // },
        // h2: {
        //   component: MDHeading,
        // },
        p: {
          component: MDText,
        },
        a: {
          component: MDLink,
        },
        img: {
          props: {
            className: 'MDImg',
          },
        },

        h1: {
          component: Heading.H1,
          props: {
            className: 'foo',
          },
        },
        h2: {
          component: Heading.H2,
          props: {
            className: 'foo',
          },
        },
        h3: {
          component: Heading.H3,
          props: {
            className: 'foo',
          },
        },
        h4: {
          component: Heading.H4,
          props: {
            className: 'foo',
          },
        },
        h5: {
          component: Heading.H5,
          props: {
            className: 'foo',
          },
        },
        h6: {
          component: Heading.H6,
          props: {
            className: 'foo',
          },
        },
      },
      slugify: (str) => str.split(' ').join('-').toLowerCase(),
    })}
  </>
);

MarkDownParser.propTypes = {
  content: PropTypes.string,
};
MarkDownParser.defaultProps = {
  content: '',
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
  id: PropTypes.string.isRequired,
};
MDText.propTypes = {
  children: PropTypes.node.isRequired,
};
MDLink.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
};

export default MarkDownParser;
