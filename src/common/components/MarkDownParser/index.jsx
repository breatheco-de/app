/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
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
import BeforeAfterSlider from '../BeforeAfterSlider';
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
  return (
    <SyntaxHighlighter style={tomorrow} className={language} language={language} showLineNumbers={language !== 'highlight'}>
      {children}
    </SyntaxHighlighter>
  );
};

function doWithDelay(timeout, doCallback) {
  return new Promise((res) => {
    setTimeout(() => {
      doCallback();
      res();
    }, timeout);
  });
}

const BeforeAfter = ({ before, after }) => {
  const [delimerPersentPosition, setDelimerPercentPosition] = useState(50);
  const animationDemo = () => {
    setTimeout(async () => {
      const PARTS = 50;
      const timeSeconds = 0.1;
      const borderMin = 35;
      const delta = (delimerPersentPosition - borderMin) / PARTS;
      const timeout = (timeSeconds / PARTS) * 1000;
      let currentPosition = delimerPersentPosition;

      for (let i = 1; i <= PARTS; i += 1) {
        await doWithDelay(timeout, () => {
          currentPosition -= delta;
          setDelimerPercentPosition(currentPosition);
        });
      }
      await doWithDelay(1000, () => {});
      for (let i = 1; i <= PARTS; i += 1) {
        await doWithDelay(timeout, () => {
          currentPosition += delta;
          setDelimerPercentPosition(currentPosition);
        });
      }
      for (let i = 1; i <= PARTS; i += 1) {
        await doWithDelay(timeout, () => {
          currentPosition += delta;
          setDelimerPercentPosition(currentPosition);
        });
      }
      await doWithDelay(1000, () => {});
      for (let i = 1; i <= PARTS; i += 1) {
        await doWithDelay(timeout, () => {
          currentPosition -= delta;
          setDelimerPercentPosition(currentPosition);
        });
      }
    }, 500);
  };

  return (
    <BeforeAfterSlider
      currentPercentPosition={delimerPersentPosition}
      firstImage={before}
      secondImage={after}
      onVisible={animationDemo}
      onChangePercentPosition={setDelimerPercentPosition}
    />
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
    if (children) {
      // eslint-disable-next-line array-callback-return
      children.map((child) => {
        if (child && child.type && child.type.name === 'Code') {
          setHaveHighlight(true);
        }
      });
    } else {
      console.log('something was wrong');
    }
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
    overflowWrap="anywhere"
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
          code: { component: Code },
          p: { component: MDText },
          a: { component: MDLink },
          hr: { component: MDHr },
          h2: { component: MDHeading },
          h3: { component: MDHeading },
          h1: { component: MDHeading },
          ul: {
            props: { className: 'md-bullet' },
          },
          ol: {
            props: { className: 'md-bullet' },
          },
          img: {
            props: { className: 'MDImg' },
          },
          BeforeAfter,
          'before-after': {
            component: BeforeAfter,
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

BeforeAfter.propTypes = {
  before: PropTypes.string.isRequired,
  after: PropTypes.string.isRequired,
};

export default MarkDownParser;
