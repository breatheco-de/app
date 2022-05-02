/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { compiler } from 'markdown-to-jsx';
import { Box, Link } from '@chakra-ui/react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx';
import js from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';

import emoji from 'emoji-dictionary';
import { useEffect, useState } from 'react';
import tomorrow from './syntaxHighlighter/tomorrow';
import BeforeAfterSlider from '../BeforeAfterSlider';
import CallToAction from '../CallToAction';
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
SyntaxHighlighter.registerLanguage('python', python);

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

const MDHeading = ({ children, id, tagType }) => {
  const variantsStyle = {
    h1: 'sm',
    h2: 'sm',
    h3: '18px',
  };

  return (
    <Heading
      as={tagType} // h1, h2, h3, h4, h5, h6
      id={id}
      size={variantsStyle[tagType] || 'sm'}
      padding="20px 0 15px 0"
      marginBottom="16px"
    >
      {children}
    </Heading>
  );
};

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

const MDTable = ({ children }) => (
  <Box
    as="div"
    minW={{ base: '84vw', md: 'auto' }}
    maxW={{ base: '84vw', md: 'auto' }}
    // minW="100vw"
    // maxW="100vw"
    width="100%"
    overflow="auto"
  >
    <Box
      as="table"
    >
      {children}
    </Box>

  </Box>
);

const MDHr = () => (<Box d="none" />);

const MarkDownParser = ({
  content, callToActionProps, withToc, frontMatter, titleRightSide,
}) => {
  const { t } = useTranslation('syllabus');
  const {
    token, assetSlug, assetType, gitpod,
  } = callToActionProps;
  const learnpackActions = t('learnpack.buttons-actions', {
    assetSlug,
    token,
  }, { returnObjects: true });
  // support for emoji shortcodes
  // exapmle: :heart_eyes: -> 😍
  const emojiSupport = (text) => text.replace(/:\w+:/gi, (name) => emoji.getUnicode(name));
  const contentFormated = emojiSupport(content);

  return (
    <>
      <ContentHeading
        titleRightSide={titleRightSide}
        callToAction={gitpod === true && assetType === 'EXERCISE' && (
          <CallToAction
            styleContainer={{
              maxWidth: '800px',
            }}
            buttonStyle={{
              color: 'white',
            }}
            background="blue.default"
            margin="12px 0 20px 0px"
            imageSrc="/static/images/learnpack.png"
            text={t('learnpack.description')}
            width={{ base: '100%', md: 'fit-content' }}
            buttonsData={learnpackActions}
          />
        )}
        content={frontMatter}
      >
        {withToc && (
          <Toc content={content} />
        )}
      </ContentHeading>

      {compiler(contentFormated, {
        wrapper: null,
        overrides: {
          code: { component: Code },
          p: { component: MDText },
          a: { component: MDLink },
          hr: { component: MDHr },
          h1: {
            component: MDHeading,
            props: {
              tagType: 'h2',
            },
          },
          h2: {
            component: MDHeading,
            props: {
              tagType: 'h2',
            },
          },
          h3: {
            component: MDHeading,
            props: {
              tagType: 'h3',
            },
          },
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
          iframe: {
            props: {
              className: 'MDIframe',
            },
          },
          table: {
            component: MDTable,
          },
        },
        slugify: (str) => str.split(' ').join('-').toLowerCase(),
      })}
    </>
  );
};

MarkDownParser.propTypes = {
  content: PropTypes.string,
  callToActionProps: PropTypes.objectOf(PropTypes.any),
  withToc: PropTypes.bool,
  frontMatter: PropTypes.objectOf(PropTypes.any),
  titleRightSide: PropTypes.node,
};
MarkDownParser.defaultProps = {
  content: '',
  callToActionProps: {},
  withToc: false,
  frontMatter: {},
  titleRightSide: null,
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
  tagType: PropTypes.string,
};

MDHeading.defaultProps = {
  id: '',
  tagType: 'h2',
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

MDTable.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MarkDownParser;
